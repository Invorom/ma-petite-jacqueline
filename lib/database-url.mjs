import { isAbsolute, resolve } from "node:path";

export function databaseUrl() {
    const value = process.env.DATABASE_URL || "file:./dev.db";
    if (!value.startsWith("file:") || value.length === 5) throw new Error("DATABASE_URL must specify a SQLite file.");
    const filename = value.slice(5);
    const absolute = isAbsolute(filename) ? filename : resolve(process.cwd(), "prisma", filename);
    return `file:${absolute.replaceAll("\\", "/")}`;
}