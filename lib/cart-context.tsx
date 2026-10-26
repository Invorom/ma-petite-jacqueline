'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { Product } from '@prisma/client';

type CartItem = Product & {
    quantity: number;
};

type CartContextType = {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function readCart(): CartItem[] {
    try {
        const parsed = JSON.parse(localStorage.getItem("cart") || "[]");
        return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.category === "string" && Number.isFinite(item.price) && item.price > 0).slice(0, 50).map(item => ({ ...item, quantity: 1 })) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [storedCart, setCart] = useState<CartItem[]>(readCart);
    const loaded = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
    const cart = loaded ? storedCart : [];

    // Save cart to local storage on change
    useEffect(() => {
        if (!loaded) return;
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch {}
    }, [cart, loaded]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                // Pièce unique : on ne peut pas ajouter le même produit deux fois
                return prev;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = useCallback(() => setCart([]), []);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
