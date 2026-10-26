import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const checkoutSchema = z.object({
    items: z.array(z.object({ id: z.string().min(1).max(100) })).min(1).max(50),
    code: z.string().trim().toUpperCase().max(64).optional(),
    shippingMethod: z.enum(["HOME", "CLICK_COLLECT"]),
});

export const orderItemsSchema = z.array(z.object({
    id: z.string(), name: z.string(), price: z.number().finite().positive(),
    category: z.string(), image: z.string(),
}));
export const giftCodesSchema = z.array(z.object({ code: z.string(), amount: z.number() }));

export function calculateTotals(items: { price: number; category: string }[], promo: { amount: number; type: string } | null, shippingMethod: string) {
    const subtotal = items.reduce((total, item) => total + Math.round(item.price * 100), 0);
    const hasGiftCards = items.some(item => item.category === "cartes-cadeaux");
    if (promo && hasGiftCards) throw new Error("Les promotions ne sont pas applicables aux paniers contenant des cartes cadeaux.");
    if (promo && (!Number.isFinite(promo.amount) || promo.amount <= 0 || !["FIXED", "PERCENTAGE"].includes(promo.type) || (promo.type === "PERCENTAGE" && promo.amount > 100))) throw new Error("Promotion invalide.");
    const discount = promo ? Math.min(subtotal, Math.round(promo.type === "PERCENTAGE" ? subtotal * promo.amount / 100 : promo.amount * 100)) : 0;
    const hasPhysicalItems = items.some(item => item.category !== "cartes-cadeaux");
    const shipping = shippingMethod === "HOME" && hasPhysicalItems && subtotal - discount < 10000 ? 400 : 0;
    return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

export async function reserveOrder(userId: string, input: unknown, paymentMethod: "CARD" | "CASH") {
    const { items, code, shippingMethod } = checkoutSchema.parse(input);
    const ids = items.map(item => item.id);
    if (new Set(ids).size !== ids.length) throw new Error("Un article ne peut apparaître qu'une fois dans le panier.");
    if (paymentMethod === "CASH" && shippingMethod !== "CLICK_COLLECT") throw new Error("Le paiement sur place nécessite un retrait à l'atelier.");
    return prisma.$transaction(async transaction => {
        const pendingCount = await transaction.order.count({ where: { userId, status: { in: ["PENDING_PAYMENT", "PENDING_CASH", "READY_FOR_PICKUP"] } } });
        if (pendingCount >= 3) throw new Error("Trop de réservations en cours. Contactez la boutique.");
        const products = await transaction.product.findMany({ where: { id: { in: ids } } });
        if (products.length !== ids.length) throw new Error("Un article n'est plus disponible. Actualisez votre panier.");
        for (const product of products) {
            if (!Number.isFinite(product.price) || product.price <= 0) throw new Error("Prix invalide.");
            if (product.category !== "cartes-cadeaux") {
                const result = await transaction.product.updateMany({ where: { id: product.id, quantity: { gt: 0 } }, data: { quantity: { decrement: 1 } } });
                if (result.count !== 1) throw new Error(`L'article ${product.name} n'est plus disponible.`);
            }
        }
        const promo = code ? await transaction.promoCode.findUnique({ where: { code } }) : null;
        if (code && (!promo || promo.isUsed || (promo.expiresAt && promo.expiresAt <= new Date()))) throw new Error("Code invalide, expiré ou déjà utilisé.");
        const totals = calculateTotals(products, promo, shippingMethod);
        if (promo?.code.startsWith("CADEAU-")) {
            const claimed = await transaction.promoCode.updateMany({ where: { id: promo.id, isUsed: false }, data: { isUsed: true } });
            if (claimed.count !== 1) throw new Error("Carte cadeau déjà utilisée.");
        }
        const snapshot = products.map(({ id, name, price, category, image }) => ({ id, name, price, category, image }));
        const order = await transaction.order.create({ data: {
            userId, itemsJson: JSON.stringify(snapshot), totalAmount: totals.total / 100,
            status: paymentMethod === "CASH" ? "PENDING_CASH" : "PENDING_PAYMENT",
            shippingMethod, shippingCost: totals.shipping / 100, paymentMethod, promoCode: promo?.code,
        } });
        return { order, items: snapshot, totals };
    });
}

export async function issueGiftCards(transaction: Prisma.TransactionClient, itemsJson: string) {
    const codes: { code: string; amount: number }[] = [];
    for (const item of orderItemsSchema.parse(JSON.parse(itemsJson))) {
        if (item.category !== "cartes-cadeaux") continue;
        const code = `CADEAU-${randomBytes(16).toString("hex").toUpperCase()}`;
        await transaction.promoCode.create({ data: { code, amount: item.price } });
        codes.push({ code, amount: item.price });
    }
    return JSON.stringify(codes);
}

export async function releaseOrder(orderId: string, expectedStatus: "PENDING_PAYMENT" | "PENDING_CASH" | "READY_FOR_PICKUP" = "PENDING_PAYMENT") {
    return prisma.$transaction(async transaction => {
        const order = await transaction.order.findUnique({ where: { id: orderId } });
        if (!order || order.status !== expectedStatus) return;
        if (expectedStatus !== "PENDING_PAYMENT" && order.paymentMethod !== "CASH") throw new Error("Une commande payée doit être remboursée via Stripe.");
        const updated = await transaction.order.updateMany({ where: { id: order.id, status: expectedStatus }, data: { status: "CANCELED" } });
        if (!updated.count) return;
        for (const item of orderItemsSchema.parse(JSON.parse(order.itemsJson))) {
            if (item.category !== "cartes-cadeaux") await transaction.product.updateMany({ where: { id: item.id }, data: { quantity: { increment: 1 } } });
        }
        if (order.promoCode?.startsWith("CADEAU-")) await transaction.promoCode.updateMany({ where: { code: order.promoCode }, data: { isUsed: false } });
    });
}