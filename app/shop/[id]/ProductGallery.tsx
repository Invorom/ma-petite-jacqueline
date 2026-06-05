"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, isGiftCard }: { images: string[], isGiftCard: boolean }) {
    const [mainImage, setMainImage] = useState(images[0] || "");

    if (images.length === 0) {
        if (isGiftCard) {
            return (
                <div className="w-full h-full bg-brand-light/50 flex flex-col items-center justify-center text-brand-secondary border-4 border-white shadow-sm rounded-2xl relative overflow-hidden">
                    <span className="font-display text-4xl mb-2 z-10">CADEAU</span>
                    <span className="font-bold text-brand-text/50 text-lg z-10">Ma petite Jacqueline</span>
                    <div className="absolute inset-0 bg-brand-secondary/5 blur-[100px] rounded-full"></div>
                </div>
            );
        }
        return (
            <div className="w-full h-full bg-brand-light/30 flex items-center justify-center text-brand-text/30 border-4 border-white shadow-sm rounded-2xl">
                Aucune image
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Main Image */}
            <div className="relative flex-1 bg-brand-light/20 rounded-2xl overflow-hidden border border-brand-secondary/10">
                {mainImage ? (
                    <Image src={mainImage} alt="Produit" fill className="object-contain" />
                ) : null}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar flex-none">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setMainImage(img)}
                            className={`relative w-20 h-20 flex-none rounded-lg overflow-hidden border-2 transition-all ${
                                mainImage === img ? "border-brand-secondary" : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                        >
                            <Image src={img} alt={`Miniature ${i + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
