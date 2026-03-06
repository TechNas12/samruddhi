import Link from "next/link";
import { LuLeaf, LuMail, LuPhone, LuMapPin, LuInstagram, LuTwitter, LuFacebook } from "react-icons/lu";

export default function Footer() {
    return (
        <footer className="bg-[#022c22] text-green-100/80 mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-black/10 overflow-hidden">
                                <img
                                    src="/logo.svg"
                                    alt="Samruddhi Organics Logo"
                                    className="w-full h-full object-contain p-1.5"
                                />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Samruddhi</span>
                        </div>
                        <p className="text-green-100/60 text-[0.95rem] leading-relaxed mb-8 max-w-sm">
                            Curating the finest organic experiences for urban lifstyles. Because nature deserves a place in your home.
                        </p>
                        <div className="flex gap-4">
                            {[LuInstagram, LuTwitter, LuFacebook].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all border border-white/10">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2">
                        <h4 className="text-white font-bold mb-6  text-sm uppercase tracking-widest">Shop</h4>
                        <div className="flex flex-col gap-4">
                            <Link href="/products" className="hover:text-white transition-colors text-sm font-medium">All Products</Link>
                            <Link href="/products?category=composts" className="hover:text-white transition-colors text-sm font-medium">Composts</Link>
                            <Link href="/products?category=seeds" className="hover:text-white transition-colors text-sm font-medium">Seeds</Link>
                            <Link href="/products?category=garden-tools" className="hover:text-white transition-colors text-sm font-medium">Tools</Link>
                        </div>
                    </div>

                    {/* Company */}
                    <div className="md:col-span-2">
                        <h4 className="text-white font-bold mb-6  text-sm uppercase tracking-widest">Explore</h4>
                        <div className="flex flex-col gap-4">
                            <Link href="/#about" className="hover:text-white transition-colors text-sm font-medium">Our Story</Link>
                            <Link href="/account" className="hover:text-white transition-colors text-sm font-medium">Account</Link>
                            <Link href="/cart" className="hover:text-white transition-colors text-sm font-medium">Cart</Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-4">
                        <h4 className="text-white font-bold mb-6  text-sm uppercase tracking-widest">Get in Touch</h4>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><LuMail className="text-green-500" /></div>
                                    samruddhiorganics@gmail.com
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><LuPhone className="text-green-500" /></div>
                                    +91 92842 93670
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><LuMapPin className="text-green-500" /></div>
                                    Pune, Maharashtra
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-green-100/40 text-xs font-medium uppercase tracking-widest">
                    <p>© 2026 Samruddhi Organics. Crafted for the earth.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
