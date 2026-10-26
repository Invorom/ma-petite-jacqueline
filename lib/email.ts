import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { giftCodesSchema, orderItemsSchema } from "@/lib/checkout";
import { giftCardHtml, orderConfirmationHtml, orderStatusHtml } from "@/lib/email-templates";

export async function sendEmail(to: string, subject: string, html: string, idempotencyKey: string) {
	const key = process.env.RESEND_API_KEY;
	const from = process.env.EMAIL_FROM;
	if (!key || !from) throw new Error("E-mails non configurés.");
	const result = await new Resend(key).emails.send({ from, to, subject, html }, { idempotencyKey });
	if (result.error) throw new Error(`Email provider: ${result.error.name}`);
}

export async function sendOrderEmails(orderId: string) {
	const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { user: true } });
	if (["PENDING_PAYMENT", "CANCELED"].includes(order.status)) return;
	if (!order.confirmationSentAt) {
		await sendEmail(order.user.email, "Votre commande - Ma Petite Jacqueline", orderConfirmationHtml({
			orderId, items: orderItemsSchema.parse(JSON.parse(order.itemsJson)), total: order.totalAmount,
			shippingMethod: order.shippingMethod || "HOME", pendingCash: order.paymentMethod === "CASH",
		}), `confirmation-${orderId}`);
		await prisma.order.update({ where: { id: orderId }, data: { confirmationSentAt: new Date() } });
	}
	const codes = giftCodesSchema.parse(JSON.parse(order.giftCodesJson));
	if (codes.length && !order.giftEmailSentAt) {
		await sendEmail(order.user.email, "Vos cartes cadeaux - Ma Petite Jacqueline", giftCardHtml({ codes }), `gifts-${orderId}`);
		await prisma.order.update({ where: { id: orderId }, data: { giftEmailSentAt: new Date() } });
	}
	if (["SHIPPED", "READY_FOR_PICKUP", "COMPLETED", "COMPLETED_CASH"].includes(order.status) && order.statusEmailSent !== order.status) {
		await sendEmail(order.user.email, "Suivi de votre commande - Ma Petite Jacqueline", orderStatusHtml({ orderId, status: order.status }), `status-${orderId}-${order.status}`);
		await prisma.order.update({ where: { id: orderId }, data: { statusEmailSent: order.status } });
	}
}
