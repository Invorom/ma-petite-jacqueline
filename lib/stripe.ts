import Stripe from "stripe";

export function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe non configure.");
    return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function getSiteUrl() {
    const value = process.env.NEXT_PUBLIC_SITE_URL;
    if (!value) throw new Error("URL du site non configuree.");
    const url = new URL(value);
    if (url.username || url.password || (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))) throw new Error("URL du site invalide.");
    return url.origin;
}