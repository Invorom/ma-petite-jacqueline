import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function VaisselleFamillePage() {
    return (
        <div className="container mx-auto py-16 px-4 flex flex-col items-center text-center">
            <h1 className="font-display text-5xl text-brand-secondary mb-12">Projet "Vaisselle de famille"</h1>

            <div className="max-w-2xl space-y-8 text-lg font-serif text-brand-text/90 leading-relaxed bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-brand-secondary/10">
                <p>
                    Vous avez de la vaisselle qui vous tient à cœur, héritée d'un proche ou pleine de souvenirs ?
                </p>
                <p className="font-bold text-brand-secondary text-xl">
                    Je vous propose d'en faire un bijou unique et durable.
                </p>
                <p>
                    À partir d'un fragment de votre vaisselle, je crée pour vous un bijou sur mesure : Une façon douce et symbolique de garder un souvenir vivant.
                </p>
                <p className="italic">
                    Parce que les objets ont une âme, et que certains méritent une seconde vie.
                </p>

                <div className="pt-8 border-t border-brand-secondary/20">
                    <p className="mb-6 font-bold">Pour cela, contactez-moi :</p>
                    <div className="flex flex-col gap-4 items-center">
                        <a href="tel:0766156497" className="flex items-center gap-2 text-brand-secondary hover:underline">
                            <Phone className="w-5 h-5" /> 07 66 15 64 97
                        </a>
                        <a href="mailto:mapetitejacqueline@gmail.com" className="flex items-center gap-2 text-brand-secondary hover:underline">
                            <Mail className="w-5 h-5" /> mapetitejacqueline@gmail.com
                        </a>
                    </div>
                </div>

                <div className="pt-4">
                    <Link href="/contact" className="inline-block px-8 py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all">
                        Accéder au formulaire de contact
                    </Link>
                </div>
            </div>
        </div>
    );
}
