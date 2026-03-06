"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getImageUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import { LuStar, LuShoppingCart, LuHeart, LuMinus, LuPlus, LuArrowLeft, LuCheck } from "react-icons/lu";
import ProductImageCarousel from "@/components/ProductImageCarousel";

export default function ProductPage() {
    const { slug } = useParams();
    const { showNotification } = useNotification();
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addedToCart, setAddedToCart] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [carouselInterval, setCarouselInterval] = useState(5);

    useEffect(() => {
        if (slug) {
            loadProduct();
            loadSettings();
        }
    }, [slug]);

    const loadSettings = async () => {
        try {
            const setting = await api.getSetting("product_carousel_timer");
            setCarouselInterval(parseInt(setting.value) || 5);
        } catch (err) {
            console.error("Failed to load carousel settings:", err);
        }
    };

    const loadProduct = async () => {
        try {
            setLoading(true);
            const p = await api.getProduct(slug);
            setProduct(p);
            const r = await api.getReviews(p.id);
            setReviews(r);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            router.push("/auth/login?redirect=/products/" + slug);
            return;
        }
        try {
            await addToCart(product.id, quantity);
            router.push("/cart");
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            router.push("/auth/login?redirect=/products/" + slug);
            return;
        }
        try {
            await addToCart(product.id, quantity);
            router.push("/cart");
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    const handleAddToWishlist = async () => {
        if (!user) {
            router.push("/auth/login?redirect=/products/" + slug);
            return;
        }
        try {
            await api.addToWishlist({ product_id: product.id });
            showNotification("Added to wishlist!", "success");
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            router.push("/auth/login?redirect=/products/" + slug);
            return;
        }
        try {
            setSubmittingReview(true);
            await api.createReview({ ...reviewForm, product_id: product.id });
            setReviewForm({ rating: 5, comment: "" });
            showNotification("Review submitted successfully!", "success");
            loadProduct();
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="animate-pulse grid md:grid-cols-2 gap-12">
                    <div className="h-96 bg-gray-200 rounded-2xl" />
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-8 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-20 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return <div className="text-center py-20">Product not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-6 transition-colors">
                <LuArrowLeft /> Back
            </button>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Product Image Carousel */}
                <div className="bg-gray-50 rounded-3xl min-h-[400px] relative overflow-hidden group">
                    <ProductImageCarousel images={product.images} interval={carouselInterval} />

                    {product.compare_price && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg z-10">
                            {Math.round((1 - product.price / product.compare_price) * 100)}% OFF
                        </span>
                    )}
                </div>

                {/* Product Details */}
                <div>
                    <p className="text-sm text-green-600 font-medium uppercase tracking-wider mb-2">{product.category?.name}</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <LuStar key={s} className={`${s <= (product.avg_rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">
                            {product.avg_rating ? `${product.avg_rating} / 5` : "No ratings yet"} ({product.review_count || 0} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-3xl font-bold text-green-700">₹{product.price}</span>
                        {product.compare_price && (
                            <>
                                <span className="text-xl text-gray-400 line-through">₹{product.compare_price}</span>
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                    Save ₹{(product.compare_price - product.price).toFixed(0)}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

                    {/* Stock */}
                    <div className="mb-6">
                        {product.stock > 0 ? (
                            <span className="text-green-600 font-medium flex items-center gap-1"><LuCheck /> In Stock ({product.stock} available)</span>
                        ) : (
                            <span className="text-red-500 font-medium">Out of Stock</span>
                        )}
                    </div>

                    {/* Quantity & Actions */}
                    {product.stock > 0 && (
                        <div className="flex flex-wrap gap-4 items-center mb-6">
                            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-100 transition-colors"><LuMinus /></button>
                                <span className="px-4 font-semibold min-w-[40px] text-center">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-gray-100 transition-colors"><LuPlus /></button>
                            </div>

                            <button onClick={handleAddToCart} className="btn-secondary !border-2 !py-3.5 flex-1 justify-center">
                                <LuShoppingCart /> Add to Cart
                            </button>

                            <button onClick={handleBuyNow} className="btn-primary !py-3.5 flex-1 justify-center shadow-lg hover:shadow-green-200 transition-all active:scale-95">
                                Buy Now
                            </button>

                            <button onClick={handleAddToWishlist} className="p-3 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors">
                                <LuHeart />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Review Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
                            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                            {user ? (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-2">Rating</label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                                                    <LuStar className={`text-xl cursor-pointer transition-colors ${s <= reviewForm.rating ? "text-amber-400 fill-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-2">Comment</label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            className="input-field h-24 resize-none"
                                            placeholder="Share your experience..."
                                        />
                                    </div>
                                    <button type="submit" disabled={submittingReview} className="btn-primary w-full justify-center">
                                        {submittingReview ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            ) : (
                                <p className="text-gray-500 text-sm">Please <a href="/auth/login" className="text-green-600 font-medium hover:underline">sign in</a> to write a review.</p>
                            )}
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="md:col-span-2 space-y-4">
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-12">No reviews yet. Be the first to review!</p>
                        ) : (
                            reviews.map((r) => (
                                <div key={r.id} className="bg-white rounded-xl p-5 border border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">{r.user?.name?.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 text-sm">{r.user?.name}</span>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <LuStar key={s} className={`text-xs ${s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
