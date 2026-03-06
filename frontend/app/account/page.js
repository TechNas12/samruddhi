"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LuPackage, LuHeart, LuMapPin, LuUser, LuShoppingBag, LuArrowRight } from "react-icons/lu";

export default function AccountPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push("/auth/login?redirect=/account");
    }, [user, loading]);

    if (loading || !user) return null;

    const cards = [
        { title: "My Orders", desc: "Track your order history", icon: <LuPackage />, href: "/account/orders", color: "from-blue-500 to-blue-600" },
        { title: "Wishlist", desc: "Products you saved", icon: <LuHeart />, href: "/account/wishlist", color: "from-red-400 to-pink-500" },
        { title: "Addresses", desc: "Manage delivery addresses", icon: <LuMapPin />, href: "/account/addresses", color: "from-amber-400 to-orange-500" },
        { title: "Profile", desc: "Edit your profile", icon: <LuUser />, href: "/account/profile", color: "from-green-500 to-emerald-600" },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 ">Hello, {user.name}! 👋</h1>
                    <p className="text-gray-500">{user.email}</p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {cards.map((c) => (
                    <Link key={c.href} href={c.href} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${c.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                            {c.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{c.title}</h3>
                            <p className="text-sm text-gray-500">{c.desc}</p>
                        </div>
                        <LuArrowRight className="text-gray-400 group-hover:text-green-600 transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
