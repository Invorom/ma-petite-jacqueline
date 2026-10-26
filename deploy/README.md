# Deploiement sur un petit serveur

## Choix retenu

Une instance Linux avec Docker Compose, SQLite sur volume persistant, images sur un second volume, Caddy pour HTTPS automatique. Stripe encaisse les paiements ; il ne fournit ni serveur ni base de donnees.

Prevoir a titre de budget indicatif 5 a 15 EUR/mois pour un petit VPS, plus domaine et sauvegardes, selon fournisseur, TVA, IPv4 et options. Ce n'est pas un devis. Viser 2 Go de RAM minimum, plutot 4 Go pour compiler Next.js sur le serveur. Comparer les offres actuelles OVHcloud, Hetzner ou Scaleway, et choisir une region europeenne adaptee. La maintenance Linux, les mises a jour et les sauvegardes restent a organiser ; un hebergement gere coute davantage mais reduit cette charge.

Les comptes domaine, hebergement, Stripe et Resend doivent appartenir a la proprietaire de la boutique. Elle active la double authentification puis invite le developpeur avec les droits necessaires. Ne pas partager de mot de passe ni mettre de secret dans GitHub. Aucun compte payant n'est cree par les fichiers de ce depot.

Vercel Hobby est reserve a l'usage personnel non commercial. Render gratuit a un disque ephemere et n'est pas adapte a cette architecture. Un hebergement gratuit a quotas reste envisageable avec une autre architecture (base/images externes), mais ce n'est pas le choix retenu ici.

Sources : https://vercel.com/docs/plans/hobby et https://render.com/docs/free (consultees le 26 octobre 2026).

## Avant le serveur

1. Acheter un domaine au nom de la proprietaire ; choisir un seul nom canonique, par exemple `www.votre-domaine.fr`.
2. Louer le serveur Linux, installer Docker Engine et le plugin Compose depuis leur documentation officielle. Utiliser des cles SSH et un compte d'administration dedie.
3. Ouvrir uniquement SSH (restreint si possible), TCP 80 et 443. Ne pas exposer 3000 ni Prisma Studio. Configurer les mises a jour de securite et la surveillance du disque.
4. Pointer le DNS A vers l'IPv4 du serveur. Ajouter un AAAA uniquement si IPv6 fonctionne. Le domaine doit joindre Caddy directement : pas de proxy CDN ajoute sans revoir la chaine de confiance IP.
5. Conserver la boutique en recette jusqu'a validation de Stripe, Resend et des informations legales. Le demarrage sans ces secrets autorise la consultation mais ne rend pas les ventes pretes.

## Premier lancement (sur Linux)

```sh
git clone https://github.com/Invorom/ma-petite-jacqueline.git
cd ma-petite-jacqueline
cp .env.production.example .env.production
chmod 600 .env.production
```

Editer `.env.production` directement sur le serveur : domaine nu sans protocole dans `SITE_DOMAIN`, adresse de contact certificats dans `ACME_EMAIL`, secret Auth aleatoire de 32 caracteres minimum, puis cles externes quand disponibles. Ne pas copier les secrets locaux de demonstration. Le fichier est ignore par Git et exclu du contexte Docker.

```sh
docker compose --env-file .env.production config --quiet
docker compose --env-file .env.production up -d --build
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs --tail=100 app caddy
curl --fail https://votre-domaine.fr/api/health
```

Ne pas executer `docker compose config` sans `--quiet` dans des logs partages : il peut afficher les secrets resolus. Ne pas publier les sorties contenant des donnees clients.

Le conteneur applique les migrations avant le demarrage ; la premiere execution cree les tables. Il s'execute sans privileges root. La base est dans `/data/shop.db`, les uploads dans `/app/public/uploads`. Caddy sert les nouvelles images directement depuis le volume, sans attendre un rebuild de Next.js. Le port de l'application n'est pas publie et Caddy ecrase `X-Shop-Client-IP` : cet en-tete est le seul utilise pour les quotas IP. Une seule instance applicative doit acceder a SQLite.

`NEXT_PUBLIC_SITE_URL` est fixe au build. Apres changement de domaine, reconstruire l'image et mettre a jour l'endpoint webhook Stripe. Les variables privees sont lues au demarrage. HTTPS necessite des DNS corrects et des ports 80/443 accessibles ; les certificats sont conserves dans le volume Caddy.

