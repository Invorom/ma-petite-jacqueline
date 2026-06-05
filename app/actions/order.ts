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
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        });
        
        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la commande:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}
