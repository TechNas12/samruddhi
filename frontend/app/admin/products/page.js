"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getImageUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuPackage, LuPlus, LuPencil, LuTrash2, LuArrowLeft, LuSettings, LuClock } from "react-icons/lu";
import ImageUploader from "@/components/ImageUploader";
import ProductImageCarousel from "@/components/ProductImageCarousel";

export default function AdminProductsPage() {
    const { user, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        name: "", slug: "", description: "", price: "", compare_price: "", category_id: "", stock: "", featured: false, images: [],
    });
    const [globalSettings, setGlobalSettings] = useState({
        product_carousel_timer: "5"
    });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/"); return; }
        if (user?.role === "admin") {
            api.getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));
            api.getCategories().then(setCategories).catch(console.error);
            api.getSetting("product_carousel_timer")
                .then(s => setGlobalSettings({ product_carousel_timer: s.value }))
                .catch(() => console.log("Default timer used"));
        }
    }, [user, authLoading]);

    const handleUpdateGlobalSettings = async (e) => {
        e.preventDefault();
        try {
            setSavingSettings(true);
            await api.updateSetting("product_carousel_timer", {
                value: globalSettings.product_carousel_timer,
                description: "Product detail page image transition interval"
            });
            showNotification("Global settings updated!", "success");
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...form,
            price: parseFloat(form.price),
            compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
            category_id: form.category_id ? parseInt(form.category_id) : null,
            stock: parseInt(form.stock) || 0,
            slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        };
        try {
            if (editing) {
                await api.updateProduct(editing, data);
            } else {
                await api.createProduct(data);
            }
            showNotification(`Product ${editing ? "updated" : "created"} successfully!`, "success");
            setShowForm(false);
            setEditing(null);
            setForm({ name: "", slug: "", description: "", price: "", compare_price: "", category_id: "", stock: "", featured: false, images: [] });
            const prods = await api.getProducts();
            setProducts(prods);
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    const handleEdit = (p) => {
        setEditing(p.id);
        setForm({
            name: p.name, slug: p.slug, description: p.description || "", price: p.price.toString(),
            compare_price: p.compare_price?.toString() || "", category_id: p.category_id?.toString() || "",
            stock: p.stock.toString(), featured: p.featured, images: p.images || [],
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this product?")) return;
        try {
            await api.deleteProduct(id);
            setProducts(products.filter((p) => p.id !== id));
            showNotification("Product deleted successfully", "success");
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    if (authLoading || !user || user.role !== "admin") return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition-colors"><LuArrowLeft /> Back to Dashboard</Link>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900  flex items-center gap-2"><LuPackage className="text-green-600" /> Manage Products</h1>
                <div className="flex gap-2">
                    <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", slug: "", description: "", price: "", compare_price: "", category_id: "", stock: "", featured: false, images: [] }); }} className="btn-primary text-sm shadow-md transition-all active:scale-95"><LuPlus /> Add Product</button>
                </div>
            </div>

            {/* Global Settings Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4 text-lg">
                    <LuSettings className="text-gray-400" /> Global Carousel Settings
                </h3>
                <form onSubmit={handleUpdateGlobalSettings} className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                            <LuClock size={12} /> Transition Timer (seconds)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={globalSettings.product_carousel_timer}
                            onChange={(e) => setGlobalSettings({ ...globalSettings, product_carousel_timer: e.target.value })}
                            className="input-field max-w-[150px]"
                        />
                    </div>
                    <button type="submit" disabled={savingSettings} className="btn-secondary !py-3 !px-6 text-sm mb-0.5 whitespace-nowrap">
                        {savingSettings ? "Saving..." : "Save Universal Timer"}
                    </button>
                    <p className="text-xs text-gray-400 mb-3 italic">This applies to all product carousels across the site.</p>
                </form>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-4 mb-4 text-lg">{editing ? "Update Product Details" : "Create New Product"}</h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Product Name</label>
                            <input required placeholder="e.g. Organic Vermicompost" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Slug (URL Path)</label>
                            <input placeholder="auto-generated-if-empty" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Detailed Description</label>
                        <textarea placeholder="Describe the benefits, origin, and usage of this product..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-24 resize-none" />
                    </div>

                    <div className="grid sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Price (₹)</label>
                            <input required type="number" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Compare at (₹)</label>
                            <input type="number" step="0.01" placeholder="Optional" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} className="input-field" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
                            <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
                                <option value="">Select...</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Stock Level</label>
                            <input type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Product Images</label>

                        {form.images.filter(img => img).length > 0 && (
                            <div className="mb-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2 ml-1">Live Carousel Preview</p>
                                <div className="max-w-xs mx-auto aspect-square rounded-xl overflow-hidden shadow-lg border border-white">
                                    <ProductImageCarousel images={form.images.filter(img => img)} interval={parseInt(globalSettings.product_carousel_timer)} />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {form.images.map((imgUrl, idx) => (
                                <div key={idx} className="relative">
                                    <ImageUploader
                                        currentImage={imgUrl}
                                        label={idx === 0 ? "Cover Image" : `Image ${idx + 1}`}
                                        onUpload={(url) => {
                                            const newImages = [...form.images];
                                            if (url) {
                                                newImages[idx] = url;
                                            } else {
                                                newImages.splice(idx, 1);
                                            }
                                            setForm({ ...form, images: newImages });
                                        }}
                                    />
                                    {idx === 0 && imgUrl && (
                                        <span className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">COVER</span>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, images: [...form.images, ""] })}
                                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer min-h-[160px]"
                            >
                                <LuPlus size={20} className="text-gray-400" />
                                <span className="text-xs font-medium text-gray-500">Add Image</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 italic ml-1">First image is used as the product cover.</p>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer group">
                            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded accent-green-600 cursor-pointer" />
                            <span>Featured on homepage</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                        <button type="submit" className="btn-primary py-2.5 px-6 shadow-sm">{editing ? "Update Product" : "Create Product"}</button>
                        <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary py-2.5 px-6">Cancel</button>
                    </div>
                </form>
            )}

            {/* Product Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Featured</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                                                {p.images?.length > 0 ? (
                                                    <img src={getImageUrl(p.images[0])} alt={p.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl">🌿</span>
                                                )}
                                            </div>
                                            <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{p.category?.name}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{p.price}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm font-medium ${p.stock > 10 ? "text-green-600" : p.stock > 0 ? "text-amber-600" : "text-red-600"}`}>{p.stock}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.featured && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Yes</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-blue-500 p-1"><LuPencil /></button>
                                        <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500 p-1 ml-1"><LuTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
