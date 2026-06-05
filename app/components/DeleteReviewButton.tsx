"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteReview } from "@/app/actions/review";
import { toast } from "sonner";

export function DeleteReviewButton({ reviewId, className = "" }: { reviewId: string, className?: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm("Voulez-vous vraiment supprimer cet avis ? Cette action est irréversible.")) {
            startTransition(async () => {
                try {
                    await deleteReview(reviewId);
                    toast.success("Avis supprimé avec succès");
                } catch (error) {
                    toast.error("Erreur lors de la suppression");
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 ${className}`}
            title="Supprimer cet avis (Admin)"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
