"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { LuStar, LuFilter, LuX, LuSearch } from "react-icons/lu";
import ProductCard from "@/components/ProductCard";



function ProductsContent() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [carouselInterval, setCarouselInterval] = useState(5);

    useEffect(() => {
        api.getSetting("product_carousel_timer").then(s => {
            if (s && s.value) setCarouselInterval(parseInt(s.value));
        }).catch(console.error);
    }, []);

    const [filters, setFilters] = useState({
        category: searchParams.get("category") || "",
        search: "",
        sortBy: "newest",
        minPrice: "",
        maxPrice: "",
    });

    useEffect(() => {
        api.getCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append("category", filters.category);
            if (filters.search) params.append("search", filters.search);
            if (filters.sortBy) params.append("sort_by", filters.sortBy);
            if (filters.minPrice) params.append("min_price", filters.minPrice);
            if (filters.maxPrice) params.append("max_price", filters.maxPrice);
            const data = await api.getProducts(params.toString());
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 ">Our Products</h1>
                    <p className="text-gray-500 mt-1">{products.length} products found</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input-field !pl-10"
                        />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className="md:hidden btn-secondary !py-2 !px-3">
                        <LuFilter />
                    </button>
                </div>
            </div>

            <div className="flex gap-8">
                {/* Sidebar Filters */}
                <aside className={`${showFilters ? "fixed inset-0 z-50 bg-white p-6 overflow-auto" : "hidden"} md:block md:relative md:w-64 flex-shrink-0`}>
                    {showFilters && (
                        <button onClick={() => setShowFilters(false)} className="md:hidden absolute top-4 right-4"><LuX className="text-xl" /></button>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-4 ">Filters</h3>

                    {/* Category */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Category</label>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => setFilters({ ...filters, category: "" })}
                                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? "bg-green-100 text-green-800 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                            >
                                All Categories
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setFilters({ ...filters, category: c.slug })}
                                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === c.slug ? "bg-green-100 text-green-800 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Sort By</label>
                        <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} className="input-field !py-2">
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Price Range</label>
                        <div className="flex gap-2">
                            <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className="input-field !py-2 w-1/2" />
                            <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="input-field !py-2 w-1/2" />
                        </div>
                    </div>

                    <button onClick={() => setFilters({ category: "", search: "", sortBy: "newest", minPrice: "", maxPrice: "" })} className="text-sm text-green-600 hover:text-green-800 font-medium">
                        Clear All Filters
                    </button>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-2xl animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-t-2xl" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((p) => (
                                <ProductCard key={p.id} product={p} interval={carouselInterval} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 animate-pulse text-center">Loading Products...</div>}>
            <ProductsContent />
        </Suspense>
    );
}

