import { prisma } from "@/lib/prisma";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AddToCartButton } from '@/app/components/AddToCartButton';
import { ProductGallery } from './ProductGallery';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return { title: 'Produit introuvable' };

    return {
        title: product.name,
        description: product.description.substring(0, 160),
        openGraph: {
            title: `${product.name} | Ma petite Jacqueline`,
            description: product.description.substring(0, 160),
            images: product.image ? [{ url: product.image }] : [],
            type: "website",
        }
    };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) {
        notFound();
    }

    let parsedImages: string[] = [];
    try {
        parsedImages = JSON.parse(product.images || "[]");
    } catch {
        // Fallback if parsing fails
    }
    // If no multi-images but there's a main image, put it in the array
    if (parsedImages.length === 0 && product.image) {
        parsedImages = [product.image];
    }

    const isGiftCard = product.category === "cartes-cadeaux";

    return (
        <div className="container mx-auto px-4 h-full flex flex-col py-6 overflow-y-auto">
            <Link href="/shop" className="inline-flex items-center text-sm text-brand-text/60 hover:text-brand-secondary mb-6 flex-none">
                <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la boutique
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Image Gallery */}
                <div className="h-[40vh] md:h-[60vh]">
                    <ProductGallery images={parsedImages} isGiftCard={isGiftCard} />
                </div>

                {/* Details */}
                <div className="flex flex-col justify-center space-y-6 pr-4 custom-scrollbar pb-6">
                    <div>
                        <p className="text-sm font-bold text-brand-text/50 uppercase tracking-wider mb-2">{product.category.replace("-", " ")}</p>
                        <h1 className="font-display text-4xl md:text-5xl text-brand-secondary leading-tight">{product.name}</h1>
                    </div>
                    
                    <p className="text-3xl font-bold text-brand-text">{product.price.toFixed(2)} €</p>

                    <div className="prose prose-stone text-brand-text/80 leading-relaxed bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10">
                        <p className="whitespace-pre-wrap">{product.description}</p>
                    </div>

                    <div className="pt-4 border-t border-brand-secondary/10 flex-none">
                        <p className="text-sm italic text-brand-text/60 mb-4">
                            {isGiftCard ? "Carte cadeau dématérialisée" : "Pièce artisanale unique, façonnée à la main."}
                        </p>
                        {isGiftCard || product.quantity > 0 ? <AddToCartButton product={product} /> : <p className="font-bold">Cette pièce n&apos;est plus disponible.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
