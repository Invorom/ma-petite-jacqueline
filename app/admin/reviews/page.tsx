import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { DeleteReviewButton } from "@/app/components/DeleteReviewButton";
import { Star } from "lucide-react";

export default async function AdminReviewsPage() {
    await requireAdmin();
    const reviews = await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } }
        }
    });

    return (
        <div>
            <h1 className="font-display text-4xl text-brand-secondary mb-8">Modération des Avis</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-brand-secondary/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-brand-light/50 text-brand-text/60 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Auteur</th>
                            <th className="px-6 py-4">Note</th>
                            <th className="px-6 py-4 w-1/2">Texte</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-secondary/10">
                        {reviews.map(review => (
                            <tr key={review.id} className="hover:bg-brand-light/20 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    {review.user?.name || review.user?.email}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex text-brand-primary">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-brand-text/80 text-sm italic break-all">
                                    &quot;{review.text}&quot;
                                </td>
                                <td className="px-6 py-4 text-xs text-brand-text/60">
                                    {review.createdAt.toLocaleDateString("fr-FR")}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DeleteReviewButton reviewId={review.id} />
                                </td>
                            </tr>
                        ))}
                        {reviews.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-brand-text/50 italic">
                                    Aucun avis à modérer.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
