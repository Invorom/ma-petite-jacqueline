import { afterAll, beforeAll, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

let directory: string;
let prisma: typeof import("@/lib/prisma").prisma;
let reserveOrder: typeof import("@/lib/checkout").reserveOrder;
let releaseOrder: typeof import("@/lib/checkout").releaseOrder;
let userId: string;

beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "mpj-test-"));
    process.env.DATABASE_URL = `file:${join(directory, "test.db").replaceAll("\\", "/")}`;
    const migration = spawnSync(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"], { env: process.env, encoding: "utf8" });
    if (migration.status !== 0) throw new Error(migration.stderr || migration.stdout);
    ({ prisma } = await import("@/lib/prisma"));
    ({ reserveOrder, releaseOrder } = await import("@/lib/checkout"));
    const user = await prisma.user.create({ data: { email: "integration@example.test" } });
    userId = user.id;
}, 30000);

afterAll(async () => {
    await prisma?.$disconnect();
    if (directory) await rm(directory, { recursive: true, force: true });
});

it("rolls back stock when a later promotion check fails", async () => {
    const product = await prisma.product.create({ data: { name: "Rollback", description: "Test", price: 30, image: "", category: "colliers" } });
    await expect(reserveOrder(userId, { items: [{ id: product.id }], code: "DOES-NOT-EXIST", shippingMethod: "HOME" }, "CARD")).rejects.toThrow();
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).quantity).toBe(1);
    expect(await prisma.order.count()).toBe(0);
});

it("allows only one concurrent reservation and restores stock once", async () => {
    const product = await prisma.product.create({ data: { name: "Unique", description: "Test", price: 30, image: "", category: "colliers" } });
    const request = { items: [{ id: product.id }], shippingMethod: "CLICK_COLLECT" };
    const results = await Promise.allSettled([reserveOrder(userId, request, "CASH"), reserveOrder(userId, request, "CASH")]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).quantity).toBe(0);
    const order = await prisma.order.findFirstOrThrow();
    await releaseOrder(order.id, "PENDING_CASH");
    await releaseOrder(order.id, "PENDING_CASH");
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).quantity).toBe(1);
});