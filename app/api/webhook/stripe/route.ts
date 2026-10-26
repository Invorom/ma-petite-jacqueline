import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { issueGiftCards, releaseOrder } from "@/lib/checkout";
import { sendOrderEmails } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Paiement non configuré" }, { status: 503 });
    const signature = req.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
    } catch {
        return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
    }
    try {
        if (event.type === "checkout.session.expired") {
            const session = event.data.object;
            if (session.metadata?.orderId) await releaseOrder(session.metadata.orderId);
        }
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            if (!["paid", "no_payment_required"].includes(session.payment_status)) return NextResponse.json({ received: true });
            const orderId = session.metadata?.orderId;
            if (!orderId) throw new Error("Missing order reference");
            await prisma.$transaction(async transaction => {
                const order = await transaction.order.findUnique({ where: { id: orderId } });
                if (!order || order.paymentMethod !== "CARD" || session.currency !== "eur" || session.amount_total !== Math.round(order.totalAmount * 100) || (order.stripeSessionId && order.stripeSessionId !== session.id)) throw new Error("Payment does not match order");
                if (order.status !== "PENDING_PAYMENT") {
                    if (order.status === "CANCELED") throw new Error("Payment for canceled order");
                    return;
                }
                const giftCodesJson = await issueGiftCards(transaction, order.itemsJson);
                await transaction.order.update({ where: { id: order.id }, data: {
                    status: "PAID", stripeSessionId: session.id, giftCodesJson,
                    shippingAddress: JSON.stringify({ shipping: session.collected_information?.shipping_details, customer: session.customer_details }),
                } });
            });
            await sendOrderEmails(orderId);
        }
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Stripe webhook processing failed", error);
        return NextResponse.json({ error: "Traitement à réessayer" }, { status: 500 });
    }
}
