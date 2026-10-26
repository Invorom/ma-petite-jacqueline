"use server";

import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleUserRole(userId: string, newRole: string) {
    const admin = await requireAdmin();
    if (userId === admin.id && newRole !== "ADMIN") throw new Error("Vous ne pouvez pas retirer votre propre accès administrateur.");

    if (newRole !== "ADMIN" && newRole !== "USER") {
        throw new Error("Rôle invalide.");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath("/admin/users");
}
