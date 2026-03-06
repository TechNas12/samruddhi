"use client";
import React, { useState, useEffect, useCallback } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { getImageUrl } from "@/lib/api";

export default function ProductImageCarousel({ images = [], interval = 5, showDots = true, showArrows = true, size = "large" }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    useEffect(() => {
        if (images.length <= 1 || isHovered) return;

        const timer = setInterval(nextSlide, interval * 1000);
        return () => clearInterval(timer);
    }, [nextSlide, interval, images.length, isHovered]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl">
                <span className="text-8xl">🌿</span>
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-full group overflow-hidden rounded-2xl bg-white"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Image */}
            <div className="w-full h-full flex items-center justify-center relative">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${idx === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                            }`}
                    >
                        <img
                            src={getImageUrl(img)}
                            alt={`Product view ${idx + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && showArrows && (
                <>
                    <button
                        onClick={prevSlide}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${size === "small" ? "p-1.5" : "p-3"} rounded-full bg-white/80 backdrop-blur-md text-gray-800 shadow-lg hover:bg-white hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100 border border-gray-100`}
                    >
                        <LuChevronLeft size={size === "small" ? 16 : 24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 ${size === "small" ? "p-1.5" : "p-3"} rounded-full bg-white/80 backdrop-blur-md text-gray-800 shadow-lg hover:bg-white hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100 border border-gray-100`}
                    >
                        <LuChevronRight size={size === "small" ? 16 : 24} />
                    </button>
                </>
            )}

            {/* Clickable Dots */}
            {images.length > 1 && showDots && (
                <div className={`absolute ${size === "small" ? "bottom-3" : "bottom-6"} left-1/2 -translate-x-1/2 flex gap-2 z-10`}>
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`rounded-full transition-all duration-300 ${currentIndex === idx
                                    ? (size === "small" ? "w-6 bg-green-600" : "w-8 bg-green-600")
                                    : (size === "small" ? "w-1.5 bg-gray-300/80 hover:bg-white" : "w-3 bg-gray-300/80 hover:bg-white")
                                } ${size === "small" ? "h-1.5" : "h-3"}`}
                        />
                    ))}
                </div>
            )}

            {/* Version Tag for Debugging */}
            <div className="absolute top-2 right-2 text-[8px] text-gray-300 opacity-20 pointer-events-none z-50">v2.0-carousel</div>
        </div>
    );
}
