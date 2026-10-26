'use client';

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export function Header() {
    const { cartCount } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-brand-light/95 backdrop-blur supports-[backdrop-filter]:bg-brand-light/60">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                {/* Mobile Menu Trigger (Hidden for now, logic later if needed) */}
                <button className="lg:hidden shrink-0 p-2" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6 text-brand-text" />}
                </button>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <Image src="/logo_jacqueline.png" alt="Logo" width={48} height={48} className="w-12 h-auto shrink-0 object-contain drop-shadow-sm" />
                    <span className="font-display text-2xl sm:text-3xl lg:text-4xl text-brand-secondary mt-1">Ma petite Jacqueline</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-brand-text">
                    <Link href="/livre-d-or" className="hover:text-brand-secondary transition-colors">
                        Livre d&apos;or
                    </Link>
                    <Link href="/vaisselle-de-famille" className="hover:text-brand-secondary transition-colors">
                        Projet &quot;Vaisselle de famille&quot;
                    </Link>
                    <Link href="/shop" className="hover:text-brand-secondary transition-colors font-bold text-brand-secondary">
                        Boutique
                    </Link>
                    <Link href="/account" className="flex items-center gap-1 hover:text-brand-secondary transition-colors">
                        <User className="h-4 w-4" />
                        Compte
                    </Link>
                    <Link href="/cart" className="flex items-center gap-1 hover:text-brand-secondary transition-colors relative">
                        <ShoppingBag className="h-4 w-4" />
                        Achat
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </nav>

                {/* Mobile Actions (simplified) */}
                <div className="flex items-center gap-4 lg:hidden shrink-0">
                    <Link href="/cart" className="relative" aria-label="Panier">
                        <ShoppingBag className="h-5 w-5 text-brand-text" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
            {menuOpen && <nav id="mobile-navigation" className="lg:hidden border-t px-4 py-3 grid gap-3" onClick={() => setMenuOpen(false)}>
                <Link href="/shop">Boutique</Link>
                <Link href="/livre-d-or">Livre d&apos;or</Link>
                <Link href="/vaisselle-de-famille">Vaisselle de famille</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/account">Mon compte</Link>
            </nav>}
        </header>
    );
}
