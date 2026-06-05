"use server";

import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
    apiVersion: "2026-05-27.dahlia", // Adjust based on library version, or omit for default
});

export async function createCheckoutSession(
    items: { id: string, name: string, price: number, category: string, image?: string }[],
    appliedCode: { code: string, amount: number, type: string } | null,
    shippingMethod: "HOME" | "CLICK_COLLECT",
    userEmail: string
) {
    if (!process.env.STRIPE_SECRET_KEY) {
        // En mode démo, on simule le succès si pas de clé configurée
        return { error: "Veuillez configurer votre clé Stripe (STRIPE_SECRET_KEY) pour activer le paiement." };
    }

    try {
        const headerList = await headers();
        const origin = headerList.get("origin") || "http://localhost:3000";

        // Calculate discount
        const eligibleTotal = items.filter(i => i.category !== "cartes-cadeaux").reduce((acc, i) => acc + i.price, 0);
        let discountAmount = 0;
        let couponId = undefined;

        // NOTE: In a real advanced Stripe setup, we'd create a Stripe Coupon on the fly or use existing ones.
        // But the simplest way is to pass a line item with a negative amount, OR pass it via 'discounts'.
        // Since Stripe line items cannot have negative amounts directly, we can create a Coupon via API.
        
        if (appliedCode && eligibleTotal > 0) {
            if (appliedCode.type === "PERCENTAGE") {
                discountAmount = eligibleTotal * (appliedCode.amount / 100);
            } else {
                discountAmount = Math.min(appliedCode.amount, eligibleTotal);
            }
            // Create a one-off coupon for this session
            const coupon = await stripe.coupons.create({
                amount_off: Math.round(discountAmount * 100), // in cents
                currency: 'eur',
                duration: 'once',
                name: `Code Promo: ${appliedCode.code}`
            });
            couponId = coupon.id;
        }

        // Calculate Shipping
        const subtotal = Math.max(0, eligibleTotal - discountAmount) + items.filter(i => i.category === "cartes-cadeaux").reduce((acc, i) => acc + i.price, 0);
        const isFreeShipping = subtotal >= 100;
        const shippingCost = shippingMethod === "CLICK_COLLECT" || isFreeShipping ? 0 : 4;

        // Create line items
        const lineItems = items.map(item => ({
            price_data: {
                currency: "eur",
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : undefined,
                    metadata: {
                        productId: item.id,
                        category: item.category
                    }
                },
                unit_amount: Math.round(item.price * 100), // in cents
            },
            quantity: 1,
        }));

        // Shipping options
        const shippingOptions = shippingCost > 0 ? [
            {
                shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: { amount: Math.round(shippingCost * 100), currency: "eur" },
                    display_name: "Livraison à domicile",
                }
            }
        ] : [
            {
                shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: { amount: 0, currency: "eur" },
                    display_name: shippingMethod === "CLICK_COLLECT" ? "Click & Collect (Atelier)" : "Livraison Offerte",
                }
            }
        ];

        // Create session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${origin}/cart?success=true`,
            cancel_url: `${origin}/cart?canceled=true`,
            customer_email: userEmail,
            discounts: couponId ? [{ coupon: couponId }] : undefined,
            shipping_options: shippingOptions as any,
            metadata: {
                userEmail,
                appliedCode: appliedCode?.code || "",
                shippingMethod,
                shippingCost: shippingCost.toString(),
                itemsJson: JSON.stringify(items.map(i => ({ id: i.id, category: i.category, price: i.price })))
            }
        });

        return { url: session.url };
    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return { error: error.message || "Erreur lors de la création de la session Stripe." };
    }
}
