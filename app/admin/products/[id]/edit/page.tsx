import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditProductForm } from "./EditProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="font-display text-4xl text-brand-secondary mb-8">Éditer le produit</h1>
            <EditProductForm product={product} />
        </div>
    );
}
