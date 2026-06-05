import { prisma } from "@/lib/prisma";
import { Package, Users, Star, Ticket } from "lucide-react";

export default async function AdminOverviewPage() {
    const [userCount, productCount, reviewCount, promoCount] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.review.count(),
        prisma.promoCode.count()
    ]);

    return (
        <div>
            <h1 className="font-display text-4xl text-brand-secondary mb-8">Vue d'ensemble</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex items-center gap-4">
                    <div className="p-4 bg-brand-secondary/10 rounded-full text-brand-secondary">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-brand-text/60 uppercase">Utilisateurs</p>
                        <p className="font-display text-3xl text-brand-secondary">{userCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex items-center gap-4">
                    <div className="p-4 bg-brand-secondary/10 rounded-full text-brand-secondary">
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-brand-text/60 uppercase">Produits</p>
                        <p className="font-display text-3xl text-brand-secondary">{productCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex items-center gap-4">
                    <div className="p-4 bg-brand-secondary/10 rounded-full text-brand-secondary">
                        <Star className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-brand-text/60 uppercase">Avis laissés</p>
                        <p className="font-display text-3xl text-brand-secondary">{reviewCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex items-center gap-4">
                    <div className="p-4 bg-brand-secondary/10 rounded-full text-brand-secondary">
                        <Ticket className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-brand-text/60 uppercase">Codes Promo</p>
                        <p className="font-display text-3xl text-brand-secondary">{promoCount}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
