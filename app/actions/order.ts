"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authorization";
import { issueGiftCards, releaseOrder } from "@/lib/checkout";
import { sendOrderEmails } from "@/lib/email";

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        await requireAdmin();
        await prisma.$transaction(async transaction => {
            const order = await transaction.order.findUniqueOrThrow({ where: { id: orderId } });
            if (order.status === newStatus) return;
            const allowed = order.shippingMethod === "HOME"
                ? order.status === "PAID" && newStatus === "SHIPPED"
                : (["PAID", "PENDING_CASH"].includes(order.status) && newStatus === "READY_FOR_PICKUP") || (order.status === "READY_FOR_PICKUP" && newStatus === (order.paymentMethod === "CASH" ? "COMPLETED_CASH" : "COMPLETED"));
            if (!allowed) throw new Error("Transition de statut invalide.");
            const giftCodesJson = newStatus === "COMPLETED_CASH" ? await issueGiftCards(transaction, order.itemsJson) : order.giftCodesJson;
            await transaction.order.update({ where: { id: order.id }, data: { status: newStatus, giftCodesJson } });
        });
        let warning: string | undefined;
        try {
            await sendOrderEmails(orderId);
        } catch {
            warning = "Statut enregistré, e-mail non envoyé. Utilisez Réessayer les e-mails.";
        }
        revalidatePath("/admin/orders");
        revalidatePath("/account");
        return { success: true, warning };
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la commande:", error);
        return { error: "Action non autorisée ou transition de statut invalide." };
    }
}

export async function retryOrderEmails(orderId: string) {
    await requireAdmin();
    try {
        await sendOrderEmails(orderId);
        revalidatePath("/admin/orders");
        return { success: true };
    } catch {
        return { error: "Échec de l'envoi. Vérifiez Resend et le domaine expéditeur." };
    }
}

export async function cancelCashOrder(orderId: string) {
    await requireAdmin();
    try {
        const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
        if (order.paymentMethod !== "CASH" || !["PENDING_CASH", "READY_FOR_PICKUP"].includes(order.status)) {
            return { error: "Seule une réservation non encaissée peut être annulée." };
            }
        await releaseOrder(order.id, order.status as "PENDING_CASH" | "READY_FOR_PICKUP");
        revalidatePath("/admin/orders");
        revalidatePath("/shop");
        return { success: true };
    } catch {
        return { error: "Annulation impossible." };
    }
}
