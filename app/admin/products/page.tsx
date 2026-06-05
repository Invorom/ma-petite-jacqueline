import { prisma } from "@/lib/prisma";
import { ProductForm } from "./ProductForm";
import Image from "next/image";
import { deleteProduct } from "@/app/actions/product";
import { Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/app/components/Pagination";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const PAGE_SIZE = 5;
    const skip = (currentPage - 1) * PAGE_SIZE;

    const [totalProducts, products] = await Promise.all([
        prisma.product.count(),
        prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take: PAGE_SIZE,
        })
    ]);

    const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

    return (
        <div className="h-full flex flex-col">
            <h1 className="font-display text-4xl text-brand-secondary mb-8 flex-none">Gestion des Produits</h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Form to add product */}
                <div className="xl:col-span-1">
                    <ProductForm />
                </div>

                {/* List of existing products */}
                <div className="xl:col-span-2 space-y-6">
                    <h2 className="font-display text-2xl text-brand-secondary">Produits en ligne ({totalProducts})</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-brand-secondary/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-brand-light/50 text-brand-text/60 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Nom</th>
                                    <th className="px-6 py-4">Prix</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-secondary/10">
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-brand-light/20 transition-colors">
                                        <td className="px-6 py-4">
                                            {product.image ? (
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-brand-secondary/20">
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                </div>
                                            ) : product.category === "cartes-cadeaux" ? (
                                                <div className="w-12 h-12 rounded-lg bg-brand-light/50 flex flex-col items-center justify-center text-brand-secondary border border-brand-secondary/20">
                                                    <span className="font-display text-xs">CADEAU</span>
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-brand-light flex items-center justify-center text-xs text-brand-text/30">
                                                    Aucune
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {product.name}
                                            <p className="text-xs text-brand-text/50 font-normal">{product.category}</p>
                                        </td>
                                        <td className="px-6 py-4 text-brand-secondary font-bold">{product.price.toFixed(2)} €</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/products/${product.id}/edit`} className="p-2 text-brand-secondary hover:text-brand-primary hover:bg-brand-secondary/10 rounded-full transition-colors" title="Éditer le produit">
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteProduct(product.id);
                                                }}>
                                                    <button type="submit" className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Supprimer le produit">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-brand-text/50 italic">
                                            Aucun produit pour le moment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                            <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/products" />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
