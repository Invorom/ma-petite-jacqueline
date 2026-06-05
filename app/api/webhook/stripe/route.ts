import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
    apiVersion: "2026-05-27.dahlia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!endpointSecret) {
            // Pas de secret configuré, on fait confiance en mode dev (DANGEREUX EN PROD)
            event = JSON.parse(body);
        } else {
            event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
        }
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        
        try {
            const metadata = session.metadata || {};
            const userEmail = metadata.userEmail;
            const appliedCode = metadata.appliedCode;
            const shippingMethod = metadata.shippingMethod;
            const shippingCost = parseFloat(metadata.shippingCost || "0");
            const items = JSON.parse(metadata.itemsJson || "[]");

            // 1. Delete applied promo code if it's a gift card
            if (appliedCode && appliedCode.startsWith("CADEAU-")) {
                try {
                    await prisma.promoCode.delete({
                        where: { code: appliedCode }
                    });
                } catch(e) {}
            }

            let giftCardCodes: {code: string, amount: number}[] = [];

            // 2. Process items (generate new gift cards, delete unique physical items)
            for (const item of items) {
                if (item.category === "cartes-cadeaux") {
                    const code = `CADEAU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                    await prisma.promoCode.create({
                        data: {
                            code,
                            amount: item.price
                        }
                    });
                    giftCardCodes.push({ code, amount: item.price });
                } else {
                    try {
                        await prisma.product.delete({
                            where: { id: item.id }
                        });
                    } catch (e) {}
                }
            }

            // 3. Create Order
            let createdOrder;
            if (userEmail) {
                const user = await prisma.user.findUnique({ where: { email: userEmail } });
                if (user) {
                    createdOrder = await prisma.order.create({
                        data: {
                            userId: user.id,
                            totalAmount: (session.amount_total || 0) / 100, // Stripe uses cents
                            itemsJson: metadata.itemsJson || "[]",
                            stripeSessionId: session.id,
                            shippingMethod,
                            shippingCost
                        }
                    });
                }
            }

            // 4. Send Emails via Resend
            if (userEmail && createdOrder) {
                const { resend, SENDER_EMAIL } = await import("@/lib/email");
                const OrderConfirmationEmail = (await import("@/emails/OrderConfirmation")).default;
                
                await resend.emails.send({
                    from: SENDER_EMAIL,
                    to: userEmail,
                    subject: "Confirmation de votre commande - Ma Petite Jacqueline",
                    react: OrderConfirmationEmail({
                        orderId: createdOrder.id,
                        items,
                        total: createdOrder.totalAmount,
                        shippingMethod: createdOrder.shippingMethod || "HOME"
                    })
                });

                if (giftCardCodes.length > 0) {
                    const GiftCardEmail = (await import("@/emails/GiftCardEmail")).default;
                    await resend.emails.send({
                        from: SENDER_EMAIL,
                        to: userEmail,
                        subject: "Vos Cartes Cadeaux 🎁 - Ma Petite Jacqueline",
                        react: GiftCardEmail({ codes: giftCardCodes })
                    });
                }
            }
        } catch (error) {
            console.error("Erreur lors du traitement de la commande:", error);
            return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
