import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    product: { findMany: vi.fn(), updateMany: vi.fn() },
    promoCode: { findUnique: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
    order: { count: vi.fn(), create: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: { ...mocks, $transaction: (callback: (transaction: typeof mocks) => unknown) => callback(mocks) } }));

import { calculateTotals, reserveOrder, releaseOrder } from "@/lib/checkout";
import { orderConfirmationHtml } from "@/lib/email-templates";

const product = { id: "jewel-1", name: "Bijou", price: 35, category: "colliers", image: "/uploads/bijou.jpg", quantity: 1 };

beforeEach(() => {
    vi.resetAllMocks();
    mocks.order.count.mockResolvedValue(0);
    mocks.product.findMany.mockResolvedValue([product]);
    mocks.product.updateMany.mockResolvedValue({ count: 1 });
    mocks.order.create.mockImplementation(async ({ data }) => ({ id: "order-1", ...data }));
});

describe("server checkout", () => {
    it("ignores client prices, names and categories", async () => {
        const result = await reserveOrder("user-1", { items: [{ id: product.id, price: 0.01, category: "cartes-cadeaux", name: "Fake" }], shippingMethod: "HOME" }, "CARD");
        expect(result.order.totalAmount).toBe(39);
        expect(result.items[0]).toMatchObject({ price: 35, category: "colliers", name: "Bijou" });
        expect(result.order.status).toBe("PENDING_PAYMENT");
    });
    it("rejects duplicate ids", async () => {
        await expect(reserveOrder("user-1", { items: [{ id: product.id }, { id: product.id }], shippingMethod: "HOME" }, "CARD")).rejects.toThrow();
        expect(mocks.order.create).not.toHaveBeenCalled();
    });
    it("refuses an unavailable unique product", async () => {
        mocks.product.updateMany.mockResolvedValue({ count: 0 });
        await expect(reserveOrder("user-1", { items: [{ id: product.id }], shippingMethod: "HOME" }, "CARD")).rejects.toThrow("disponible");
        expect(mocks.order.create).not.toHaveBeenCalled();
    });
    it("requires collection for cash", async () => {
        await expect(reserveOrder("user-1", { items: [{ id: product.id }], shippingMethod: "HOME" }, "CASH")).rejects.toThrow();
    });
    it("rejects used and expired codes", async () => {
        mocks.promoCode.findUnique.mockResolvedValue({ code: "OLD", amount: 10, type: "FIXED", expiresAt: new Date(0), isUsed: false });
        await expect(reserveOrder("user-1", { items: [{ id: product.id }], code: "old", shippingMethod: "HOME" }, "CARD")).rejects.toThrow("Code invalide");
    });
    it("does not release a paid order", async () => {
        mocks.order.findUnique.mockResolvedValue({ id: "order-1", status: "PAID" });
        await releaseOrder("order-1");
        expect(mocks.product.updateMany).not.toHaveBeenCalled();
    });
    it("releases stock and gift credit only once", async () => {
        mocks.order.findUnique.mockResolvedValue({ id: "order-1", status: "PENDING_PAYMENT", itemsJson: JSON.stringify([product]), promoCode: "CADEAU-TEST" });
        mocks.order.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
        await releaseOrder("order-1");
        await releaseOrder("order-1");
        expect(mocks.product.updateMany).toHaveBeenCalledTimes(1);
        expect(mocks.promoCode.updateMany).toHaveBeenCalledTimes(1);
    });
});

describe("totals and email safety", () => {
    it("calculates in cents and applies free shipping after discount", () => {
        expect(calculateTotals([{ price: 100, category: "colliers" }], { amount: 10, type: "PERCENTAGE" }, "HOME")).toEqual({ subtotal: 10000, discount: 1000, shipping: 400, total: 9400 });
        expect(calculateTotals([{ price: 100, category: "colliers" }], null, "HOME").shipping).toBe(0);
    });
    it("does not ship digital cards or discount mixed gift baskets", () => {
        expect(calculateTotals([{ price: 10, category: "cartes-cadeaux" }], null, "HOME").total).toBe(1000);
        expect(() => calculateTotals([{ price: 10, category: "cartes-cadeaux" }, product], { amount: 10, type: "FIXED" }, "HOME")).toThrow();
    });
    it("caps fixed discounts and rejects invalid percentage discounts", () => {
        expect(calculateTotals([product], { amount: 100, type: "FIXED" }, "CLICK_COLLECT").total).toBe(0);
        expect(() => calculateTotals([product], { amount: 101, type: "PERCENTAGE" }, "HOME")).toThrow();
    });
    it("escapes product names in HTML emails", () => {
        const html = orderConfirmationHtml({ orderId: "test", items: [{ ...product, name: '<img src=x onerror="alert(1)">' }], total: 35, shippingMethod: "HOME" });
        expect(html).not.toContain("<img");
        expect(html).toContain("&lt;img");
    });
});