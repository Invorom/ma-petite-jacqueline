'use client';

import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { Trash2, Gift, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { validatePromo, processCheckout } from "@/app/actions/promo";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function CartPage() {
    const { data: session } = useSession();
    const { cart, removeFromCart, cartTotal, clearCart } = useCart();
    
    const [promoInput, setPromoInput] = useState("");
    const [appliedPromo, setAppliedPromo] = useState<{ code: string, amount: number, type: string } | null>(null);
    const [promoError, setPromoError] = useState("");
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [generatedCodes, setGeneratedCodes] = useState<{code: string, amount: number}[] | null>(null);

    useEffect(() => {
        if (appliedPromo && cart.some(item => item.category === "cartes-cadeaux")) {
            setAppliedPromo(null);
            toast.error("Le code promo a été retiré car il n'est pas applicable avec une carte cadeau.");
        }
    }, [cart, appliedPromo]);

    const handleApplyPromo = async () => {
        setPromoError("");
        if (!promoInput.trim()) return;
        
        if (cart.some(item => item.category === "cartes-cadeaux")) {
            setPromoError("Les codes promos ne sont pas applicables pour l'achat de cartes cadeaux.");
            return;
        }

        const result = await validatePromo(promoInput.trim());
        if (result.error) {
            setPromoError(result.error);
        } else if (result.success && result.amount && result.type) {
            setAppliedPromo({ code: promoInput.trim(), amount: result.amount, type: result.type });
            setPromoInput("");
        }
    };

    const handleCheckout = async () => {
        if (!session) {
            toast.error("Vous devez être connecté pour valider la commande.");
            return;
        }
        setIsCheckingOut(true);
        const items = cart.map(item => ({ id: item.id, category: item.category, price: item.price, name: item.name, image: item.image || "" }));
        
        try {
            const userEmail = session.user?.email || "";
            const result = await processCheckout(items, appliedPromo?.code, userEmail);
            if (result.success) {
                setGeneratedCodes(result.generatedCodes || []);
                clearCart();
            } else {
                toast.error("Erreur lors de la validation");
            }
        } catch (error) {
            toast.error("Erreur lors de la validation");
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (generatedCodes) {
        const mailBody = `Bonjour,\n\nVoici vos codes de cartes cadeaux Ma petite Jacqueline :\n\n${generatedCodes.map(c => `- ${c.code} (${c.amount} €)`).join('\n')}\n\nÀ très vite sur la boutique !`;
        const mailtoLink = `mailto:?subject=Vos Cartes Cadeaux Ma petite Jacqueline&body=${encodeURIComponent(mailBody)}`;

        return (
            <div className="container mx-auto py-16 px-4 max-w-2xl text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h1 className="font-display text-4xl text-brand-secondary mb-4">Commande validée !</h1>
                <p className="text-brand-text/80 mb-2">Merci pour votre achat. Un email de confirmation a été envoyé à <strong>{session?.user?.email}</strong>.</p>
                
                {generatedCodes.length > 0 && (
                    <div className="bg-brand-light/30 border border-brand-secondary/20 p-8 rounded-2xl mb-8 mt-8">
                        <h2 className="font-bold text-xl text-brand-secondary mb-4 flex items-center justify-center gap-2">
                            <Gift className="w-5 h-5" /> Vos Cartes Cadeaux
                        </h2>
                        <p className="text-sm text-brand-text/80 mb-6">Voici les codes générés pour vos cartes cadeaux. Conservez-les précieusement :</p>
                        <div className="space-y-3 mb-6">
                            {generatedCodes.map((c, i) => (
                                <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl border border-brand-secondary/10 shadow-sm">
                                    <span className="font-mono font-bold text-lg text-brand-secondary">{c.code}</span>
                                    <span className="font-bold text-brand-text">{c.amount} €</span>
                                </div>
                            ))}
                        </div>
                        <a href={mailtoLink} className="inline-block text-sm text-brand-secondary underline hover:text-brand-primary transition-colors">
                            Partager ces codes par email à un proche
                        </a>
                    </div>
                )}
                
                <Link href="/shop" className="inline-block px-8 py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all mt-4">
                    Retour à la boutique
                </Link>
            </div>
        );
    }

    // Calculer le total éligible aux réductions (tout sauf les cartes cadeaux)
    const eligibleTotal = cart
        .filter(item => item.category !== "cartes-cadeaux")
        .reduce((sum, item) => sum + item.price, 0);

    const nonEligibleTotal = cartTotal - eligibleTotal;

    const discountAmount = appliedPromo 
        ? (appliedPromo.type === "PERCENTAGE" ? (eligibleTotal * appliedPromo.amount / 100) : Math.min(appliedPromo.amount, eligibleTotal))
        : 0;

    const finalTotal = Math.max(0, eligibleTotal - discountAmount) + nonEligibleTotal;

    return (
        <div className="container mx-auto py-16 px-4 h-full overflow-y-auto scroll-smooth">
            <h1 className="font-display text-4xl text-brand-secondary text-center mb-12">Mon Panier</h1>

            {cart.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-3xl shadow-sm border border-brand-secondary/10 max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-brand-light/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Gift className="w-10 h-10 text-brand-secondary/40" />
                    </div>
                    <h2 className="font-display text-3xl text-brand-secondary mb-4">Votre panier est bien vide...</h2>
                    <p className="text-lg text-brand-text/60 mb-8 max-w-md mx-auto">Il semblerait que vous n'ayez pas encore trouvé la pièce unique qui fera battre votre cœur.</p>
                    <Link href="/shop" className="inline-block px-8 py-4 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all hover:scale-105 transform duration-200 shadow-sm">
                        Découvrir la boutique
                    </Link>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-brand-secondary/10">
                                <div className="w-16 h-16 bg-brand-light/50 rounded-md flex items-center justify-center overflow-hidden">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Gift className="w-6 h-6 text-brand-secondary/40" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-brand-text">{item.name}</h3>
                                    <p className="text-sm text-brand-text/60 capitalize">{item.category.replace("-", " ")}</p>
                                </div>
                                <div className="font-bold text-brand-secondary text-lg">
                                    {item.price.toFixed(2)} €
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Checkout Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10">
                            <h2 className="font-bold text-xl mb-6 text-brand-secondary">Récapitulatif</h2>
                            
                            <div className="space-y-3 mb-6 border-b border-brand-secondary/10 pb-6">
                                <div className="flex justify-between items-center text-brand-text/80">
                                    <span>Sous-total</span>
                                    <span>{cartTotal.toFixed(2)} €</span>
                                </div>
                                
                                {appliedPromo && (
                                    <div className="flex justify-between items-start text-green-600 font-medium gap-4">
                                        <div className="flex items-start gap-2">
                                            <button 
                                                onClick={() => {
                                                    setAppliedPromo(null);
                                                    setPromoInput("");
                                                }}
                                                className="text-red-400 hover:text-red-600 transition-colors mt-1 flex-shrink-0"
                                                title="Retirer le code"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="flex flex-col">
                                                <span>Code promo</span>
                                                <span className="text-sm opacity-80">({appliedPromo.code})</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span>- {discountAmount.toFixed(2)} €</span>
                                            {appliedPromo.type === "PERCENTAGE" && (
                                                <span className="text-sm opacity-80">({appliedPromo.amount}%)</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {appliedPromo && cart.some(item => item.category === "cartes-cadeaux") && (
                                    <div className="text-xs text-orange-500 italic mt-2 text-right">
                                        (Les codes promos ne s'appliquent pas aux cartes cadeaux)
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end mb-6 text-brand-text">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-2xl text-brand-secondary">{finalTotal.toFixed(2)} €</span>
                            </div>

                            {/* Promo Code Input */}
                            {!appliedPromo && (
                                <div className="mb-6 space-y-2">
                                    <label className="text-xs font-bold text-brand-text/80 uppercase">Avez-vous un code promo ?</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={promoInput}
                                            onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                            placeholder="Code" 
                                            className="flex-1 min-w-0 px-4 py-2 border rounded-xl text-sm"
                                        />
                                        <button 
                                            onClick={handleApplyPromo}
                                            className="flex-none px-4 py-2 bg-brand-light text-brand-text rounded-xl text-sm font-bold hover:bg-brand-secondary/20 transition-colors"
                                        >
                                            Appliquer
                                        </button>
                                    </div>
                                    {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                                </div>
                            )}

                            {!session ? (
                                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                                    <p className="text-sm text-orange-800 mb-3">Vous devez être connecté pour valider votre commande.</p>
                                    <Link href="/auth/login" className="inline-block px-4 py-2 bg-brand-secondary text-white rounded-lg text-sm font-bold hover:bg-brand-primary transition-colors">
                                        Se connecter
                                    </Link>
                                </div>
                            ) : null}

                            <button 
                                onClick={handleCheckout}
                                disabled={isCheckingOut || !session}
                                className="w-full py-4 bg-brand-secondary text-white rounded-xl font-bold hover:bg-brand-primary transition-all shadow-md mb-4 disabled:opacity-50"
                            >
                                {isCheckingOut ? "Validation..." : "Valider la commande"}
                            </button>

                            <p className="text-xs text-brand-text/50 text-center">
                                Paiement fictif (Démo). En validant, vous générez les codes cadeaux.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
