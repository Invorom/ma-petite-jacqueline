import { spawn, spawnSync } from "node:child_process";

const required = ["AUTH_SECRET", "AUTH_URL", "NEXT_PUBLIC_SITE_URL", "DATABASE_URL"];
const missing = required.filter(name => !process.env[name]);
if (missing.length) throw new Error(`Missing production configuration: ${missing.join(", ")}`);
if (process.env.AUTH_SECRET.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
const site = new URL(process.env.NEXT_PUBLIC_SITE_URL);
if (site.protocol !== "https:" || site.username || site.password || site.pathname !== "/" || site.search || site.hash) throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTPS origin.");
if (new URL(process.env.AUTH_URL).origin !== site.origin) throw new Error("AUTH_URL and NEXT_PUBLIC_SITE_URL must use the same origin.");
if (process.env.DATABASE_URL !== "file:/data/shop.db") throw new Error("Use the persistent database at file:/data/shop.db with this deployment.");

const external = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY", "EMAIL_FROM", "CONTACT_EMAIL"];
const unavailable = external.filter(name => !process.env[name]);
if (unavailable.length) console.warn(`External services are not ready: ${unavailable.join(", ")}. Do not open sales.`);

const migration = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { stdio: "inherit" });
if (migration.status !== 0) process.exit(migration.status || 1);
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", "3000"], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
server.on("error", error => { console.error(error.message); process.exit(1); });
server.on("exit", code => process.exit(code ?? 1));