import { Star } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ReviewForm } from "@/app/components/ReviewForm";

import { Pagination } from "@/app/components/Pagination";

export default async function LivreDOrPage(
    props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
    const searchParams = await props.searchParams;
    const session = await auth();
    
    // Pagination logic
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    // Fetch total count and paginated reviews from the database
    const [totalReviews, reviews] = await Promise.all([
        prisma.review.count(),
        prisma.review.findMany({
            skip,
            take: limit,
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    ]);

    const totalPages = Math.ceil(totalReviews / limit);

    return (
        <div className="container mx-auto px-4 h-full flex flex-col pt-6 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 flex-none">
                <div className="text-center md:text-left">
                    <h1 className="font-display text-4xl text-brand-secondary mb-2">Livre d'or</h1>
                    <p className="text-brand-text/80 text-sm max-w-lg">
                        Découvrez les retours de nos clients ou partagez votre propre expérience avec Ma petite Jacqueline.
                    </p>
                </div>
                <Link 
                    href="/livre-d-or/nouveau" 
                    className="inline-flex items-center px-6 py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all shadow-md shrink-0"
                >
                    Laisser un avis
                </Link>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {reviews.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-brand-text/50 italic text-lg">Soyez le premier à laisser un avis !</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 w-full max-w-6xl mx-auto">
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-2">
                                {reviews.map((review) => (
                                <div key={review.id} className="relative break-inside-avoid bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary/10 flex flex-col hover:shadow-md transition-shadow">
                                    <div className="flex text-brand-primary mb-3">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-current" />
                                        ))}
                                        {/* Empty stars if rating < 5 */}
                                        {[...Array(5 - review.rating)].map((_, i) => (
                                            <Star key={`empty-${i}`} className="w-4 h-4 text-brand-primary/30" />
                                        ))}
                                    </div>
                                    <p className="font-serif italic text-brand-text/90 mb-4 flex-grow text-lg break-all">
                                        "{review.text}"
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-brand-secondary/10">
                                        <p className="font-bold text-brand-secondary">
                                            {review.user?.name || review.user?.email?.split('@')[0] || "Anonyme"}
                                        </p>
                                        <p className="text-xs text-brand-text/60">
                                            {review.createdAt.toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="mt-4 pb-2 flex justify-center flex-none">
                                <Pagination currentPage={page} totalPages={totalPages} baseUrl="/livre-d-or" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
