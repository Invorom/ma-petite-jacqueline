# Ma petite Jacqueline

Boutique de bijoux en vaisselle ancienne : Next.js 16, React 19, Auth.js, Prisma/SQLite, Stripe Checkout et Resend.

## Deploiement prepare

Choix retenu : petit serveur Linux payant, une instance Docker, SQLite et images sur volumes persistants, Caddy pour HTTPS. Voir [le guide de production](deploy/README.md) pour les comptes de la proprietaire, le domaine, l'installation, les sauvegardes et les mises a jour. La CI GitHub controle le code et le conteneur ; aucun abonnement ni deploiement distant n'est cree automatiquement. Attendre une CI verte et la recette externe avant ouverture.

Une base SQLite avait ete suivie dans Git : elle est retiree du suivi, mais peut subsister dans l'historique precedent. Ne jamais utiliser une base issue de cet historique en production. Si elle contenait des donnees reelles, traiter leur exposition et organiser un nettoyage de l'historique separement ; supprimer le fichier du dernier commit ne suffit pas.

## Plan de mise en ligne

1. Installer Node.js 22 LTS, configurer les variables et initialiser une base persistante.
2. Creer un compte puis lui attribuer le role ADMIN. Ajouter les vrais produits et photos.
3. Configurer Stripe en mode test, son webhook, Resend et un domaine expediteur verifie.
4. Tester achat, stock, code cadeau, retrait en especes, annulation et reception effective des e-mails.
5. Valider les informations legales, les regles commerciales et les sauvegardes.
6. Deployer en HTTPS, remplacer les secrets test par les secrets de production et refaire une commande controlee.

**Ne pas ouvrir les ventes tant que les etapes 3 a 5 ne sont pas validees.** Aucun secret de production n'est fourni dans ce depot.

## Installation locale

Prerequis : Node.js 22 LTS avec npm dans le PATH. Sous Windows, utiliser `npm.cmd` si PowerShell bloque `npm.ps1`.

```powershell
npm ci
Copy-Item .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

Completer `.env` avant de demarrer. Prisma lit `.env`, pas seulement `.env.local`. Ne jamais publier ce fichier. Le site sera accessible sur http://localhost:3000.

| Variable | Utilisation |
| --- | --- |
| `DATABASE_URL` | `file:./dev.db` en local, chemin SQLite absolu sur volume persistant en production |
| `AUTH_SECRET` | Secret aleatoire long, distinct entre test et production |
| `AUTH_URL` | URL publique canonique du site |
| `NEXT_PUBLIC_SITE_URL` | Meme origine, HTTPS obligatoire en production ; URL de retour Stripe et metadonnees |
| `STRIPE_SECRET_KEY` | Cle privee Stripe `sk_test_...`, puis `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret `whsec_...` du webhook correspondant a cet environnement |
| `RESEND_API_KEY` | Cle privee Resend |
| `EMAIL_FROM` | Par exemple `Ma Petite Jacqueline <commandes@votre-domaine.fr>`, domaine verifie dans Resend |
| `CONTACT_EMAIL` | Boite qui recoit les messages de contact |
| `TRUSTED_IP_HEADER` | Facultatif : en-tete IP ecrase par votre proxy de confiance ; vide = quota partage |

Generer `AUTH_SECRET` dans votre terminal, sans l'envoyer dans un chat :

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Sur un reseau d'entreprise, si Prisma signale une chaine de certificats non reconnue, utiliser Node 22 recent avec `NODE_USE_SYSTEM_CA=1` ou un certificat d'entreprise via `NODE_EXTRA_CA_CERTS`. Ne pas desactiver TLS avec `NODE_TLS_REJECT_UNAUTHORIZED=0`.

### Ancienne base existante

La migration initiale est destinee a une base vide. **Sauvegarder et tester sur une copie avant toute adaptation.** Ne pas executer `migrate reset` ni accepter une perte de donnees.

Pour une ancienne base creee avec `db push`, comparer d'abord son schema au nouveau. Sur une copie : `npx prisma db push` sans `--accept-data-loss`, verifier les donnees, puis `npx prisma migrate resolve --applied 20261026000000_initial` pour etablir la reference initiale. Appliquer la procedure validee a la vraie base apres sauvegarde.

Verifier les anciens comptes (normalisation des e-mails), les anciennes commandes en especes (`paymentMethod=CASH`) et les stocks. Les anciennes commandes `READY_FOR_PICKUP` ne permettent pas toujours de retrouver le moyen de paiement : verifier Stripe avant de les classer. Les articles deja supprimes par l'ancien code ne sont pas recuperables sans sauvegarde. Ne pas reemettre automatiquement des cartes cadeaux historiques.

### Premier administrateur

Creer normalement un compte sur `/account`, puis lancer `npm run db:studio` localement et passer son champ `User.role` de `USER` a `ADMIN`. Ne jamais exposer Prisma Studio sur Internet. Les autres roles se gerent ensuite dans `/admin/users`. Aucun mot de passe administrateur par defaut.

