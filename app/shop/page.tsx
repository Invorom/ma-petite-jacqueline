import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/products"; // Keep static categories or move to DB later
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image"; // If you want lazy loading, or standard img

import { Pagination } from "@/app/components/Pagination";

// Server Component
export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string, page?: string }> }) {
    const { category, page } = await searchParams;
    const parsedPage = Number(page || "1");
    const currentPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1;
    const PAGE_SIZE = 8;

    const categoryFilter = category && !["all", "tout-les-bijoux"].includes(category) ? { category } : {
        category: {
            not: "cartes-cadeaux"
        }
    };
    const whereClause = { ...categoryFilter, OR: [{ quantity: { gt: 0 } }, { category: "cartes-cadeaux" }] };

    const skip = (currentPage - 1) * PAGE_SIZE;

    const [totalProducts, products] = await Promise.all([
        prisma.product.count({ where: whereClause }),
        prisma.product.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip,
            take: PAGE_SIZE,
        })
    ]);

    const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
    const activeCategory = category || 'all';

    return (
        <div className="container mx-auto px-4 h-full flex flex-col py-6 overflow-y-auto">
            <h1 className="font-display text-4xl text-brand-secondary text-center mb-6 flex-none">La Boutique</h1>

            <div className="flex flex-col md:flex-row gap-8 flex-1">
                {/* Sidebar / Filters */}
                <aside className="w-full md:w-64 space-y-4 flex-none overflow-y-auto custom-scrollbar pr-2">
                    <h2 className="font-bold text-lg mb-4 text-brand-text">Catégories</h2>
                    <ul className="flex flex-wrap md:block gap-x-4 gap-y-2 md:space-y-2 text-sm md:text-base">
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

                {/* Product Grid & Pagination */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <Link key={product.id} href={`/shop/${product.id}`} className="group block min-h-0">
                                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-brand-secondary/10 h-full flex flex-col">
                                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                        {/* Handle image display */}
                                        {product.image && product.image.startsWith('http') ? (
                                            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : product.image ? (
                                            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : product.category === "cartes-cadeaux" ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-light/40 border-[8px] border-white text-brand-secondary">
                                                <span className="font-display text-2xl mb-1">CADEAU</span>
                                                <span className="font-bold text-brand-text/50 text-sm">Ma petite Jacqueline</span>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-brand-text/30 bg-brand-light/30">
                                                Aucune image
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col flex-none">
                                        <h3 className="font-bold text-brand-text group-hover:text-brand-secondary transition-colors truncate">{product.name}</h3>
                                        <p className="text-brand-secondary font-medium mt-1">{product.price.toFixed(2)} €</p>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {products.length === 0 && (
                            <p className="text-gray-500 py-12 col-span-full text-center flex-1">Aucun produit dans cette catégorie pour le moment.</p>
                        )}
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="mt-6 flex-none flex justify-center">
                            <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={`/shop?category=${activeCategory}`} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
