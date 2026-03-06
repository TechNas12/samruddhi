"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { LuShoppingCart, LuUser, LuMenu, LuX, LuLeaf, LuLogOut, LuLayoutDashboard } from "react-icons/lu";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenu, setUserMenu] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-12 h-12 flex items-center justify-center transition-all duration-500 hover:scale-110">
                            <img
                                src="/logo.svg"
                                alt="Samruddhi Organics Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-green-900 group-hover:text-green-700 transition-colors">
                            Samruddhi Organics
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        {['Home', 'Products', 'About'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Home' ? '/' : item === 'About' ? '/#about' : '/products'}
                                className="text-[0.95rem] text-gray-600 hover:text-green-700 font-semibold tracking-wide transition-all relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-5">
                        <Link href="/cart" className="relative p-2 text-gray-700 hover:text-green-700 transition-all hover:scale-110">
                            <LuShoppingCart size={24} />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 w-5 h-5 bg-green-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenu(!userMenu)}
                                    className="flex items-center gap-2 px-1 py-1 pr-4 rounded-full bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all shadow-sm"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center shadow-md">
                                        <span className="text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="hidden sm:inline text-sm font-semibold text-gray-700">{user.name?.split(" ")[0]}</span>
                                </button>

                                {userMenu && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-fade-in-up z-50">
                                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                        </div>
                                        <Link href="/account" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                                            <LuUser className="text-green-600" /> My Account
                                        </Link>
                                        {user.role === "admin" && (
                                            <Link href="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                                                <LuLayoutDashboard className="text-green-600" /> Admin Dashboard
                                            </Link>
                                        )}
                                        <div className="border-t border-gray-50 mt-1 pt-1">
                                            <button onClick={() => { logout(); setUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <LuLogOut /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/auth/login" className="btn-primary !py-2.5 !px-6 !text-sm">
                                Sign In
                            </Link>
                        )}

                        <button className="md:hidden p-2 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <LuX size={24} /> : <LuMenu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-6 animate-slide-in">
                        <div className="flex flex-col gap-1">
                            {['Home', 'Products', 'About'].map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'Home' ? '/' : item === 'About' ? '/#about' : '/products'}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-semibold transition-all"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
