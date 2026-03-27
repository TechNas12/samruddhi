"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuShoppingBag, LuArrowLeft, LuCheck, LuPackage, LuClock, LuTruck, LuXCircle, LuChevronDown, LuChevronUp } from "react-icons/lu";

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

    const [expandedOrder, setExpandedOrder] = useState(null);

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (authLoading || !user || user.role !== "admin") return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition-colors"><LuArrowLeft /> Back to Dashboard</Link>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><LuShoppingBag className="text-purple-600" /> Manage Orders</h1>
                <p className="text-sm text-gray-500">{orders.length} total orders</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-10"></th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order #</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((o) => (
                                <React.Fragment key={o.id}>
                                    <tr className={`hover:bg-gray-50 transition-colors ${expandedOrder === o.id ? 'bg-purple-50/30' : ''}`}>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => toggleExpand(o.id)}
                                                className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-500"
                                            >
                                                {expandedOrder === o.id ? <LuChevronUp size={20} /> : <LuChevronDown size={20} />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">#{o.id}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="font-medium text-gray-900">{o.user?.name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500">{o.user?.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{o.total.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[o.status]}`}>{o.status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select 
                                                value={o.status} 
                                                onChange={(e) => handleStatusChange(o.id, e.target.value)} 
                                                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 bg-white"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                    {expandedOrder === o.id && (
                                        <tr>
                                            <td colSpan="7" className="px-8 py-6 bg-gray-50/50 border-y border-gray-100">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    {/* Customer & Address */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h4>
                                                            <p className="text-sm text-gray-700">
                                                                <strong>Name:</strong> {o.user?.name}<br />
                                                                <strong>Email:</strong> {o.user?.email}<br />
                                                                <strong>Phone:</strong> {o.user?.phone || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</h4>
                                                            <p className="text-sm text-gray-700">
                                                                {o.address?.full_name}<br />
                                                                {o.address?.street}, {o.address?.city}<br />
                                                                {o.address?.state} - {o.address?.pincode}<br />
                                                                <strong>Tel:</strong> {o.address?.phone}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="md:col-span-2">
                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Items</h4>
                                                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                                    <tr>
                                                                        <th className="text-left px-4 py-2">Product</th>
                                                                        <th className="text-center px-4 py-2">Qty</th>
                                                                        <th className="text-right px-4 py-2">Price</th>
                                                                        <th className="text-right px-4 py-2">Subtotal</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50">
                                                                    {o.items?.map((item) => (
                                                                        <tr key={item.id}>
                                                                            <td className="px-4 py-2 text-gray-700 font-medium">{item.product?.name || `Product #${item.product_id}`}</td>
                                                                            <td className="px-4 py-2 text-center text-gray-500">{item.quantity}</td>
                                                                            <td className="px-4 py-2 text-right text-gray-500">₹{item.price.toFixed(2)}</td>
                                                                            <td className="px-4 py-2 text-right font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                                <tfoot className="bg-gray-50 font-bold">
                                                                    <tr>
                                                                        <td colSpan="3" className="px-4 py-2 text-right text-gray-600">Total Amount</td>
                                                                        <td className="px-4 py-2 text-right text-purple-700 text-lg">₹{o.total.toFixed(2)}</td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && !loading && <p className="text-center text-gray-500 py-12">No orders found.</p>}
            </div>
        </div>
    );
}
