"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setItems([]);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await api.getCart();
            setItems(data);
        } catch (err) {
            console.error("Failed to fetch cart:", err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        const item = await api.addToCart({ product_id: productId, quantity });
        await fetchCart();
        return item;
    };

    const updateQuantity = async (itemId, quantity) => {
        await api.updateCartItem(itemId, { quantity });
        await fetchCart();
    };

    const removeItem = async (itemId) => {
        await api.removeFromCart(itemId);
        await fetchCart();
    };

    const clearCart = async () => {
        await api.clearCart();
        setItems([]);
    };

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeItem, clearCart, totalItems, totalPrice, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
