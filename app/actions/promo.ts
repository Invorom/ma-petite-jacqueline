"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function seedGiftCards() {
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
    const amountStr = formData.get("amount") as string;
    if (!amountStr) return { error: "Montant manquant" };
    const amount = Number(amountStr);
    
    if (isNaN(amount) || amount <= 0) return { error: "Montant invalide" };

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
    await prisma.promoCode.delete({
        where: { id }
    });
    revalidatePath("/admin/promos");
}

export async function validatePromo(code: string) {
    const promo = await prisma.promoCode.findUnique({
        where: { code }
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

export async function processCheckout(items: { id: string, category: string, price: number, name?: string, image?: string }[], appliedCode?: string, userEmail?: string) {
    try {
        let newCodes = [];
        
        // Process the applied code if any
        if (appliedCode) {
            if (appliedCode.startsWith("CADEAU-")) {
                try {
                    await prisma.promoCode.delete({
                        where: { code: appliedCode }
                    });
                } catch(e) {
                    // Ignore
                }
            }
        }

        let totalAmount = 0;

        // Generate new codes for gift cards bought
        for (const item of items) {
            totalAmount += item.price;
            if (item.category === "cartes-cadeaux") {
                const code = `CADEAU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                await prisma.promoCode.create({
                    data: {
                        code,
                        amount: item.price
                    }
                });
                newCodes.push({ code, amount: item.price });
            } else {
                // Delete product completely as it is unique
                try {
                    await prisma.product.delete({
                        where: { id: item.id }
                    });
                } catch (e) {
                    // Product might have been already deleted by someone else or db reset
                }
            }
        }

        if (userEmail) {
            const user = await prisma.user.findUnique({ where: { email: userEmail } });
            if (user) {
                await prisma.order.create({
                    data: {
                        userId: user.id,
                        totalAmount,
                        itemsJson: JSON.stringify(items),
                    }
                });
            }
        }

        revalidatePath("/admin/promos");
        revalidatePath("/shop");
        revalidatePath("/admin/products");

        return { success: true, generatedCodes: newCodes };
    } catch (error) {
        console.error("Checkout error:", error);
        return { success: false, error: "Une erreur est survenue lors de la commande." };
    }
}

export async function createCustomPromo(formData: FormData) {
    const code = formData.get("code") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as string;
    const expiresAtStr = formData.get("expiresAt") as string;

    if (!code || isNaN(amount)) return { error: "Données invalides" };

    let expiresAt = null;
    if (expiresAtStr) {
        expiresAt = new Date(expiresAtStr);
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
