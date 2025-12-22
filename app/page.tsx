import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-4 px-4 bg-brand-light">
      <div className="max-w-3xl text-center space-y-4">

        <div className="space-y-3 text-brand-text/90 leading-relaxed font-serif text-base md:text-lg">
          <h1 className="font-display text-4xl md:text-5xl text-brand-secondary mb-2">Ma petite Jacqueline</h1>

          <p>
            Après le décès de mon papa en 2023, j'ai voulu garder un souvenir de lui : sa tasse, celle dans laquelle il buvait son café chaque matin.
            En cherchant une façon de la garder toujours auprès de moi, est née <span className="font-bold text-brand-secondary">Ma petite Jacqueline</span>.
          </p>

          <p>
            Jacqueline, c'était ma grand-mère chérie. Elle aimait les fleurs, la douceur, les petits riens qui embellissent le quotidien. Son prénom et sa bienveillance m'ont profondément inspirée.
          </p>

          <div className="py-2">
            <p className="font-bold text-lg text-brand-secondary">Ma petite Jacqueline,</p>
            <p>c'est une histoire de cœur.</p>
            <p>Une entreprise née de l'amour, de la mémoire et du goût des belles choses.</p>
          </div>

          <p>
            Ici, chaque pièce est <span className="font-bold">façonnée à la main</span>, avec attention et émotion.
            <br />
            Chaque création est <span className="font-bold">unique</span>, comme les histoires qu'elle porte.
          </p>

          <div className="pt-4 font-display text-2xl text-brand-secondary">
            <p>Bienvenue dans mon univers,</p>
            <p className="text-xl mt-1 text-brand-text">où la vaisselle devient souvenir, et où chaque objet raconte un peu d'amour. 💕</p>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link
            href="/shop"
            className="px-8 py-2 bg-brand-secondary text-white rounded-full font-medium hover:bg-brand-primary transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 transform duration-200"
          >
            Découvrir la boutique <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/vaisselle-de-famille"
            className="px-8 py-2 border border-brand-secondary text-brand-secondary rounded-full font-medium hover:bg-brand-secondary/5 transition-all"
          >
            Projet "Vaisselle de famille"
          </Link>
        </div>

      </div>
    </div>
  );
}
