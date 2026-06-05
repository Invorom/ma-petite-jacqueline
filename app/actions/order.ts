"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
        return { error: "Non autorisé" };
    }

    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
            include: { user: true }
        });

        // Envoyer l'email (non-bloquant : si Resend n'est pas configuré, on continue quand même)
        if (order.user?.email && (newStatus === "SHIPPED" || newStatus === "READY_FOR_PICKUP" || newStatus === "COMPLETED" || newStatus === "COMPLETED_CASH")) {
            try {
                const { resend, SENDER_EMAIL } = await import("@/lib/email");
                const OrderStatusEmail = (await import("@/emails/OrderStatusEmail")).default;

                let subject = "";
                if (newStatus === "SHIPPED") subject = "📦 Votre commande est en route ! - Ma Petite Jacqueline";
                else if (newStatus === "READY_FOR_PICKUP") subject = "🛍️ Votre commande est prête ! - Ma Petite Jacqueline";
                else subject = "🛍️ Merci pour votre visite ! - Ma Petite Jacqueline";

                await resend.emails.send({
                    from: SENDER_EMAIL,
                    to: order.user.email,
                    subject,
                    react: OrderStatusEmail({
                        orderId: order.id,
                        status: newStatus,
                        shippingMethod: order.shippingMethod || "HOME"
                    })
                });
            } catch (emailError) {
                console.warn("Email non envoyé (Resend non configuré ?):", emailError);
            }
        }
        
        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la commande:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}
