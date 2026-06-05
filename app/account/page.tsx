"use client";

import { useState, useTransition, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Lock, LogOut } from "lucide-react";
import { changePassword, getUserOrders } from "@/app/actions/user";

function AccountContent() {
    const { data: session } = useSession();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [orders, setOrders] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        if (session?.user) {
            getUserOrders().then(setOrders);
        }
    }, [session]);

    async function handleAuthSubmit(e: React.FormEvent<HTMLFormElement>) {
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
            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, name }),
                });

                if (res.ok) {
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

    const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");
        const formData = new FormData(e.currentTarget);
        const form = e.currentTarget;

        startTransition(async () => {
            try {
                await changePassword(formData);
                setPasswordSuccess("Mot de passe modifié avec succès !");
                form.reset();
            } catch (err: any) {
                setPasswordError(err.message || "Une erreur est survenue.");
            }
        });
    };

    if (session) {
        return (
            <div className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-brand-secondary/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="font-display text-4xl text-brand-secondary mb-2">Mon Espace</h1>
                        <p className="text-brand-text/80 font-serif">
                            Bonjour, <span className="font-bold text-brand-secondary">{session.user?.name || session.user?.email}</span> !
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {(session.user as any)?.role === "ADMIN" && (
                            <Link href="/admin" className="flex items-center gap-2 px-6 py-2 border border-brand-primary text-brand-primary rounded-full hover:bg-brand-primary hover:text-white transition-colors text-sm font-medium">
                                Administration
                            </Link>
                        )}
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-2 px-6 py-2 border border-brand-secondary/20 text-brand-text rounded-full hover:bg-brand-secondary hover:text-white transition-colors text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" /> Se déconnecter
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Commandes Section */}
                    <div className="bg-brand-light/30 p-6 rounded-2xl border border-brand-secondary/10 flex flex-col">
                        <div className="flex items-center gap-3 mb-6 border-b border-brand-secondary/10 pb-4">
                            <div className="p-3 bg-brand-secondary/10 rounded-full text-brand-secondary">
                                <Package className="w-6 h-6" />
                            </div>
                            <h2 className="font-display text-2xl text-brand-secondary">Mes Commandes</h2>
                        </div>
                        <div className="flex-grow flex flex-col p-2 space-y-4 max-h-[400px] overflow-y-auto">
                            {orders.length === 0 ? (
                                <div className="text-center p-6 text-brand-text/60 italic font-serif my-auto">
                                    <p>Vous n'avez aucune commande en cours.</p>
                                    <p className="text-sm mt-2">Lorsque vous passerez commande, le suivi apparaîtra ici.</p>
                                </div>
                            ) : (
                                orders.map((order) => {
                                    const items = JSON.parse(order.itemsJson || "[]");
                                    return (
                                        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-brand-secondary/10 text-sm">
                                            <div className="flex justify-between items-center mb-2 border-b border-brand-secondary/10 pb-2">
                                                <span className="font-bold text-brand-secondary">
                                                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </span>
                                                <span className="font-bold text-brand-text">{order.totalAmount.toFixed(2)} €</span>
                                            </div>
                                            <div className="space-y-2 mt-2">
                                                {items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-brand-text/80">
                                                        <span>{item.name || "Produit"}</span>
                                                        <span>{item.price.toFixed(2)} €</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Informations Section */}
                    <div className="bg-brand-light/30 p-6 rounded-2xl border border-brand-secondary/10">
                        <div className="flex items-center gap-3 mb-6 border-b border-brand-secondary/10 pb-4">
                            <div className="p-3 bg-brand-secondary/10 rounded-full text-brand-secondary">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h2 className="font-display text-2xl text-brand-secondary">Mot de passe</h2>
                        </div>

                        {passwordSuccess && (
                            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
                                {passwordSuccess}
                            </div>
                        )}
                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                                {passwordError}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-brand-text/80 uppercase tracking-wider">Mot de passe actuel</label>
                                <input
                                    name="currentPassword"
                                    type="password"
                                    required
                                    className="w-full mt-1 px-4 py-2 rounded-xl border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-brand-text/80 uppercase tracking-wider">Nouveau mot de passe</label>
                                <input
                                    name="newPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full mt-1 px-4 py-2 rounded-xl border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-brand-text/80 uppercase tracking-wider">Confirmer le nouveau mot de passe</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full mt-1 px-4 py-2 rounded-xl border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-white"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-3 bg-brand-secondary text-white rounded-xl font-medium hover:bg-brand-primary transition-colors disabled:opacity-50 mt-2"
                            >
                                {isPending ? "Modification..." : "Mettre à jour le mot de passe"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-brand-secondary/10">
            <h1 className="font-display text-4xl text-brand-secondary text-center mb-8">
                {isLogin ? "Mon Compte" : "Créer un compte"}
            </h1>

            {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl text-sm text-center border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-5">
                {!isLogin && (
                    <div>
                        <label className="text-sm font-bold text-brand-text">Nom complet</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full mt-1 px-4 py-3 rounded-xl border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/30"
                        />
                    </div>
                )}

                <div>
                    <label className="text-sm font-bold text-brand-text">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full mt-1 px-4 py-3 rounded-xl border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/30"
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-brand-text">Mot de passe</label>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="w-full mt-1 px-4 py-3 rounded-xl border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 bg-brand-light/30"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 mt-2 bg-brand-secondary text-white rounded-xl font-bold hover:bg-brand-primary transition-all disabled:opacity-70 shadow-sm"
                >
                    {isLoading ? "Chargement..." : (isLogin ? "Se connecter" : "S'inscrire")}
                </button>
            </form>

            <div className="mt-8 text-center text-sm">
                <button
                    type="button"
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError("");
                    }}
                    className="text-brand-text/80 hover:text-brand-secondary transition-colors font-medium underline underline-offset-4"
                >
                    {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
            </div>
        </div>
    );
}

export default function AccountPage() {
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center h-full items-center">
            <SessionProvider>
                <AccountContent />
            </SessionProvider>
        </div>
    );
}
