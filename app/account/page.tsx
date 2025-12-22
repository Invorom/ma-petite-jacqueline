'use client';

import { useState } from "react";

export default function AccountPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="container mx-auto py-16 px-4 flex justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-brand-secondary/10">
                <h1 className="font-display text-3xl text-brand-secondary text-center mb-8">
                    {isLogin ? "Mon Compte" : "Créer un compte"}
                </h1>

                <form className="space-y-6">
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-text">Nom complet</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-brand-text">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-brand-text">Mot de passe</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 rounded-lg border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/20"
                        />
                    </div>

                    <button type="submit" className="w-full py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all">
                        {isLogin ? "Se connecter" : "S'inscrire"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-brand-secondary underline hover:text-brand-primary"
                    >
                        {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                    </button>
                </div>
            </div>
        </div>
    );
}
