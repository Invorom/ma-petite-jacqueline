'use client';

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

// Sub-component to handle logic requiring session context
function AccountContent() {
    const { data: session } = useSession();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Typesafe form handling could be improved with React Hook Form + Zod, 
    // keeping it simple native for this iteration per standard.
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const name = formData.get("name") as string;

        if (isLogin) {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Email ou mot de passe incorrect.");
            } else {
                router.refresh();
            }
        } else {
            // Register Logic
            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, name }),
                });

                if (res.ok) {
                    // Auto login after register
                    await signIn("credentials", {
                        redirect: false,
                        email,
                        password,
                    });
                    router.refresh();
                } else {
                    const data = await res.json();
                    setError(data.message || "Erreur lors de l'inscription.");
                }
            } catch (err) {
                setError("Une erreur est survenue.");
            }
        }
        setIsLoading(false);
    }

    if (session) {
        return (
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-brand-secondary/10 text-center">
                <h1 className="font-display text-3xl text-brand-secondary mb-4">Mon Compte</h1>
                <p className="text-brand-text mb-6">Bonjour, <span className="font-bold">{session.user?.name || session.user?.email}</span> !</p>

                <button
                    onClick={() => signOut()}
                    className="px-6 py-2 border border-brand-secondary text-brand-secondary rounded-full hover:bg-brand-secondary hover:text-white transition-colors"
                >
                    Se déconnecter
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-brand-secondary/10">
            <h1 className="font-display text-3xl text-brand-secondary text-center mb-8">
                {isLogin ? "Mon Compte" : "Créer un compte"}
            </h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-brand-text">Nom complet</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-text">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-text">Mot de passe</label>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all disabled:opacity-70"
                >
                    {isLoading ? "Chargement..." : (isLogin ? "Se connecter" : "S'inscrire")}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <button
                    type="button"
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError("");
                    }}
                    className="text-brand-secondary underline hover:text-brand-primary"
                >
                    {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
            </div>
        </div>
    );
}

export default function AccountPage() {
    return (
        <div className="container mx-auto py-16 px-4 flex justify-center">
            <SessionProvider>
                <AccountContent />
            </SessionProvider>
        </div>
    );
}
