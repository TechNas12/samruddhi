"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { LuShoppingCart, LuUser, LuMenu, LuX, LuLeaf, LuLogOut, LuLayoutDashboard, LuChevronDown } from "react-icons/lu";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 bg-gradient-to-r from-[#f0f9f4]/95 via-white/95 to-white/95 backdrop-blur-md border-b border-green-200 ${scrolled ? "py-1.5 shadow-sm" : "py-2.5 md:py-3.5"
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12 md:h-16 transition-all duration-500">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group hover-lift shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-500">
                            <img
                                src="/logo.svg"
                                alt="Samruddhi Organics Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-[17px] sm:text-xl md:text-2xl font-black tracking-tight text-green-900">
                            Samruddhi<span className="text-green-600"> Organics</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-10">
                        {['Home', 'Products', 'About'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Home' ? '/' : item === 'About' ? '/#about' : '/products'}
                                className="text-[0.9rem] text-gray-600 hover:text-green-700 font-bold uppercase tracking-[0.1em] transition-all relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1.5 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4 md:gap-8 shrink-0">
                        <Link href="/cart" className="hidden md:block relative p-1.5 text-gray-700 hover:text-green-700 transition-all hover:scale-110">
                            <LuShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
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
                                    className="flex items-center gap-2 px-1.5 py-1.5 pr-4 rounded-full bg-white/50 border border-gray-100 hover:bg-white transition-all shadow-sm group"
                                >
                                    <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                                        <span className="text-white text-xs font-black uppercase">{user.name?.charAt(0)}</span>
                                    </div>
                                    <span className="hidden sm:inline text-xs font-black text-gray-800 uppercase tracking-widest">{user.name?.split(" ")[0]}</span>
                                    <LuChevronDown className={`text-gray-400 transition-transform duration-300 ${userMenu ? "rotate-180" : ""}`} size={14} />
                                </button>

                                {userMenu && (
                                    <div className="absolute right-0 mt-4 w-60 glass-card p-2 border border-white/40 shadow-premium z-50 animate-fade-in-up">
                                        <div className="px-4 py-4 border-b border-gray-100/50 mb-1">
                                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Authenticated</p>
                                            <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/account" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all">
                                                <LuUser size={18} className="text-green-600" /> My Profile
                                            </Link>
                                            {user.role === "admin" && (
                                                <Link href="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all">
                                                    <LuLayoutDashboard size={18} className="text-green-600" /> Administrative
                                                </Link>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-100/50 mt-1 pt-2 pb-1">
                                            <button onClick={() => { logout(); setUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                <LuLogOut size={18} /> End Session
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/auth/login" className="btn-primary !py-1.5 sm:!py-2 md:!py-2.5 !px-3 sm:!px-5 md:!px-8 !text-[10px] md:!text-xs !bg-[#064e3b] hover:!bg-[#022c22] whitespace-nowrap">
                                Sign In
                            </Link>
                        )}

                        <button className="md:hidden p-1.5 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <LuX className="w-6 h-6" /> : <LuMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden mt-4 pb-6 animate-slide-in">
                        <div className="glass-card border border-white/40 p-3 flex flex-col gap-2">
                            {['Home', 'Products', 'About'].map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'Home' ? '/' : item === 'About' ? '/#about' : '/products'}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-5 py-4 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                                >
                                    {item}
                                </Link>
                            ))}
                            <Link
                                href="/cart"
                                onClick={() => setMobileOpen(false)}
                                className="px-5 py-4 rounded-xl text-gray-700 bg-green-50/50 hover:bg-green-50 hover:text-green-700 font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-between"
                            >
                                <span className="flex items-center gap-3">
                                    <LuShoppingCart size={18} className="text-green-600" /> My Cart
                                </span>
                                {totalItems > 0 && (
                                    <span className="bg-green-600 text-white px-2.5 py-0.5 rounded-full text-[10px]">{totalItems} Items</span>
                                )}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