Le script `node prisma/seed.js` est reserve aux demonstrations locales, cree des produits `demo-*` et refuse `NODE_ENV=production`. Ne pas l'utiliser pour alimenter la boutique reelle.

## Stripe

Le paiement utilise une redirection vers Stripe Checkout. Aucune cle publique Stripe n'est necessaire dans le navigateur pour ce flux.

En local, avec la CLI Stripe installee et authentifiee :

```powershell
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Renseigner dans `.env` le secret `whsec_...` affiche par la CLI et redemarrer Next.js. Utiliser une carte de test Stripe, par exemple `4242 4242 4242 4242`, une date future et un CVC de test. Ne jamais utiliser une vraie carte en mode test.

En production, creer un endpoint `https://votre-domaine/api/webhook/stripe` dans Stripe pour :

- `checkout.session.completed` : paiement confirme, emission unique des cartes cadeaux et e-mails.
- `checkout.session.expired` : liberation du stock et du code cadeau reserve.

Les secrets CLI, dashboard test et dashboard production sont differents. Les evenements doivent utiliser la version API correspondant au SDK Stripe installe. Verifier les livraisons d'evenements dans le dashboard. Un webhook absent, non signe ou signe avec un mauvais secret est refuse.

Le serveur relit les produits et promotions en base ; il ignore prix, categories et identite fournis par le navigateur. Il reserve le stock et enregistre une commande avant Stripe. La session expire apres 30 minutes. Un retour navigateur ne suffit jamais a declarer une commande payee.

**Incident de creation Stripe :** une erreur reseau peut laisser une commande `PENDING_PAYMENT` sans identifiant de session. Ne pas remettre automatiquement son stock en vente : chercher sa reference `orderId`/`client_reference_id` dans Stripe et verifier l'absence de paiement. Le webhook peut terminer une commande meme si l'enregistrement local de l'identifiant Stripe a echoue. Les reservations orphelines demandent encore une reconciliation operateur ; surveiller cette liste avant lancement.

Les remboursements se font actuellement dans Stripe. Leur synchronisation automatique, le suivi transporteur et les factures ne sont pas implementes : tenir le suivi comptable et traiter les retours manuellement, sans remettre un bijou en stock avant son retour effectif.

## E-mails et contact

Verifier le domaine d'envoi dans Resend (DNS SPF/DKIM et politique DMARC adaptee), configurer `EMAIL_FROM`, puis tester une vraie reception sur une boite externe. `onboarding@resend.dev` n'est pas un expediteur de production pour tous les clients. Une adresse Gmail personnelle ne peut pas servir de domaine expediteur verifie Resend.

Confirmations, cartes cadeaux et changements de statut sont suivis en base. Une erreur du fournisseur n'est pas consideree comme un envoi reussi. Pour Stripe, un echec d'e-mail renvoie une erreur au webhook afin que Stripe reessaie sans dupliquer la commande. L'administration propose aussi **Reessayer les e-mails**. Les cles d'idempotence Resend limitent les doublons, dans la fenetre garantie par le fournisseur ; ce n'est pas une garantie absolue apres une longue panne.

Les codes cadeaux sont egalement consultables dans le compte client. Le formulaire `/contact` envoie a `CONTACT_EMAIL` et n'affiche un succes qu'apres acceptation par Resend. L'acceptation API ne garantit pas la remise en boite : surveiller les rebonds dans Resend.

## Regles commerciales actuelles

- Un exemplaire de chaque reference par panier ; quantite physique decrementee atomiquement lors de la reservation.
- Livraison en France : 4 EUR, offerte a partir de 100 EUR **apres remise**. Retrait gratuit a l'atelier.
- Cartes cadeaux seules : aucun frais de port. Codes non applicables a un panier contenant des cartes cadeaux.
- Promotions fixes ou en pourcentage ; codes `CADEAU-...` a usage unique, entierement consommes au premier achat. **Pas de solde restant** : faire valider cette regle et l'expliquer dans les conditions commerciales avant vente.
- Paiement sur place uniquement en retrait. Les cartes cadeaux achetees en especes ne sont emises qu'apres confirmation de l'encaissement par l'administrateur.
- Annulation d'une reservation en especes non encaissee : remise du stock et du code cadeau en disponibilite.
- Maximum de trois commandes en attente/retrait par compte. La limite anti-abus est un garde-fou, pas une protection complete contre la creation massive de comptes.

## Administration et petits rappels

- `/admin/products` : ajouter/modifier/supprimer les references ; images JPEG, PNG ou WebP, 5 Mo par fichier, 10 fichiers maximum. Pas de SVG/HTML.
- `/admin/promos` : creer les cartes cadeaux vendables, promotions et dates d'expiration.
- `/admin/orders` : adresse et telephone collectes dans Stripe, preparation, expedition, retrait, encaissement en especes et relance e-mail.
- Un produit reserve/vendu est masque de la boutique, mais conserve en base. Ne pas modifier manuellement le stock d'une reservation Stripe active.
- Les prix et descriptions des commandes sont figes a l'achat : modifier un produit ne modifie pas une ancienne commande.
- Le panier est local au navigateur. Un produit dans un panier n'est pas reserve tant que le paiement/la reservation n'a pas commence.
- Les nouveaux mots de passe exigent 12 caracteres minimum ; changer son mot de passe invalide les sessions precedentes. Pas encore de parcours de mot de passe oublie ni de verification d'e-mail.
- Retirer un role administrateur prend effet lors des controles serveur ; chaque action sensible et lecture administrateur reverifie la base.

