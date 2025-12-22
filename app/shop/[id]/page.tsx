import { prisma } from "@/lib/prisma";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AddToCartButton } from '@/app/components/AddToCartButton';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <Link href="/shop" className="inline-flex items-center text-sm text-brand-text/60 hover:text-brand-secondary mb-8">
                <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la boutique
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xl font-display overflow-hidden">
                    {product.image && product.image.startsWith('http') ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-brand-text/30 bg-brand-light/50 w-full h-full flex items-center justify-center">
                            {product.image || "Image du Produit"}
                        </span>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <h1 className="font-display text-4xl text-brand-secondary">{product.name}</h1>
                    <p className="text-2xl font-bold text-brand-text">{product.price} €</p>

                    <div className="prose prose-stone text-brand-text/80">
                        <p>{product.description}</p>
                        <p className="text-sm italic mt-4">Pièce unique, quantité : {product.quantity}</p>
                    </div>

                    <AddToCartButton product={product} />
                </div>
            </div>
        </div>
    );
}
