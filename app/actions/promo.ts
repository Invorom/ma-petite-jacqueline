"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/authorization";
import { reserveOrder } from "@/lib/checkout";
import { sendOrderEmails } from "@/lib/email";

export async function seedGiftCards() {
    await requireAdmin();
    const amounts = [5, 10, 15, 20, 50, 100];

    for (const amount of amounts) {
        // Check if it already exists to prevent duplicates
        const existing = await prisma.product.findFirst({
            where: {
                name: `Carte Cadeau ${amount}€`,
                category: "cartes-cadeaux"
            }
        });

        if (!existing) {
            await prisma.product.create({
                data: {
                    name: `Carte Cadeau ${amount}€`,
                    description: `Une carte cadeau d'une valeur de ${amount}€, valable sur toute la boutique Ma petite Jacqueline. Un code promo unique vous sera fourni après validation.`,
                    price: amount,
                    category: "cartes-cadeaux",
                    image: "", // We can handle the lack of image gracefully in the UI
                    images: "[]"
                }
            });
        }
    }

    revalidatePath("/admin/promos");
    revalidatePath("/shop");
}

export async function createCustomGiftCard(formData: FormData) {
    await requireAdmin();
    const amountStr = formData.get("amount") as string;
    if (!amountStr) return { error: "Montant manquant" };
    const amount = Number(amountStr);
    
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) return { error: "Montant invalide" };

    const existing = await prisma.product.findFirst({
        where: { name: `Carte Cadeau ${amount}€`, category: "cartes-cadeaux" }
    });

    if (existing) {
        return { error: `Une carte cadeau de ${amount}€ existe déjà.` };
    }

    await prisma.product.create({
        data: {
            name: `Carte Cadeau ${amount}€`,
            description: `Une carte cadeau d'une valeur de ${amount}€, valable sur toute la boutique Ma petite Jacqueline. Un code promo unique vous sera fourni après validation.`,
            price: amount,
            category: "cartes-cadeaux",
            image: "",
            images: "[]"
        }
    });

    revalidatePath("/admin/promos");
    revalidatePath("/shop");
    return { success: true };
}

export async function deletePromoCode(id: string) {
    await requireAdmin();
    await prisma.promoCode.delete({
        where: { id }
    });
    revalidatePath("/admin/promos");
}

export async function validatePromo(code: string) {
    await requireUser();
    if (typeof code !== "string" || code.length > 64) return { error: "Code invalide" };
    const promo = await prisma.promoCode.findUnique({
        where: { code: code.trim().toUpperCase() }
    });
    
    if (!promo) {
        return { error: "Code invalide" };
    }
    if (promo.isUsed) {
        return { error: "Code déjà utilisé" };
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
        return { error: "Ce code promo a expiré" };
    }
    
    return { success: true, amount: promo.amount, type: promo.type };
}

export async function processCheckout(
    items: { id: string }[],
    appliedCode?: string, 
    _userEmail?: string,
    status: string = "PENDING_CASH",
    shippingMethod?: string,
    _shippingCost: number = 0
) {
    try {
        const user = await requireUser();
        if (status !== "PENDING_CASH" || shippingMethod !== "CLICK_COLLECT") return { success: false, error: "Mode de paiement invalide." };
        const { order } = await reserveOrder(user.id, { items, code: appliedCode, shippingMethod }, "CASH");
        let warning: string | undefined;
        try {
            await sendOrderEmails(order.id);
        } catch {
            warning = "Réservation enregistrée, mais l'e-mail n'a pas pu être envoyé. Retrouvez-la dans votre compte.";
        }
        revalidatePath("/admin/promos");
        revalidatePath("/shop");
        revalidatePath("/admin/products");
        return { success: true, warning };
    } catch (error) {
        console.error("Checkout error:", error);
        return { success: false, error: "Une erreur est survenue lors de la commande." };
    }
}

export async function createCustomPromo(formData: FormData) {
    await requireAdmin();
    const code = formData.get("code") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as string;
    const expiresAtStr = formData.get("expiresAt") as string;

    if (!code?.trim() || code.length > 64 || code.trim().toUpperCase().startsWith("CADEAU-") || !Number.isFinite(amount) || amount <= 0 || amount > 10000 || !["FIXED", "PERCENTAGE"].includes(type) || (type === "PERCENTAGE" && amount > 100)) return { error: "Données invalides" };

    let expiresAt = null;
    if (expiresAtStr) {
        expiresAt = new Date(expiresAtStr);
        if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date()) return { error: "Date invalide" };
    }

    try {
        await prisma.promoCode.create({
            data: {
                code: code.toUpperCase().trim(),
                amount,
                type,
                expiresAt
            }
        });
        revalidatePath("/admin/promos");
        return { success: true };
    } catch (error) {
        return { error: "Ce code existe déjà ou erreur" };
    }
}
