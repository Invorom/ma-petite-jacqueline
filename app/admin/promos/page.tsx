import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { Package, PlusCircle, Trash2 } from "lucide-react";
import { deletePromoCode } from "@/app/actions/promo";
import { GiftCardForm, PromoCodeForm } from "./PromoForms";

export default async function AdminPromosPage() {
    await requireAdmin();
    const promoCodes = await prisma.promoCode.findMany({
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="pb-16">
            <h1 className="font-display text-4xl text-brand-secondary mb-8">Gestion des Cartes & Codes</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Actions / Setup */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-brand-light/50 p-6 rounded-2xl shadow-sm border border-brand-secondary/20 dashed">
                        <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b pb-2">Générer une Carte Cadeau sur mesure</h2>
                        <GiftCardForm />
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 mt-6">
                        <h2 className="font-display text-2xl text-brand-secondary mb-4 border-b pb-2">Créer un code promo personnalisé</h2>
                        <PromoCodeForm />
                    </div>

                    <div className="bg-brand-light/50 p-6 rounded-2xl border border-brand-secondary/20 dashed mt-6">
                        <h3 className="font-bold text-brand-secondary mb-2">Comment ça marche ?</h3>
                        <p className="text-sm text-brand-text/80 mb-2">
                            Les <strong className="text-brand-secondary">Cartes Cadeaux</strong> apparaissent dans la boutique comme des produits. Elles n&apos;ont pas de date de péremption.
                        </p>
                        <p className="text-sm text-brand-text/80">
                            Les <strong className="text-brand-secondary">Codes Promos</strong> générés ici ou suite à l&apos;achat d&apos;une carte cadeau sont temporaires (s&apos;ils ont une date d&apos;expiration) et s&apos;utilisent dans le panier.
                        </p>
                    </div>
                </div>

                {/* Promo Codes List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-brand-secondary/10 overflow-hidden">
                    <h2 className="font-display text-2xl text-brand-secondary p-6 border-b border-brand-secondary/10 bg-brand-light/20">
                        Codes Promo Générés ({promoCodes.length})
                    </h2>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-brand-light/50 text-brand-text/60 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Valeur</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-secondary/10">
                                {promoCodes.map(promo => {
                                    const isExpired = promo.expiresAt && promo.expiresAt < new Date();
                                    return (
                                        <tr key={promo.id} className="hover:bg-brand-light/20 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-brand-secondary">
                                                {promo.code}
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                {promo.type === "PERCENTAGE" ? `${promo.amount}%` : `${promo.amount.toFixed(2)} €`}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    promo.isUsed ? 'bg-gray-100 text-gray-700' : 
                                                    isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {promo.isUsed ? 'Utilisé' : isExpired ? 'Périmé' : 'Actif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <form action={async () => {
                                                    "use server";
                                                    const { deletePromoCode } = await import("@/app/actions/promo");
                                                    await deletePromoCode(promo.id);
                                                }}>
                                                    <button type="submit" className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Supprimer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {promoCodes.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-brand-text/50 italic">
                                            Aucun code promo généré pour le moment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
