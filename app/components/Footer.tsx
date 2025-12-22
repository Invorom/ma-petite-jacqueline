export function Footer() {
    return (
        <footer className="flex-none w-full border-t bg-brand-light py-8 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start">
                    <span className="font-display text-3xl text-brand-secondary mb-4">Ma petite Jacqueline</span>
                    <p className="text-sm text-brand-text/80 max-w-xs">
                        Bijoux uniques issus de vaisselle ancienne. Façonnés à la main avec amour.
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-start gap-2 text-sm text-brand-text">
                    <h3 className="font-bold text-lg mb-2">Contact</h3>
                    <p>Sandra Cadet</p>
                    <p>07 66 15 64 97</p>
                    <p>mapetitejacqueline@gmail.com</p>
                </div>

                <div className="flex flex-col items-center md:items-start gap-2 text-sm text-brand-text">
                    <h3 className="font-bold text-lg mb-2">Informations</h3>
                    <p>Click & Collect à l'atelier</p>
                    <p>Livraison soignée</p>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-brand-text/10 text-center text-xs text-brand-text/60">
                © {new Date().getFullYear()} Ma petite Jacqueline. Tous droits réservés.
            </div>
        </footer>
    );
}
