"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LuLayoutDashboard, LuPackage, LuShoppingBag, LuMessageSquare, LuLayers, LuUsers, LuIndianRupee, LuTrendingUp, LuArrowRight, LuMail } from "react-icons/lu";

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/"); return; }
        if (user?.role === "admin") api.getAdminStats().then(setStats).catch(console.error);
    }, [user, authLoading]);

    if (authLoading || !user || user.role !== "admin") return null;

    const statCards = stats ? [
        { label: "Total Users", value: stats.total_users, icon: <LuUsers />, color: "from-blue-500 to-blue-600" },
        { label: "Total Products", value: stats.total_products, icon: <LuPackage />, color: "from-green-500 to-emerald-600" },
        { label: "Total Orders", value: stats.total_orders, icon: <LuShoppingBag />, color: "from-purple-500 to-purple-600" },
        { label: "Revenue", value: `₹${stats.total_revenue.toFixed(0)}`, icon: <LuIndianRupee />, color: "from-amber-500 to-orange-500" },
        { label: "Pending Orders", value: stats.pending_orders, icon: <LuTrendingUp />, color: "from-red-400 to-pink-500" },
    ] : [];

    const coreManagement = [
        { title: "Products", desc: "Add, edit, delete products", icon: <LuPackage />, href: "/admin/products" },
        { title: "Orders", desc: "View and update order status", icon: <LuShoppingBag />, href: "/admin/orders" },
        { title: "Categories", desc: "Add or edit categories", icon: <LuLayers />, href: "/admin/categories" },
        { title: "Users", desc: "Edit, delete users & manage roles", icon: <LuUsers />, href: "/admin/users" },
    ];

    const contentCommunication = [
        { title: "Carousel", desc: "Update home page hero slides", icon: <LuLayers />, href: "/admin/carousel" },
        { title: "Reviews", desc: "Moderate customer reviews", icon: <LuMessageSquare />, href: "/admin/reviews" },
        { title: "Testimonials", desc: "Add and feature customer testimonials", icon: <LuMessageSquare />, href: "/admin/testimonials" },
        { title: "Email Templates", desc: "Customize order confirmation emails", icon: <LuMail />, href: "/admin/email-templates" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900  mb-8 flex items-center gap-3">
                <LuLayoutDashboard className="text-green-600" /> Admin Dashboard
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white mb-3`}>{s.icon}</div>
                        <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                        <div className="text-sm text-gray-500">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Core Management */}
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                Core Management
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {coreManagement.map((c) => (
                    <Link key={c.href} href={c.href} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-xl group-hover:bg-green-100 transition-colors">{c.icon}</div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{c.title}</h3>
                            <p className="text-sm text-gray-500">{c.desc}</p>
                        </div>
                        <LuArrowRight className="text-gray-400 group-hover:text-green-600" />
                    </Link>
                ))}
            </div>

            {/* Content & Communication */}
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                Content & Communication
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
                {contentCommunication.map((c) => (
                    <Link key={c.href} href={c.href} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-xl group-hover:bg-green-100 transition-colors">{c.icon}</div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{c.title}</h3>
                            <p className="text-sm text-gray-500">{c.desc}</p>
                        </div>
                        <LuArrowRight className="text-gray-400 group-hover:text-green-600" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
