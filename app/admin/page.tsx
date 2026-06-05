import { prisma } from "@/lib/prisma";
import { Package, Users, Star, ShoppingBag, Truck, Store, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function AdminOverviewPage() {
    const [userCount, productCount, reviewCount, promoCount, orders] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.review.count(),
        prisma.promoCode.count(),
        prisma.order.findMany()
    ]);

    const toShipCount = orders.filter(o => o.status === "PAID" && o.shippingMethod === "HOME").length;
    const clickAndCollectCount = orders.filter(o => (o.status === "PAID" || o.status === "PENDING_CASH") && o.shippingMethod === "CLICK_COLLECT").length;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const ordersThisMonth = orders.filter(o => o.createdAt >= firstDayOfMonth);
    const revenueThisMonth = ordersThisMonth.filter(o => o.status === "PAID" || o.status === "SHIPPED" || o.status === "COMPLETED_CASH").reduce((sum, o) => sum + o.totalAmount, 0);
    const paidOrdersThisMonthCount = ordersThisMonth.filter(o => o.status === "PAID" || o.status === "SHIPPED" || o.status === "COMPLETED_CASH").length;

    const currentMonthName = format(now, "MMMM", { locale: fr });

    return (
        <div>
            <h1 className="font-display text-4xl text-brand-secondary mb-8">Vue d'ensemble</h1>

            {/* Alert Section for Orders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/admin/orders" className="block group">
                    <div className="bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors p-6 rounded-2xl border border-brand-primary/30 flex items-center gap-6">
                        <div className="p-4 bg-brand-primary text-white rounded-full group-hover:scale-110 transition-transform">
                            <Truck className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-text/60 uppercase">À Expédier</p>
                            <p className="font-display text-4xl text-brand-primary">{toShipCount}</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/orders" className="block group">
                    <div className="bg-orange-500/10 hover:bg-orange-500/20 transition-colors p-6 rounded-2xl border border-orange-500/30 flex items-center gap-6">
                        <div className="p-4 bg-orange-500 text-white rounded-full group-hover:scale-110 transition-transform">
                            <Store className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-text/60 uppercase">Click & Collect</p>
                            <p className="font-display text-4xl text-orange-600">{clickAndCollectCount}</p>
                        </div>
                    </div>
                </Link>
            </div>

            <h2 className="font-display text-2xl text-brand-secondary mb-6 mt-12 border-b border-brand-secondary/10 pb-4">Statistiques Globales</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex flex-col items-center justify-center text-center gap-2">
                    <div className="p-3 bg-brand-secondary/10 rounded-full text-brand-secondary mb-2">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-brand-text/60 uppercase">CA ({currentMonthName})</p>
                    <p className="font-display text-2xl text-brand-secondary">{revenueThisMonth.toFixed(2)} €</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex flex-col items-center justify-center text-center gap-2">
                    <div className="p-3 bg-brand-secondary/10 rounded-full text-brand-secondary mb-2">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-brand-text/60 uppercase">Ventes ({currentMonthName})</p>
                    <p className="font-display text-2xl text-brand-secondary">{paidOrdersThisMonthCount}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex flex-col items-center justify-center text-center gap-2">
                    <div className="p-3 bg-brand-secondary/10 rounded-full text-brand-secondary mb-2">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-brand-text/60 uppercase">Clients (Total)</p>
                    <p className="font-display text-2xl text-brand-secondary">{userCount}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex flex-col items-center justify-center text-center gap-2">
                    <div className="p-3 bg-brand-secondary/10 rounded-full text-brand-secondary mb-2">
                        <Package className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-brand-text/60 uppercase">Produits (Total)</p>
                    <p className="font-display text-2xl text-brand-secondary">{productCount}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex flex-col items-center justify-center text-center gap-2">
                    <div className="p-3 bg-brand-secondary/10 rounded-full text-brand-secondary mb-2">
                        <Star className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-brand-text/60 uppercase">Avis (Total)</p>
                    <p className="font-display text-2xl text-brand-secondary">{reviewCount}</p>
                </div>
            </div>
        </div>
    );
}
