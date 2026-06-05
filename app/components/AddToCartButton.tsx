'use client';

import { useCart } from "@/lib/cart-context";
import { Product } from "@prisma/client";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart, cart } = useCart();
    const [added, setAdded] = useState(false);

    const isInCart = cart.some((item) => item.id === product.id);

    const handleAdd = () => {
        if (isInCart) return;
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (isInCart && !added) {
        return (
            <button
                disabled
                className="flex items-center justify-center w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-full font-bold opacity-80 cursor-not-allowed"
            >
                <Check className="w-5 h-5 mr-2" />
                Déjà dans le panier
            </button>
        );
    }

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
