"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { addReview } from "@/app/actions/review";
import { cn } from "@/lib/utils";

export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("rating", rating.toString());
    formData.append("text", text);

    startTransition(async () => {
      try {
        await addReview(formData);
        setText("");
        setRating(5);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-12 bg-white border border-brand-secondary/20 p-8 rounded-2xl max-w-2xl mx-auto shadow-sm">
      <h2 className="font-display text-3xl text-brand-secondary mb-4 text-center">Laissez votre témoignage</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            aria-label={`${star} étoiles`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={cn(
                "w-8 h-8",
                (hoveredRating || rating) >= star
                  ? "fill-brand-primary text-brand-primary"
                  : "text-brand-primary/30"
              )}
            />
          </button>
        ))}
      </div>

      <div className="mb-6 relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Racontez-nous votre histoire avec Ma petite Jacqueline..."
          required
          minLength={5}
          maxLength={300}
          className="w-full min-h-[120px] p-4 rounded-xl border border-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 font-serif resize-y pb-8"
        />
        <div className={cn(
          "absolute bottom-3 right-4 text-xs",
          text.length > 280 ? "text-red-500" : "text-brand-text/40"
        )}>
          {text.length} / 300
        </div>
      </div>

      <div className="text-center">
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="px-8 py-3 bg-brand-secondary text-white rounded-full font-medium hover:bg-brand-primary transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Envoi en cours..." : "Publier mon avis"}
        </button>
      </div>
    </form>
  );
}
