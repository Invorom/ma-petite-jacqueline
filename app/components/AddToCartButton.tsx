'use client';

import { useCart } from "@/lib/cart-context";
import { Product } from "@prisma/client";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleAdd}
            className="flex items-center justify-center w-full md:w-auto px-8 py-3 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-primary transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
            disabled={added}
        >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {added ? "Ajouté !" : "Ajouter au panier"}
        </button>
    );
}
