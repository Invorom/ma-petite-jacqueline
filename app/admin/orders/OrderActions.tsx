"use client";

import { updateOrderStatus, retryOrderEmails, cancelCashOrder } from "@/app/actions/order";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Truck, Package } from "lucide-react";

export default function OrderActions({ orderId, currentStatus, shippingMethod, paymentMethod }: { orderId: string, currentStatus: string, shippingMethod: string, paymentMethod: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (newStatus: string, successMessage: string) => {
        setIsLoading(true);
        const res = await updateOrderStatus(orderId, newStatus);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(successMessage);
            if (res.warning) toast.warning(res.warning);
        }
        setIsLoading(false);
    };

    if (["SHIPPED", "COMPLETED_CASH", "COMPLETED", "CANCELED", "PENDING_PAYMENT"].includes(currentStatus)) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-green-600 gap-2 p-4 bg-green-50 rounded-xl">
                <Check className="w-8 h-8" />
                <span className="font-bold text-sm text-center">{currentStatus === "CANCELED" ? "Annulée" : currentStatus === "PENDING_PAYMENT" ? "Paiement en attente" : "Terminée"}</span>
            </div>
        );
    }

    if (shippingMethod === "HOME") {
        return (
            <div className="flex flex-col justify-center h-full gap-2">
                <p className="text-sm font-medium text-brand-text/60 mb-2">Action requise :</p>
                <button 
                    onClick={() => handleUpdate("SHIPPED", "Commande marquée comme expédiée !")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-all disabled:opacity-50 text-sm"
                >
                    <Truck className="w-4 h-4" />
                    {isLoading ? "..." : "Marquer comme Expédiée"}
                </button>
            </div>
        );
    }

    if (shippingMethod === "CLICK_COLLECT") {
        if (currentStatus === "PAID" || currentStatus === "PENDING_CASH") {
            return (
                <div className="flex flex-col justify-center h-full gap-2">
                    <p className="text-sm font-medium text-brand-text/60 mb-2">Action requise :</p>
                    <button 
                        onClick={() => handleUpdate("READY_FOR_PICKUP", "Commande marquée comme prête.")}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-all disabled:opacity-50 text-sm"
                    >
                        <Package className="w-4 h-4" />
                        {isLoading ? "..." : "Marquer comme prête"}
                    </button>
                </div>
            );
        }

        if (currentStatus === "READY_FOR_PICKUP") {
            return (
                <div className="flex flex-col justify-center h-full gap-2">
                    <p className="text-sm font-medium text-brand-text/60 mb-2">Statut : Prête à l&apos;atelier</p>
                    <button 
                        onClick={() => handleUpdate(paymentMethod === "CASH" ? "COMPLETED_CASH" : "COMPLETED", "Commande marquée comme récupérée !")}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 text-sm"
                    >
                        <Check className="w-4 h-4" />
                        {isLoading ? "..." : paymentMethod === "CASH" ? "Confirmer l'encaissement et le retrait" : "Commande récupérée"}
                    </button>
                </div>
            );
        }
    }

    return null;
}

export function OrderMaintenance({ orderId, canCancel }: { orderId: string; canCancel: boolean }) {
    const [busy, setBusy] = useState(false);
    async function handleAction(cancel: boolean) {
        if (cancel && !window.confirm("Annuler cette réservation et remettre les articles en vente ?")) return;
        setBusy(true);
        try {
            const result = cancel ? await cancelCashOrder(orderId) : await retryOrderEmails(orderId);
            if (result.error) toast.error(result.error);
            else toast.success(cancel ? "Réservation annulée." : "E-mails traités.");
        } catch {
            toast.error("Action impossible.");
        } finally {
            setBusy(false);
        }
    }
    return <div className="space-y-2 mt-3">
        <button disabled={busy} onClick={() => handleAction(false)} className="text-sm underline disabled:opacity-50">Réessayer les e-mails</button>
        {canCancel && <button disabled={busy} onClick={() => handleAction(true)} className="block text-sm text-red-700 underline disabled:opacity-50">Annuler la réservation</button>}
    </div>;
}
