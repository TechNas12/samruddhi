"use client";
import React, { useState } from "react";
import Link from "next/link";
import { LuStar, LuArrowRight, LuLeaf } from "react-icons/lu";
import { getImageUrl } from "@/lib/api";
import ProductImageCarousel from "./ProductImageCarousel";

export default function ProductCard({ product, interval = 5 }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            href={`/products/${product.slug}`}
            className="product-card group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                    <div className="w-full h-full relative">
                        {product.images.length > 1 ? (
                            <ProductImageCarousel
                                images={product.images}
                                interval={interval}
                                showDots={true}
                                showArrows={true}
                                size="small"
                            />
                        ) : (
                            <img
                                src={getImageUrl(product.images[0])}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 ease-out"
                            />
                        )}
                    </div>
                ) : (
                    <div className="text-green-300 opacity-50 group-hover:scale-125 transition-transform duration-300 ease-out">
                        <LuLeaf size={64} />
                    </div>
                )}

                {product.compare_price && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#064e3b] text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm z-10 border border-green-50 uppercase tracking-widest">
                        Save {Math.round((1 - product.price / product.compare_price) * 100)}%
                    </div>
                )}

                {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm z-10 border border-amber-100 uppercase tracking-widest">
                        {product.stock} Left
                    </span>
                )}

                {/* Floating Shadow Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-6">
                <div className="text-[10px] text-green-600 font-black uppercase tracking-[0.15em] mb-2">{product.category?.name}</div>
                <h3 className="font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors line-clamp-1 text-lg">{product.name}</h3>

                <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                        <LuStar key={s} className={`text-[10px] ${s <= (product.avg_rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1 font-bold">({product.review_count || 0})</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-gray-900">₹{product.price}</span>
                        {product.compare_price && <span className="text-sm text-gray-400 line-through font-medium">₹{product.compare_price}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-sm border border-green-100">
                        <LuArrowRight />
                    </div>
                </div>
            </div>
        </Link>
    );
}
