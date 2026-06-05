"use client";

import { useState, useTransition } from "react";
import { updateProduct } from "@/app/actions/product";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { categories } from "@/lib/products";

export function EditProductForm({ product }: { product: any }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            try {
                const result = await updateProduct(product.id, formData);
                if (result?.success) {
                    toast.success("Produit mis à jour !");
                    router.push("/admin/products");
                }
            } catch (error) {
                toast.error("Erreur lors de la mise à jour");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10">
            <div>
                <label className="block text-sm font-bold text-brand-secondary mb-1">Nom du bijou</label>
                <input required type="text" name="name" defaultValue={product.name} className="w-full border rounded-lg p-2 bg-brand-light/20" />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-brand-secondary mb-1">Catégorie</label>
                {product.category === "cartes-cadeaux" ? (
                    <>
                        <input type="hidden" name="category" value="cartes-cadeaux" />
                        <input type="text" disabled value="Carte Cadeau" className="w-full border rounded-lg p-2 bg-brand-light/50 text-brand-text/50 cursor-not-allowed" />
                    </>
                ) : (
                    <select name="category" defaultValue={product.category} className="w-full border rounded-lg p-2 bg-brand-light/20">
                        {categories
                            .filter(cat => cat.id !== 'all' && cat.id !== 'cartes-cadeaux')
                            .map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))
                        }
                    </select>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold text-brand-secondary mb-1">Prix (€)</label>
                <input required type="number" step="0.01" name="price" defaultValue={product.price} className="w-full border rounded-lg p-2 bg-brand-light/20" />
            </div>

            <div>
                <label className="block text-sm font-bold text-brand-secondary mb-1">Description (L'histoire de la pièce)</label>
                <textarea required name="description" rows={5} defaultValue={product.description} className="w-full border rounded-lg p-2 bg-brand-light/20"></textarea>
            </div>

            <button disabled={isPending} className="w-full py-3 bg-brand-secondary text-white rounded-xl font-bold hover:bg-brand-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sauvegarder les modifications"}
            </button>
        </form>
    );
}
