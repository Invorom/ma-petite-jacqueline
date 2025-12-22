import { products } from '@/lib/products';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AddToCartButton } from '@/app/components/AddToCartButton';

// Correct Typing for Page Props in Next.js 15+ (Params is a Promise)
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <Link href="/shop" className="inline-flex items-center text-sm text-brand-text/60 hover:text-brand-secondary mb-8">
                <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la boutique
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Placeholder */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-brand-text/30 bg-brand-light/50 text-xl font-display">
                    Image du Produit
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <h1 className="font-display text-4xl text-brand-secondary">{product.name}</h1>
                    <p className="text-2xl font-bold text-brand-text">{product.price} €</p>

                    <div className="prose prose-stone text-brand-text/80">
                        <p>{product.description}</p>
                        <p className="text-sm italic mt-4">Pièce unique faite main.</p>
                    </div>

                    <AddToCartButton product={product} />
                </div>
            </div>
        </div>
    );
}
