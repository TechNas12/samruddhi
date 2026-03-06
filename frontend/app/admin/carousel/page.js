"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, getImageUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuPlus, LuTrash2, LuPencil, LuArrowLeft, LuSave, LuX } from "react-icons/lu";
import ImageUploader from "@/components/ImageUploader";

export default function AdminCarousel() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        cta_text: "Shop Now",
        cta_link: "/products",
        bg_gradient: "from-green-800 via-green-700 to-emerald-600",
        image: "",
        emoji: "🌿",
        order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) {
            router.push("/");
            return;
        }
        if (user?.role === "admin") {
            fetchItems();
        }
    }, [user, authLoading, router]);

    const fetchItems = async () => {
        try {
            const data = await api.getAllCarouselItems();
            setItems(data);
        } catch (err) {
            console.error(err);
            showNotification("Failed to load carousel items", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item.id);
        setFormData({
            title: item.title,
            subtitle: item.subtitle || "",
            cta_text: item.cta_text || "",
            cta_link: item.cta_link || "",
            bg_gradient: item.bg_gradient || "",
            image: item.image || "",
            emoji: item.emoji || "",
            order: item.order,
            is_active: item.is_active,
        });
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            title: "",
            subtitle: "",
            cta_text: "Shop Now",
            cta_link: "/products",
            bg_gradient: "from-green-800 via-green-700 to-emerald-600",
            image: "",
            emoji: "🌿",
            order: items.length,
            is_active: true,
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.updateCarouselItem(editingItem, formData);
            } else {
                await api.createCarouselItem(formData);
            }
            setIsEditing(false);
            fetchItems();
            showNotification(`Slide ${editingItem ? "updated" : "created"} successfully!`, "success");
        } catch (err) {
            console.error(err);
            showNotification("Failed to save carousel item", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this slide?")) return;
        try {
            await api.deleteCarouselItem(id);
            fetchItems();
            showNotification("Slide deleted successfully", "success");
        } catch (err) {
            console.error(err);
            showNotification("Failed to delete item", "error");
        }
    };

    const toggleStatus = async (item) => {
        try {
            await api.updateCarouselItem(item.id, { is_active: !item.is_active });
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse flex flex-col gap-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.push("/admin")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow transition-all text-gray-600">
                    <LuArrowLeft />
                </button>
                <div>
                    <h1 className="text-2xl font-bold  text-gray-900">Manage Carousel</h1>
                    <p className="text-gray-500 text-sm">Update the home page hero slides</p>
                </div>
                <button onClick={handleAddNew} className="ml-auto btn-primary py-2 px-4 shadow-sm text-sm">
                    <LuPlus /> Add Slide
                </button>
            </div>

            {isEditing ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">{editingItem ? "Edit Slide" : "New Slide"}</h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><LuX /></button>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-lg p-4 mb-6 text-sm flex gap-3">
                        <span className="text-xl">ℹ️</span>
                        <div>
                            <p className="font-semibold mb-1">Image Size Guide</p>
                            <p>For the best responsive experience across devices, it is recommended to use high-resolution images with a landscape aspect ratio (e.g., <strong>1920x1080px</strong> or <strong>16:9</strong>). Center the main subject so it isn't cropped out on mobile devices.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Use \n for new lines)</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="input-field"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                <textarea
                                    rows={2}
                                    className="input-field"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.cta_text}
                                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.cta_link}
                                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Background Gradient (Tailwind classes)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.bg_gradient}
                                    onChange={(e) => setFormData({ ...formData, bg_gradient: e.target.value })}
                                    placeholder="e.g. from-green-800 via-green-700 to-emerald-600"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Background Image (Optional)</label>
                                <ImageUploader
                                    currentImage={formData.image}
                                    label="Upload Background Image"
                                    onUpload={(url) => setFormData({ ...formData, image: url })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.emoji}
                                        onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 text-green-600 rounded"
                            />
                            <label htmlFor="isActive" className="text-sm text-gray-700">Active (Visible on homepage)</label>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary py-2 px-4 shadow-sm text-sm">Cancel</button>
                            <button type="submit" className="btn-primary py-2 px-4 shadow-sm text-sm"><LuSave /> Save Slide</button>
                        </div>
                    </form>
                </div>
            ) : null}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                <th className="p-4 font-medium">Order</th>
                                <th className="p-4 font-medium">Appearance</th>
                                <th className="p-4 font-medium">Title & Subtitle</th>
                                <th className="p-4 font-medium">CTA</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 min-h-[300px]">
                            {items.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No carousel slides found.</td></tr>
                            ) : items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-gray-500 text-sm">{item.order}</td>
                                    <td className="p-4">
                                        <div className={`w-16 h-12 rounded bg-gradient-to-br ${item.bg_gradient || 'bg-gray-200'} flex items-center justify-center text-xl shadow-inner overflow-hidden border border-gray-100`}>
                                            {item.image ? (
                                                <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl">{item.emoji}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900 line-clamp-1">{item.title.replace(/\\n/g, ' ')}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1">{item.subtitle ? item.subtitle.replace(/\\n/g, ' ') : ""}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">{item.cta_text}</span>
                                        <span className="text-gray-400">{item.cta_link}</span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleStatus(item)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${item.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                                        >
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <LuPencil size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <LuTrash2 size={18} />
                                            </button>
                                        </div>
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
