import { beforeEach, expect, it, vi } from "vitest";
import Stripe from "stripe";

const mocks = vi.hoisted(() => ({
    findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), send: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: (callback: (transaction: unknown) => unknown) => callback({ order: { findUnique: mocks.findUnique, update: mocks.update }, promoCode: { create: mocks.create } }) } }));
vi.mock("@/lib/email", () => ({ sendOrderEmails: mocks.send }));
import { POST } from "@/app/api/webhook/stripe/route";

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_local_placeholder");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_local_placeholder");
});

function signedRequest(total = 1000) {
    const payload = JSON.stringify({ id: "evt_test", type: "checkout.session.completed", data: { object: { id: "cs_test", currency: "eur", amount_total: total, payment_status: "paid", metadata: { orderId: "order-1" } } } });
    const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_local_placeholder" });
    return new Request("http://localhost/api/webhook/stripe", { method: "POST", body: payload, headers: { "stripe-signature": signature } });
}

it("fails closed without a configured signing secret", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    expect((await POST(signedRequest())).status).toBe(503);
});
it("rejects unsigned requests", async () => {
    expect((await POST(new Request("http://localhost", { method: "POST", body: "{}" }))).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
});
it("rejects a payment with a mismatched amount", async () => {
    mocks.findUnique.mockResolvedValue({ id: "order-1", paymentMethod: "CARD", totalAmount: 10, status: "PENDING_PAYMENT" });
    expect((await POST(signedRequest(1))).status).toBe(500);
    expect(mocks.update).not.toHaveBeenCalled();
});
it("issues gift cards once when a signed event is retried", async () => {
    const order = { id: "order-1", paymentMethod: "CARD", totalAmount: 10, status: "PENDING_PAYMENT", itemsJson: JSON.stringify([{ id: "gift", name: "Carte", price: 10, category: "cartes-cadeaux", image: "" }]) };
    mocks.findUnique.mockImplementation(async () => order);
    mocks.update.mockImplementation(async ({ data }) => Object.assign(order, data));
    expect((await POST(signedRequest())).status).toBe(200);
    expect((await POST(signedRequest())).status).toBe(200);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(mocks.update).toHaveBeenCalledTimes(1);
});
it("asks Stripe to retry when email delivery fails after payment", async () => {
    mocks.findUnique.mockResolvedValue({ id: "order-1", paymentMethod: "CARD", totalAmount: 10, status: "PAID", stripeSessionId: "cs_test" });
    mocks.send.mockRejectedValue(new Error("provider unavailable"));
    expect((await POST(signedRequest())).status).toBe(500);
    expect(mocks.create).not.toHaveBeenCalled();
});