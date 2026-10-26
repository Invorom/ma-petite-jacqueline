import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { databaseUrl } from "./database-url.mjs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
	adapter: new PrismaBetterSqlite3({ url: databaseUrl() }, { timestampFormat: "unixepoch-ms" }),
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
