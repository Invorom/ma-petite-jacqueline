'use client';
import { useState } from "react";
import { sendContactMessage } from "@/app/actions/contact";

export default function ContactPage() {
    const [pending, setPending] = useState(false);
    const [result, setResult] = useState("");
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        setPending(true);
        setResult("");
        try {
            const response = await sendContactMessage(new FormData(form));
            setResult(response.error || "Votre message a été envoyé.");
            if (response.success) form.reset();
        } catch {
            setResult("Envoi impossible. Utilisez les coordonnées ci-dessous.");
        } finally {
            setPending(false);
        }
    }
    return (
        <div className="container mx-auto px-4 w-full max-w-2xl h-full flex flex-col items-center justify-center py-4">
            <h1 className="font-display text-4xl text-brand-secondary text-center mb-6">Contactez-moi</h1>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-secondary/10 w-full">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="name" className="text-sm font-bold text-brand-text">Nom</label>
                            <input
                                type="text"
                                id="name"
                                name="name" required minLength={2} maxLength={100} autoComplete="name"
                                className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                                placeholder="Votre nom"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-sm font-bold text-brand-text">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email" required maxLength={254} autoComplete="email"
                                className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                                placeholder="votre@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="subject" className="text-sm font-bold text-brand-text">Sujet</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject" required minLength={2} maxLength={150}
                            className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                            placeholder="Projet vaisselle, Question..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="message" className="text-sm font-bold text-brand-text">Message</label>
                        <textarea
                            id="message"
                            name="message" required minLength={10} maxLength={5000}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                            placeholder="Comment puis-je vous aider ?"
                        />
                    </div>

                    <p role="status" className="text-sm">{result}</p>
                    <button type="submit" disabled={pending} className="w-full py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all shadow-md disabled:opacity-50 mt-2">
                        {pending ? "Envoi..." : "Envoyer le message"}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center text-brand-text/80 space-y-1 text-sm">
                <p className="font-bold">Sandra Cadet</p>
                <p><a href="tel:0766156497">07 66 15 64 97</a></p>
                <p><a href="mailto:mapetitejacqueline@gmail.com">mapetitejacqueline@gmail.com</a></p>
            </div>
        </div>
    );
}
