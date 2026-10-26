"use server";

import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const contactSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    subject: z.string().trim().min(2).max(150),
    message: z.string().trim().min(10).max(5000),
    website: z.string().max(0),
});

export async function sendContactMessage(formData: FormData) {
    const parsed = contactSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "Vérifiez les champs du formulaire (message : 10 caractères minimum)." };
    try {
        const requestHeaders = await headers();
        const address = process.env.TRUSTED_IP_HEADER ? requestHeaders.get(process.env.TRUSTED_IP_HEADER)?.split(",")[0] || "unknown" : "shared";
        if (!await allowRequest("contact", address, 5, 60 * 60 * 1000)) return { error: "Trop de messages. Réessayez plus tard." };
        const { name, email, subject, message } = parsed.data;
        const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
        const destination = process.env.CONTACT_EMAIL;
        if (!destination) throw new Error("Contact non configuré");
        await sendEmail(destination, `Contact boutique : ${subject.replace(/[\r\n]/g, " ")}`, `<p>${escape(name)} (${escape(email)})</p><p>${escape(message).replaceAll("\n", "<br>")}</p>`, `contact-${randomUUID()}`);
        return { success: true };
    } catch {
        return { error: "Envoi indisponible. Contactez-nous directement par e-mail ou téléphone." };
    }
}