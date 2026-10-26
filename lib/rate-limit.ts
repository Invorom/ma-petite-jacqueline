import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function allowRequest(scope: string, identity: string, limit: number, windowMs: number) {
    const now = Date.now();
    const bucket = Math.floor(now / windowMs);
    const digest = createHash("sha256").update(identity).digest("hex");
    const key = `${scope}:${digest}:${bucket}`;
    await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
    const entry = await prisma.rateLimit.upsert({
        where: { key }, create: { key, count: 1, expiresAt: new Date((bucket + 1) * windowMs) },
        update: { count: { increment: 1 } },
    });
    return entry.count <= limit;
}

export function clientAddress(request: Request) {
    const header = process.env.TRUSTED_IP_HEADER;
    return header ? request.headers.get(header)?.split(",")[0].trim() || "unknown" : "shared";
}