"use client";

import { useTransition } from "react";
import { PlusCircle } from "lucide-react";
import { createCustomGiftCard, createCustomPromo } from "@/app/actions/promo";
import { toast } from "sonner";

export function GiftCardForm() {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            const result = await createCustomGiftCard(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Carte cadeau créée avec succès !");
                (e.target as HTMLFormElement).reset();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-bold text-brand-text/80 uppercase">Montant de la carte (€)</label>
                <input type="number" step="1" name="amount" required className="w-full mt-1 px-4 py-2 border rounded-xl" />
            </div>
            <button disabled={isPending} className="w-full flex items-center justify-center gap-2 py-3 bg-brand-secondary text-white rounded-xl font-bold hover:bg-brand-primary transition-all mt-4 disabled:opacity-50">
                <PlusCircle className="w-5 h-5" />
                Créer cette carte
            </button>
        </form>
    );
}

export function PromoCodeForm() {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            const result = await createCustomPromo(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Code promo créé avec succès !");
                (e.target as HTMLFormElement).reset();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-bold text-brand-text/80 uppercase">Code Promo (ex: BIENVENUE10)</label>
                <input type="text" name="code" required className="w-full mt-1 px-4 py-2 border rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-brand-text/80 uppercase">Valeur</label>
                    <input type="number" step="0.01" name="amount" required className="w-full mt-1 px-4 py-2 border rounded-xl" />
                </div>
                <div>
                    <label className="text-xs font-bold text-brand-text/80 uppercase">Type</label>
                    <select name="type" className="w-full mt-1 px-4 py-2 border rounded-xl bg-white">
                        <option value="PERCENTAGE">Pourcentage (%)</option>
                        <option value="FIXED">Montant Fixe (€)</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-brand-text/80 uppercase">Date d'expiration (optionnelle)</label>
                <input type="date" name="expiresAt" className="w-full mt-1 px-4 py-2 border rounded-xl" />
            </div>
            <button disabled={isPending} className="w-full flex items-center justify-center gap-2 py-3 bg-brand-secondary text-white rounded-xl font-bold hover:bg-brand-primary transition-all mt-4 disabled:opacity-50">
                <PlusCircle className="w-5 h-5" />
                Créer ce code
            </button>
        </form>
    );
}
