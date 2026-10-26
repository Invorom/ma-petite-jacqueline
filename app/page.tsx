import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-6 px-4 bg-brand-light relative overflow-hidden">
      
      {/* Fleurs sur le côté gauche */}
      <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 -rotate-90 pointer-events-none opacity-60">
        <Image 
          src="/fleurs_jacqueline.png" 
          alt="Décoration florale gauche" 
          width={600} 
          height={300} 
          className="object-contain drop-shadow-sm" 
        />
      </div>

      {/* Fleurs sur le côté droit */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 rotate-90 pointer-events-none opacity-60">
        <Image 
          src="/fleurs_jacqueline.png" 
          alt="Décoration florale droite" 
          width={600} 
          height={300} 
          className="object-contain drop-shadow-sm" 
        />
      </div>

      <div className="max-w-3xl text-center space-y-6 z-10 relative">



        <div className="space-y-6 text-brand-text/90 leading-relaxed font-serif text-lg md:text-xl">
          <h1 className="font-display text-5xl md:text-7xl text-brand-secondary mb-4 tracking-wide drop-shadow-sm">
            Ma petite Jacqueline
          </h1>

          <p>
            Après le décès de mon papa en 2023, j&apos;ai voulu garder un souvenir de lui : sa tasse, celle dans laquelle il buvait son café chaque matin.
            En cherchant une façon de la garder toujours auprès de moi, est née <span className="font-bold text-brand-secondary">Ma petite Jacqueline</span>.
          </p>

          <p>
            Jacqueline, c&apos;était ma grand-mère chérie. Elle aimait les fleurs, la douceur, les petits riens qui embellissent le quotidien. Son prénom et sa bienveillance m&apos;ont profondément inspirée.
          </p>

          <div className="py-2">
            <p className="font-bold text-2xl text-brand-secondary mb-2">Ma petite Jacqueline,</p>
            <p>c&apos;est une histoire de cœur.</p>
            <p>Une entreprise née de l&apos;amour, de la mémoire et du goût des belles choses.</p>
          </div>

          <p>
            Ici, chaque pièce est <span className="font-bold text-brand-secondary">façonnée à la main</span>, avec attention et émotion.
            <br />
            Chaque création est <span className="font-bold text-brand-secondary">unique</span>, comme les histoires qu&apos;elle porte.
          </p>

          <div className="pt-4 font-display text-3xl md:text-4xl text-brand-secondary leading-snug">
            <p>Bienvenue dans mon univers,</p>
            <p className="text-xl md:text-2xl mt-2 text-brand-text/80 font-serif">où la vaisselle devient souvenir, et où chaque objet raconte un peu d&apos;amour. 💕</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link
            href="/shop"
            className="px-8 py-3 bg-brand-secondary text-white rounded-full text-lg font-medium hover:bg-brand-primary transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 transform duration-200"
          >
            Découvrir la boutique <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/vaisselle-de-famille"
            className="px-8 py-3 border-2 border-brand-secondary text-brand-secondary rounded-full text-lg font-medium hover:bg-brand-secondary/5 transition-all"
          >
            Projet &quot;Vaisselle de famille&quot;
          </Link>
        </div>

      </div>
    </div>
  );
}
