'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";

export function Footer() {
    const pathname = usePathname();

    if (pathname === '/' || pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="flex-none w-full border-t bg-brand-light py-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 px-4 text-center md:text-left">
                <div className="hidden md:flex flex-col items-center md:items-start">
                    <span className="font-display text-2xl text-brand-secondary mb-2">Ma petite Jacqueline</span>
                    <p className="text-xs text-brand-text/80 max-w-xs">
                        Bijoux uniques issus de vaisselle ancienne. Façonnés à la main avec amour.
                    </p>
                </div>

                <div className="flex flex-col items-center md:items-start gap-1 text-xs text-brand-text">
                    <h3 className="font-bold text-sm mb-1">Contact</h3>
                    <p>Sandra Cadet</p>
                    <p>07 66 15 64 97</p>
                    <p>mapetitejacqueline@gmail.com</p>
                </div>

                <div className="flex flex-col items-center md:items-start gap-1 text-xs text-brand-text">
                    <h3 className="font-bold text-sm mb-1">Informations</h3>
                    <p>Click & Collect à l&apos;atelier</p>
                    <p>Livraison soignée</p>
                    <Link href="/cgv" className="hover:text-brand-secondary transition-colors mt-1 font-medium underline underline-offset-2">
                        Conditions Générales de Vente
                    </Link>
                </div>
            </div>
            <div className="mt-2 pt-2 md:mt-4 md:pt-4 border-t border-brand-text/10 text-center text-[10px] text-brand-text/60">
                © {new Date().getFullYear()} Ma petite Jacqueline. Tous droits réservés.
            </div>
        </footer>
    );
}
