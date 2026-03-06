"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LuHeart, LuTrash2, LuShoppingCart, LuArrowLeft } from "react-icons/lu";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
    const { user, loading: authLoading } = useAuth();
    const { addToCart } = useCart();
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) { router.push("/auth/login?redirect=/account/wishlist"); return; }
        if (user) api.getWishlist().then(setItems).catch(console.error).finally(() => setLoading(false));
    }, [user, authLoading]);

    const handleRemove = async (id) => {
        await api.removeFromWishlist(id);
        setItems(items.filter((i) => i.id !== id));
    };

    const handleMoveToCart = async (item) => {
        await addToCart(item.product_id);
        await handleRemove(item.id);
        router.push("/cart");
    };

    if (authLoading || !user) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/account" className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition-colors"><LuArrowLeft /> Back to Account</Link>
            <h1 className="text-2xl font-bold text-gray-900  mb-6 flex items-center gap-2"><LuHeart className="text-red-500" /> My Wishlist</h1>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : items.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">💚</div>
                    <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                    <Link href="/products" className="btn-primary">Browse Products</Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <Link href={`/products/${item.product?.slug}`} className="block h-36 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center text-4xl">🌿</Link>
                            <div className="p-4">
                                <Link href={`/products/${item.product?.slug}`} className="font-semibold text-gray-900 hover:text-green-700">{item.product?.name}</Link>
                                <p className="text-lg font-bold text-green-700 mt-1">₹{item.product?.price}</p>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => handleMoveToCart(item)} className="btn-primary text-xs flex-1 justify-center !py-2"><LuShoppingCart /> Add to Cart</button>
                                    <button onClick={() => handleRemove(item.id)} className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200"><LuTrash2 /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
