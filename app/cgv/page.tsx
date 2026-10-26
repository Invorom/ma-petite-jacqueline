export default function CGVPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl h-full overflow-y-auto scroll-smooth">
            <h1 className="font-display text-5xl text-brand-secondary mb-12 text-center">Conditions Générales de Vente (CGV)</h1>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-brand-secondary/10 space-y-8 font-serif text-brand-text/80 leading-relaxed">
                
                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">1. Identité du vendeur</h2>
                    <ul className="space-y-1">
                        <li><strong>Nom :</strong> CADET SANDRA</li>
                        <li><strong>Nom commercial :</strong> Ma petite Jacqueline</li>
                        <li><strong>Statut :</strong> Artisan – Micro-entreprise immatriculée au Répertoire des Métiers</li>
                        <li><strong>Numéro SIRET :</strong> 98478067600016</li>
                        <li><strong>Adresse :</strong> 19 rue de l&apos;église 80200 ASSEVILLERS</li>
                        <li><strong>E-mail :</strong> mapetitejacqueline@gmail.com</li>
                        <li><strong>Site internet :</strong> mapetitejacqueline.com</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">2. Objet</h2>
                    <p>
                        Les présentes Conditions Générales de Vente (CGV) régissent les ventes de bijoux fantaisie artisanaux réalisés à partir de vaisselle ancienne recyclée, proposés sur le site Ma petite Jacqueline.
                        Toute commande passée sur le site implique l’acceptation pleine et entière des présentes CGV.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">3. Produits</h2>
                    <p className="mb-2">Chaque bijou est fabriqué à la main à partir de pièces uniques issues de vaisselle ancienne.</p>
                    <p className="mb-2">De légères variations de couleur, de forme ou de texture peuvent exister d’un article à l’autre : elles témoignent du caractère artisanal et unique de chaque création.</p>
                    <p>Les photographies et descriptions présentent les caractéristiques essentielles des produits. Le rendu des couleurs peut varier selon les écrans.</p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">4. Prix</h2>
                    <p className="mb-2">Les prix sont indiqués en euros (€), toutes taxes comprises (TTC).</p>
                    <p className="mb-2">Les frais de livraison sont précisés avant la validation définitive de la commande.</p>
                    <p>Le vendeur se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés au tarif en vigueur au moment de la commande.</p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">5. Commande</h2>
                    <p className="mb-2">La commande est validée une fois le paiement intégral effectué.</p>
                    <p className="mb-2">Le vendeur confirmera la commande par e-mail.</p>
                    <p>Le vendeur se réserve le droit d’annuler toute commande d’un client avec lequel il existerait un litige antérieur.</p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">6. Paiement</h2>
                    <p className="mb-2">Les paiements sont sécurisés et peuvent être effectués par :</p>
                    <p className="mb-4">Carte bancaire via Stripe, ou espèces lors du retrait à l&apos;atelier après réservation.</p>
                    <p>Les produits demeurent la propriété du vendeur jusqu’au paiement complet du prix.</p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">7. Livraison</h2>
                    <p className="mb-2">Les commandes sont expédiées depuis Assevillers 80200 sous 48 heures après réception du paiement.</p>
                    <p className="mb-2">La livraison à domicile est proposée en France. Les frais sont de 4 €, offerts à partir de 100 € après remise. Le retrait à l&apos;atelier est gratuit. Les cartes cadeaux seules sont dématérialisées et sans frais de port.</p>
                    <p>En cas de retard ou de perte, contactez le vendeur afin de rechercher une solution. Les droits légaux du consommateur restent applicables ; le vendeur reste responsable de la bonne exécution de la commande jusqu&apos;à sa remise dans les conditions prévues par la loi.</p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">8. Droit de rétractation</h2>
                    <p className="mb-4">
                        Conformément aux dispositions des articles L221-18 et suivants du Code de la consommation, l’acheteur dispose, en principe, d’un délai de quatorze (14) jours à compter de la réception du produit pour exercer son droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités.
                    </p>
                    <p className="mb-4">
                        Seuls les biens confectionnés selon les spécifications du client ou nettement personnalisés peuvent relever de l&apos;exception prévue à l&apos;article L221-28 du Code de la consommation. Le caractère artisanal ou unique d&apos;un bijou standard ne supprime pas le droit de rétractation.
                    </p>
                    <p>
                        Pour vous rétracter, adressez une déclaration claire par e-mail ou courrier au vendeur dans le délai légal. Renvoyez ensuite le produit dans les quatorze jours suivant votre notification. Les frais directs de retour sont à votre charge. Le remboursement, incluant les frais de livraison standard initiaux, intervient dans les quatorze jours suivant la notification ; il peut être différé jusqu&apos;à récupération du bien ou réception d&apos;une preuve de son expédition.
                    </p>
                    <p className="mt-4">Modèle de déclaration : « À Sandra Cadet, 19 rue de l&apos;église, 80200 Assevillers, mapetitejacqueline@gmail.com. Je vous notifie ma rétractation de la vente du bien suivant : [produit]. Commandé le [date], reçu le [date]. Nom et adresse du client : [coordonnées]. Date et signature (pour un courrier papier). »</p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">9. Garanties légales</h2>
                    <p className="mb-2">Les produits bénéficient :</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>De la garantie légale de conformité (articles L217-3 à L217-20 du Code de la consommation)</li>
                        <li>De la garantie contre les vices cachés (articles 1641 à 1649 du Code civil).</li>
                    </ul>
                    <p>En cas de produit défectueux, le client doit contacter le vendeur par e-mail à mapetitejacqueline@gmail.com en joignant des photos du produit.</p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">10. Propriété intellectuelle</h2>
                    <p>Les créations, photos, textes et visuels présents sur le site sont la propriété exclusive de Sandra Cadet et ne peuvent être reproduits sans autorisation.</p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">11. Protection des données personnelles</h2>
                    <p className="mb-2">Les informations collectées sont utilisées uniquement pour le traitement des commandes.</p>
                    <p>Le client dispose d’un droit d’accès, de rectification et de suppression de ses données (conformément au RGPD) en écrivant à mapetitejacqueline@gmail.com.</p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b border-brand-secondary/10 pb-2">12. Médiation et litiges</h2>
                    <p>En cas de litige, le client doit d’abord contacter le vendeur.</p>
                </section>

            </div>
        </div>
    );
}
