import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Connexion requise.");
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Compte introuvable.");
    return user;
}

export async function requireAdmin() {
    const user = await requireUser();
    if (user.role !== "ADMIN") throw new Error("Action non autorisée.");
    return user;
}