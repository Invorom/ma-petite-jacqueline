import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/products"; // Keep static categories or move to DB later
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image"; // If you want lazy loading, or standard img

// Server Component
export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;
    const activeCategory = category || 'all';

    const where = activeCategory === 'all' ? {} : { category: activeCategory };

    const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="font-display text-4xl text-brand-secondary text-center mb-12">La Boutique</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar / Filters */}
                <aside className="w-full md:w-64 space-y-4">
                    <h2 className="font-bold text-lg mb-4 text-brand-text">Catégories</h2>
                    <ul className="space-y-2">
                        {categories.map((cat) => (
                            <li key={cat.id}>
                                <Link
                                    href={`/shop?category=${cat.id}`}
                                    className={cn(
                                        "block w-full hover:text-brand-secondary transition-colors",
                                        activeCategory === cat.id ? "font-bold text-brand-secondary" : "text-brand-text/80"
                                    )}
                                >
                                    {cat.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Product Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Link key={product.id} href={`/shop/${product.id}`} className="group">
                            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-brand-secondary/10">
                                <div className="h-64 bg-gray-100 relative overflow-hidden">
                                    {/* Handle image display */}
                                    {product.image && product.image.startsWith('http') ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-brand-text/30 bg-brand-light/30">
                                            {product.image || "No Image"}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-brand-text group-hover:text-brand-secondary transition-colors truncate">{product.name}</h3>
                                    <p className="text-brand-secondary font-medium mt-1">{product.price} €</p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {products.length === 0 && (
                        <p className="text-gray-500 py-12 col-span-full text-center">Aucun produit dans cette catégorie pour le moment.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
