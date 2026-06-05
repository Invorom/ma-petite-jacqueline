"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleUserRole(userId: string, newRole: string) {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "ADMIN") {
        throw new Error("Action non autorisée.");
    }

    if (newRole !== "ADMIN" && newRole !== "USER") {
        throw new Error("Rôle invalide.");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath("/admin/users");
}