La route `/api/health` teste la connexion a la base sans publier les secrets ni le nombre de clients. Elle ne teste pas Stripe ou Resend. Un conteneur unhealthy n'est pas automatiquement repare par Docker : mettre en place une alerte externe et consulter les logs.

## Premier compte administrateur

Creer le compte de la proprietaire depuis `/account`, puis depuis le serveur, apres verification de l'adresse :

```sh
docker compose --env-file .env.production exec app node --input-type=module -e 'import { PrismaClient } from "@prisma/client"; const db = new PrismaClient(); await db.user.update({where:{email:process.argv[1]},data:{role:"ADMIN"}}); await db.$disconnect();' proprietaire@example.com
```

Cette commande ne cree pas de compte ni de mot de passe. Ne jamais promouvoir une adresse qui n'a pas ete verifiee avec la proprietaire. Ne pas ouvrir Prisma Studio publiquement.

## Sauvegardes coherentes

Avant ouverture : automatiser une sauvegarde quotidienne chiffree hors du serveur et tester sa restauration. Les volumes Docker ne sont pas une sauvegarde. Minimum : base SQLite, images et copie chiffree des variables de production. Le fournisseur doit fournir une politique de snapshots/retention ou vous devez l'organiser.

Procedure manuelle simple avec courte interruption des ventes (sur le serveur, depuis le depot) :

```sh
mkdir -p backups
chmod 700 backups
stamp=$(date -u +%Y%m%dT%H%M%SZ)
docker compose --env-file .env.production stop app
docker compose --env-file .env.production run --rm --no-deps --user root --entrypoint sh -v "$PWD/backups:/backup" app -c "umask 077; tar czf /backup/shop-$stamp.tgz -C /data . -C /app/public uploads"
docker compose --env-file .env.production start app
```

Verifier le succes de l'archive **et** le redemarrage meme en cas d'erreur ; ne pas laisser le serveur arrete. Copier ensuite l'archive chiffree vers un autre stockage, avec retention definie. Ne pas faire de copie brute de SQLite pendant les ecritures. Ne pas executer `docker compose down -v` : cela supprime les volumes, donc les commandes et photos.

Tester la restauration sur un serveur isole : arreter l'application, restaurer le contenu base dans le volume `/data` et `uploads/` dans `/app/public`, remettre les droits UID/GID 1000 pour l'application, demarrer avec la version de code correspondante, puis verifier les commandes et photos. Ne pas brancher Stripe de production sur une copie de recette. Une restauration ancienne peut perdre des commandes : rapprocher avec Stripe avant reouverture.

## Mises a jour et CI

La CI GitHub verifie lint, types, tests, migrations, build Next.js, audit des dependances runtime, construction Docker, configuration Caddy et demarrage avec volumes. L'audit bloque les alertes critiques ; les alertes elevees sont affichees dans une etape non bloquante en raison des trois alertes connues de l'outillage Prisma (egalement present pour les migrations dans l'image). Ce compromis doit etre accepte avant production ; une CI verte ne signifie pas absence de vulnerabilites. Attendre le vert et examiner les avertissements avant de deployer. Elle ne deploye pas automatiquement et ne possede aucun secret de production.

Apres sauvegarde et CI verte : `git pull --ff-only`, puis `docker compose --env-file .env.production up -d --build`. Verifier la sante et une page de boutique. Les migrations ne sont pas automatiquement reversibles ; une ancienne image peut etre incompatible avec un schema plus recent. Ne jamais lancer un reset de base pour reparer un deploiement.

Validation locale des conteneurs non effectuee initialement : client Docker present, moteur non demarre. Le job `container` de GitHub Actions doit reussir avant d'utiliser ces fichiers en production.

## Checklist de remise a la proprietaire

- Acces et facturation du domaine/serveur a son nom, 2FA, acces technique delegue.
- Sauvegardes hors serveur et test de restauration, alertes uptime/disque/Stripe.
- Paiement test complet puis controle du mode live, webhook signe, livraison Resend et DNS expediteur.
- Vrais produits et prix, conditions de retour, mediateur, confidentialite et mentions de l'hebergeur.
- Procedure pour commandes abandonnees, remboursements, factures et demandes clients (limites detaillees dans le README principal).
- Responsable identifie pour les mises a jour et incidents. Pas de promesse de production autonome sans maintenance.