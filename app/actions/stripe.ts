"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";
import { reserveOrder, releaseOrder } from "@/lib/checkout";
import { getStripe, getSiteUrl } from "@/lib/stripe";

export async function createCheckoutSession(
    items: { id: string }[],
    appliedCode: { code: string } | null,
    shippingMethod: "HOME" | "CLICK_COLLECT",
    _userEmail?: string
) {
    try {
        const user = await requireUser();
        const stripe = getStripe();
        const origin = getSiteUrl();
        if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
            return { error: "Le paiement n'est pas encore configuré. Contactez la boutique." };
        }
        const reserved = await reserveOrder(user.id, { items, code: appliedCode?.code, shippingMethod }, "CARD");
        let couponId: string | undefined;
        try {
            if (reserved.totals.discount > 0) {
                const coupon = await stripe.coupons.create({ amount_off: reserved.totals.discount, currency: "eur", duration: "once" }, { idempotencyKey: `coupon-${reserved.order.id}` });
                couponId = coupon.id;
            }
        } catch {
            await releaseOrder(reserved.order.id);
            return { error: "Impossible de préparer la remise. Veuillez réessayer." };
        }
        const session = await stripe.checkout.sessions.create({
            mode: "payment", payment_method_types: ["card"], customer_email: user.email,
            client_reference_id: reserved.order.id,
            metadata: { orderId: reserved.order.id },
            line_items: reserved.items.map(item => ({ price_data: {
                currency: "eur", product_data: { name: item.name }, unit_amount: Math.round(item.price * 100),
            }, quantity: 1 })),
            discounts: couponId ? [{ coupon: couponId }] : undefined,
            shipping_address_collection: shippingMethod === "HOME" && reserved.items.some(item => item.category !== "cartes-cadeaux") ? { allowed_countries: ["FR"] } : undefined,
            phone_number_collection: { enabled: true },
            shipping_options: [{ shipping_rate_data: {
                type: "fixed_amount", fixed_amount: { amount: reserved.totals.shipping, currency: "eur" },
                display_name: shippingMethod === "CLICK_COLLECT" ? "Retrait à l'atelier" : "Livraison",
            } }],
            expires_at: Math.floor(Date.now() / 1000) + 1800,
            success_url: `${origin}/cart?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cart?canceled=true`,
        }, { idempotencyKey: `checkout-${reserved.order.id}` });
        await prisma.order.update({ where: { id: reserved.order.id }, data: { stripeSessionId: session.id } });
        return { url: session.url };
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return { error: "Impossible de préparer le paiement. Vérifiez la disponibilité des articles ou contactez la boutique." };
    }
}

export async function getCheckoutStatus(sessionId: string) {
    const user = await requireUser();
    if (typeof sessionId !== "string" || sessionId.length > 255) return { paid: false };
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const order = await prisma.order.findFirst({ where: { id: session.metadata?.orderId || "", userId: user.id } });
    return { paid: Boolean(order && ["paid", "no_payment_required"].includes(session.payment_status)), confirmed: Boolean(order && !["PENDING_PAYMENT", "CANCELED"].includes(order.status)) };
}
