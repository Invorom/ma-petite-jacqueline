import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import OrderActions from "./OrderActions";
import { Package, Truck, Store, CheckCircle, Clock } from "lucide-react";

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
    });

    // Grouping logic
    const toShip = orders.filter(o => o.status === "PAID" && o.shippingMethod === "HOME");
    const clickAndCollect = orders.filter(o => (o.status === "PAID" || o.status === "PENDING_CASH" || o.status === "READY_FOR_PICKUP") && o.shippingMethod === "CLICK_COLLECT");
    const completed = orders.filter(o => o.status === "SHIPPED" || o.status === "COMPLETED_CASH" || o.status === "COMPLETED");

    return (
        <div>
            <h1 className="font-display text-4xl text-brand-secondary mb-12 flex items-center gap-4">
                <Package className="w-10 h-10" />
                Gestion des Commandes
            </h1>

            <div className="space-y-16">
                
                {/* 1. À Expédier */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-brand-secondary/20 pb-4">
                        <Truck className="w-6 h-6 text-brand-primary" />
                        <h2 className="font-display text-2xl text-brand-secondary">À Expédier (Livraison à domicile)</h2>
                        <span className="bg-brand-primary text-white text-sm font-bold px-3 py-1 rounded-full">{toShip.length}</span>
                    </div>
                    {toShip.length === 0 ? (
                        <p className="text-brand-text/60 italic">Aucune commande à expédier.</p>
                    ) : (
                        <div className="grid gap-6">
                            {toShip.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    )}
                </section>

                {/* 2. Click & Collect */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-brand-secondary/20 pb-4">
                        <Store className="w-6 h-6 text-orange-500" />
                        <h2 className="font-display text-2xl text-brand-secondary">Click & Collect (À préparer)</h2>
                        <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">{clickAndCollect.length}</span>
                    </div>
                    {clickAndCollect.length === 0 ? (
                        <p className="text-brand-text/60 italic">Aucune commande Click & Collect en attente.</p>
                    ) : (
                        <div className="grid gap-6">
                            {clickAndCollect.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    )}
                </section>

                {/* 3. Terminées */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-brand-secondary/20 pb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h2 className="font-display text-2xl text-brand-secondary">Historique / Terminées</h2>
                        <span className="bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">{completed.length}</span>
                    </div>
                    {completed.length === 0 ? (
                        <p className="text-brand-text/60 italic">Aucune commande terminée.</p>
                    ) : (
                        <div className="grid gap-6 opacity-70">
                            {completed.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function OrderCard({ order }: { order: any }) {
    const items = JSON.parse(order.itemsJson || "[]");
    
    return (
        <div className="bg-white border border-brand-secondary/10 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-brand-secondary">
                            Commande {order.id.substring(order.id.length - 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-brand-text/60">
                            Passée le {format(new Date(order.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-xl text-brand-secondary">{order.totalAmount.toFixed(2)} €</div>
                        {order.status === "PENDING_CASH" ? (
                            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-md mt-1 inline-block">
                                À encaisser sur place
                            </span>
                        ) : order.status === "READY_FOR_PICKUP" ? (
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md mt-1 inline-block">
                                Prête à l'atelier
                            </span>
                        ) : order.status === "COMPLETED_CASH" ? (
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md mt-1 inline-block">
                                Encaissée sur place
                            </span>
                        ) : (
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md mt-1 inline-block">
                                Déjà payée (Carte)
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-brand-light/30 rounded-xl p-4">
                    <p className="font-bold text-sm mb-2 text-brand-secondary">Client :</p>
                    <p className="text-sm">{order.user.name || "Client"} - <a href={`mailto:${order.user.email}`} className="text-brand-primary hover:underline">{order.user.email}</a></p>
                </div>

                <div>
                    <p className="font-bold text-sm mb-2 text-brand-secondary">Produits ({items.length}) :</p>
                    <ul className="space-y-2">
                        {items.map((item: any, idx: number) => (
                            <li key={idx} className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-brand-light rounded overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-brand-secondary/10" />
                                    )}
                                </div>
                                <span className="flex-1 font-medium">{item.name || item.category}</span>
                                <span className="text-brand-text/60">{item.price} €</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="w-full md:w-64 flex flex-col justify-end border-t md:border-t-0 md:border-l border-brand-secondary/10 pt-4 md:pt-0 md:pl-6">
                <OrderActions orderId={order.id} currentStatus={order.status} shippingMethod={order.shippingMethod} />
            </div>
        </div>
    );
}
