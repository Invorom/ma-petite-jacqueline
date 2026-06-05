"use client";

import { updateOrderStatus } from "@/app/actions/order";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Truck, Package } from "lucide-react";

export default function OrderActions({ orderId, currentStatus, shippingMethod }: { orderId: string, currentStatus: string, shippingMethod: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (newStatus: string, successMessage: string) => {
        setIsLoading(true);
        const res = await updateOrderStatus(orderId, newStatus);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(successMessage);
        }
        setIsLoading(false);
    };

    if (currentStatus === "SHIPPED" || currentStatus === "COMPLETED_CASH") {
        return (
            <div className="flex flex-col items-center justify-center h-full text-green-600 gap-2 p-4 bg-green-50 rounded-xl">
                <Check className="w-8 h-8" />
                <span className="font-bold text-sm text-center">Terminée</span>
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
        return (
            <div className="flex flex-col justify-center h-full gap-2">
                <p className="text-sm font-medium text-brand-text/60 mb-2">Action requise :</p>
                <button 
                    onClick={() => handleUpdate("COMPLETED_CASH", "Commande marquée comme récupérée !")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 text-sm"
                >
                    <Package className="w-4 h-4" />
                    {isLoading ? "..." : "Commande Récupérée"}
                </button>
            </div>
        );
    }

    return null;
}
