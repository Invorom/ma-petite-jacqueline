"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function changePassword(formData: FormData) {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        throw new Error("Vous devez être connecté.");
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("Tous les champs sont requis.");
    }

    if (newPassword.length < 6) {
        throw new Error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
    }

    if (newPassword !== confirmPassword) {
        throw new Error("Les nouveaux mots de passe ne correspondent pas.");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user || !user.password) {
        throw new Error("Utilisateur invalide.");
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordsMatch) {
        throw new Error("L'ancien mot de passe est incorrect.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    return { success: true };
}

export async function getUserOrders() {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
        return [];
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            orders: {
                orderBy: { createdAt: "desc" }
            }
        }
    });

    return user?.orders || [];
}
