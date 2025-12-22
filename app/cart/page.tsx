'use client';

import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";

export default function CartPage() {
    const { cart, removeFromCart, cartTotal } = useCart();

    return (
        <div className="container mx-auto py-16 px-4">
            <h1 className="font-display text-4xl text-brand-secondary text-center mb-12">Mon Panier</h1>

            {cart.length === 0 ? (
                <div className="text-center space-y-6">
                    <p className="text-lg text-brand-text/80">Votre panier est vide.</p>
                    <Link href="/shop" className="inline-block px-8 py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all">
                        Découvrir la boutique
                    </Link>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-6">
                        {cart.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-brand-secondary/10">
                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-xs text-brand-text/40">
                                    Img
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-brand-text">{item.name}</h3>
                                    <p className="text-brand-secondary">{item.price} €</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-brand-text/60">Qté: {item.quantity}</span>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Checkout Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10">
                            <h2 className="font-bold text-xl mb-4 text-brand-secondary">Récapitulatif</h2>
                            <div className="flex justify-between items-center mb-4 text-brand-text">
                                <span>Total</span>
                                <span className="font-bold text-lg">{cartTotal} €</span>
                            </div>

                            <button className="w-full py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all shadow-md mb-4">
                                Valider la commande
                            </button>

                            <p className="text-xs text-brand-text/60 text-center">
                                Paiement sécurisé non implémenté (Démo).
                            </p>
                        </div>

                        {/* Click & Collect Info Block */}
                        <div className="bg-brand-light/50 p-6 rounded-2xl border border-brand-secondary/20 dashed">
                            <h3 className="font-bold text-brand-secondary mb-2">Click & Collect</h3>
                            <p className="text-sm text-brand-text/80 mb-2">
                                Pour les clientes et clients de proximité, je propose le click and collect à l'atelier.
                            </p>
                            <p className="text-sm text-brand-text/80">
                                Un moyen simple d'éviter les frais de port. Nous conviendrons ensemble d'un créneau de retrait.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