## Hebergement et sauvegardes

Cette version conserve SQLite et les images dans `public/uploads`. Choisir **une instance Node avec disque persistant**, sauvegardes et HTTPS. Ce n'est pas une configuration Vercel/serverless prete a deployer : le disque ephemere ferait perdre les commandes ou les images. Pour plusieurs instances, migrer la base et les fichiers vers des services partages, et revoir les transactions/quotas.

Configurer une limite de corps HTTP au proxy (25 Mo maximum pour les uploads), des limites de requetes, HSTS en HTTPS, et un en-tete IP fiable ecrase par le proxy. Ne pas faire confiance a un `X-Forwarded-For` fourni directement par Internet. Avec `TRUSTED_IP_HEADER` vide, les quotas IP sont partages et peuvent penaliser plusieurs clients.

Sauvegarder regulierement la base et les uploads ; utiliser une sauvegarde SQLite coherente, pas une copie non controlee pendant une ecriture. Tester une restauration. Eviter de faire tourner la base de production dans OneDrive. Ne pas supprimer un compte ayant des commandes sans politique d'archivage : le schema historique conserve des relations en cascade.

```powershell
npm ci
npm run db:generate
npm run db:migrate
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

Le build telecharge les polices Google via `next/font` : l'acces reseau et la chaine de certificats doivent fonctionner. Les pages privees et commandes ne doivent jamais etre mises en cache par un CDN public.

## Recette avant ouverture

- Inscription, connexion, changement de mot de passe, compte sans droits refusant toutes les actions admin.
- Ajout de photos et produit, filtre toutes categories, navigation mobile, panier persistant apres rechargement.
- Achat Stripe reel **en mode test depuis la boutique**, avec adresse, confirmation, suivi et reception e-mail. `stripe trigger` seul ne cree pas une commande locale correspondante.
- Paiement refuse/annule, expiration de session, deux acheteurs sur une piece unique, livraison apres remise et carte cadeau seule.
- Rejouer le meme evenement Stripe : une seule commande, un seul code cadeau, pas de nouveau decrement de stock.
- Carte cadeau utilisee deux fois refusee ; reservation especes puis encaissement ; annulation et remise du stock.
- Panne Resend puis relance administrateur ; formulaire contact recu ; acces aux codes depuis le compte.
- Sauvegarde/restauration, logs et alertes webhook en erreur.

## Audit et limites restantes

Recette locale effectuee le 26 octobre 2026 : build de production reussi, TypeScript sans erreur, ESLint sans erreur (avertissements non bloquants restants), 18 tests automatises reussis dont transactions SQLite reelles, migration appliquee sur base neuve. Navigateur : navigation mobile, filtre toutes categories, images chargees, panier conserve apres rechargement, connexion, refus d'acces admin sans role et reservation en especes avec retrait du produit du catalogue. Le defilement du compte mobile a ete corrige et verifie. Ces tests utilisent une base `audit.db` ignoree par Git, des produits de demonstration et un compte local de validation ; ce ne sont pas des donnees de production.

Les corrections incluent les paiements falsifiables, les webhooks non signes, les droits manquants sur les promotions, la confiance aux prix navigateur, la perte de stock/historique, les e-mails silencieusement perdus, le contact inactif et le menu mobile inactif. Des tests couvrent montants, reservations, signatures et rejouabilite des webhooks.

L'audit npm du 26 octobre 2026, apres correctifs compatibles, ne signale plus d'alerte critique. Il reste trois alertes elevees dans la chaine d'outillage `prisma -> @prisma/config -> deepmerge-ts`. La correction proposee implique Prisma 7 ; ne pas lancer `npm audit fix --force`. Planifier cette migration et ne pas exposer l'outillage Prisma publiquement. Relancer `npm audit` lors du deploiement : les avis evoluent.

**Juridique a valider avant ouverture :** identite/SIRET/adresse, domaine `.fr` ou `.com`, hebergeur, mediateur de consommation effectivement designe, delais de livraison, TVA, conditions des cartes cadeaux, politique de confidentialite (finalites, bases legales, durees, prestataires, transferts et droits), mentions legales et preuve d'acceptation des CGV. Les clauses de retractation et de responsabilite transporteur manifestement excessives ont ete corrigees, mais cela ne vaut pas validation juridique. La case CGV du panier est une confirmation d'interface, pas encore une preuve versionnee archivee en base.

Les secrets Stripe/Resend, les DNS, un paiement externe de bout en bout, la delivrabilite et le deploiement de production ne peuvent pas etre valides avec ce depot seul. Ne pas confondre tests locaux reussis et autorisation d'ouvrir les ventes.
