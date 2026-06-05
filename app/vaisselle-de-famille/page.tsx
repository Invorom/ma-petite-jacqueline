import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function VaisselleFamillePage() {
    return (
        <div className="container mx-auto px-4 flex flex-col items-center text-center h-full justify-center">
            <h1 className="font-display text-4xl text-brand-secondary mb-4">Projet "Vaisselle de famille"</h1>

            <div className="max-w-xl space-y-4 text-base font-serif text-brand-text/90 leading-snug bg-white p-6 rounded-xl shadow-sm border border-brand-secondary/10">
                <p>
                    Vous avez de la vaisselle qui vous tient à cœur, héritée d'un proche ou pleine de souvenirs ?
                </p>
                <p className="font-bold text-brand-secondary text-lg">
                    Je vous propose d'en faire un bijou unique et durable.
                </p>
                <p>
                    À partir d'un fragment de votre vaisselle, je crée pour vous un bijou sur mesure.
                </p>
                <p className="italic text-sm">
                    Parce que les objets ont une âme, et que certains méritent une seconde vie.
                </p>

                <div className="pt-4 border-t border-brand-secondary/20 mt-4">
                    <p className="mb-2 font-bold text-sm">Pour cela, contactez-moi :</p>
                    <div className="flex flex-col gap-2 items-center">
                        <a href="tel:0766156497" className="flex items-center gap-2 text-brand-secondary hover:underline text-sm font-medium">
                            <Phone className="w-4 h-4" /> 07 66 15 64 97
                        </a>
                        <a href="mailto:mapetitejacqueline@gmail.com" className="flex items-center gap-2 text-brand-secondary hover:underline text-sm font-medium">
                            <Mail className="w-4 h-4" /> mapetitejacqueline@gmail.com
                        </a>
                    </div>
                </div>

                <div className="pt-4">
                    <Link href="/contact" className="inline-block px-6 py-2 bg-brand-secondary text-white rounded-full font-bold text-sm hover:bg-brand-primary transition-all shadow-sm">
                        Accéder au formulaire de contact
                    </Link>
                </div>
            </div>
        </div>
    );
}
