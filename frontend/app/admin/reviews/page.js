"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LuMessageSquare, LuTrash2, LuStar, LuArrowLeft } from "react-icons/lu";

export default function AdminReviewsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/"); return; }
        if (user?.role === "admin") api.getReviews().then(setReviews).catch(console.error).finally(() => setLoading(false));
    }, [user, authLoading]);

    const handleDelete = async (id) => {
        if (!confirm("Delete this review?")) return;
        await api.deleteReview(id);
        setReviews(reviews.filter((r) => r.id !== id));
    };

    if (authLoading || !user || user.role !== "admin") return null;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition-colors"><LuArrowLeft /> Back to Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-900  mb-6 flex items-center gap-2"><LuMessageSquare className="text-blue-600" /> Manage Reviews</h1>

            {reviews.length === 0 && !loading ? (
                <p className="text-center text-gray-500 py-12">No reviews yet.</p>
            ) : (
                <div className="space-y-3">
                    {reviews.map((r) => (
                        <div key={r.id} className="bg-white rounded-xl p-5 border border-gray-100 flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 text-sm">{r.user?.name}</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <LuStar key={s} className={`text-xs ${s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-1">Product ID: {r.product_id}</p>
                                {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                            </div>
                            <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-500 p-1"><LuTrash2 /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
