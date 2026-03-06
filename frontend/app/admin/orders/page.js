"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuShoppingBag, LuArrowLeft, LuCheck, LuPackage, LuClock, LuTruck, LuXCircle } from "react-icons/lu";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/"); return; }
        if (user?.role === "admin") api.getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
    }, [user, authLoading]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.updateOrderStatus(orderId, { status: newStatus });
            setOrders(orders.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
            showNotification(`Order #${orderId} marked as ${newStatus}`, "success");
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    if (authLoading || !user || user.role !== "admin") return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition-colors"><LuArrowLeft /> Back to Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-900  mb-6 flex items-center gap-2"><LuShoppingBag className="text-purple-600" /> Manage Orders</h1>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order #</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((o) => (
                                <tr key={o.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium">#{o.id}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{o.items?.length || 0} items</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{o.total.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[o.status]}`}>{o.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-green-500">
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && !loading && <p className="text-center text-gray-500 py-8">No orders yet.</p>}
            </div>
        </div>
    );
}
