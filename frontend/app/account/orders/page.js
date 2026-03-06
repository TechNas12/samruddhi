"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LuPackage, LuArrowLeft } from "react-icons/lu";
import Link from "next/link";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) { router.push("/auth/login?redirect=/account/orders"); return; }
        if (user) api.getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
    }, [user, authLoading]);

    if (authLoading || !user) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/account" className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition-colors"><LuArrowLeft /> Back to Account</Link>
            <h1 className="text-2xl font-bold text-gray-900  mb-6 flex items-center gap-2"><LuPackage className="text-green-600" /> My Orders</h1>

            {loading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="text-gray-500 mb-4">No orders yet.</p>
                    <Link href="/products" className="btn-primary">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div>
                                    <span className="text-sm text-gray-500">Order #{order.id}</span>
                                    <span className="mx-2 text-gray-300">•</span>
                                    <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || "bg-gray-100"}`}>{order.status}</span>
                            </div>
                            <div className="space-y-2">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 text-sm">
                                        <span className="text-gray-600">{item.product?.name || `Product #${item.product_id}`}</span>
                                        <span className="text-gray-400">× {item.quantity}</span>
                                        <span className="ml-auto font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t mt-3 pt-3 flex justify-between">
                                <span className="text-gray-500 text-sm">Total</span>
                                <span className="font-bold text-green-700">₹{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
