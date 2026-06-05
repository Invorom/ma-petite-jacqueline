import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ currentPage, totalPages, baseUrl = "/livre-d-or" }: { currentPage: number, totalPages: number, baseUrl?: string }) {
    const getHref = (page: number) => {
        return baseUrl.includes('?') ? `${baseUrl}&page=${page}` : `${baseUrl}?page=${page}`;
    };

    return (
        <div className="flex items-center justify-center gap-4 text-brand-text">
            {currentPage > 1 ? (
                <Link 
                    href={getHref(currentPage - 1)}
                    className="p-2 hover:bg-brand-secondary/10 rounded-full transition-colors flex items-center justify-center"
                    title="Page précédente"
                >
                    <ChevronLeft className="w-5 h-5 text-brand-secondary" />
                </Link>
            ) : (
                <div className="p-2 text-brand-text/30 flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5" />
                </div>
            )}

            <span className="font-serif text-sm">
                Page {currentPage} sur {totalPages}
            </span>

            {currentPage < totalPages ? (
                <Link 
                    href={getHref(currentPage + 1)}
                    className="p-2 hover:bg-brand-secondary/10 rounded-full transition-colors flex items-center justify-center"
                    title="Page suivante"
                >
                    <ChevronRight className="w-5 h-5 text-brand-secondary" />
                </Link>
            ) : (
                <div className="p-2 text-brand-text/30 flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                </div>
            )}
        </div>
    );
}
