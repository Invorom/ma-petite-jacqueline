import { auth } from "@/auth";
import { ReviewForm } from "@/app/components/ReviewForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewReviewPage() {
    const session = await auth();

    return (
        <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-2xl">
                <Link href="/livre-d-or" className="inline-flex items-center text-sm text-brand-text/60 hover:text-brand-secondary mb-8">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Retour au livre d&apos;or
                </Link>

                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-brand-secondary/10">
                    <h1 className="font-display text-4xl text-brand-secondary text-center mb-4">Laissez votre témoignage</h1>
                    <p className="text-center font-serif text-brand-text/80 text-lg mb-8">
                        Racontez-nous votre histoire avec Ma petite Jacqueline.
                    </p>

                    {session ? (
                        <ReviewForm />
                    ) : (
                        <div className="text-center p-8 bg-brand-light/30 rounded-2xl border border-brand-secondary/10">
                            <p className="text-brand-text/80 mb-6 font-medium">Vous devez être connecté pour partager votre expérience.</p>
                            <Link href="/account" className="inline-block px-8 py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all shadow-md">
                                Se connecter
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
