"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import { LuMinus, LuPlus, LuTrash2, LuArrowRight, LuShoppingBag } from "react-icons/lu";

export default function CartPage() {
    const { user } = useAuth();
    const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
    const { showNotification } = useNotification();
    const router = useRouter();

    const handleCheckout = () => {
        if (!user) {
            showNotification("Please sign in to proceed to checkout", "info");
            router.push("/auth/login?redirect=/checkout");
            return;
        }
        router.push("/checkout");
    };

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-2xl font-bold text-gray-900  mb-2">Your Cart is Empty</h1>
                <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
                <Link href="/products" className="btn-primary"><LuShoppingBag /> Browse Products</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900  mb-8">Shopping Cart ({totalItems} items)</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 flex gap-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                                🌿
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/products/${item.product?.slug}`} className="font-semibold text-gray-900 hover:text-green-700 transition-colors line-clamp-1">
                                    {item.product?.name}
                                </Link>
                                <p className="text-sm text-gray-500 mt-0.5">{item.product?.category?.name}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-100 transition-colors"><LuMinus className="text-sm" /></button>
                                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-100 transition-colors"><LuPlus className="text-sm" /></button>
                                    </div>
                                    <span className="font-bold text-green-700">₹{(item.product?.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors self-start p-1">
                                <LuTrash2 />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4 ">Order Summary</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                                <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span className="font-medium text-green-600">Free</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-green-700">₹{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        <button onClick={handleCheckout} className="btn-primary w-full justify-center mb-3">
                            Proceed to Checkout <LuArrowRight />
                        </button>
                        <Link href="/products" className="btn-secondary w-full justify-center flex items-center gap-2">
                            <LuShoppingBag /> Continue Shopping
                        </Link>
                        {!user && (
                            <p className="text-xs text-gray-500 text-center mt-3">You&apos;ll need to sign in before checkout</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
