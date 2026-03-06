"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuPlus, LuTrash2, LuPencil, LuArrowLeft, LuSave, LuX, LuStar } from "react-icons/lu";

export default function AdminTestimonials() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        rating: 5,
        text: "",
        is_featured: true,
        order: 0,
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
            const data = await api.getAllTestimonials();
            setItems(data);
        } catch (err) {
            console.error(err);
            showNotification("Failed to load testimonials", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item.id);
        setFormData({
            name: item.name,
            location: item.location || "",
            rating: item.rating,
            text: item.text,
            is_featured: item.is_featured,
            order: item.order,
        });
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            name: "",
            location: "",
            rating: 5,
            text: "",
            is_featured: true,
            order: items.length,
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.updateTestimonial(editingItem, formData);
            } else {
                await api.createTestimonial(formData);
            }
            setIsEditing(false);
            fetchItems();
            showNotification(`Testimonial ${editingItem ? "updated" : "created"} successfully!`, "success");
        } catch (err) {
            console.error(err);
            showNotification("Failed to save testimonial", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;
        try {
            await api.deleteTestimonial(id);
            fetchItems();
            showNotification("Testimonial deleted successfully", "success");
        } catch (err) {
            console.error(err);
            showNotification("Failed to delete testimonial", "error");
        }
    };

    const toggleFeatured = async (item) => {
        try {
            await api.updateTestimonial(item.id, { is_featured: !item.is_featured });
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
                    <h1 className="text-2xl font-bold  text-gray-900">Manage Testimonials</h1>
                    <p className="text-gray-500 text-sm">Create and moderate customer testimonials</p>
                </div>
                <button onClick={handleAddNew} className="ml-auto btn-primary py-2 px-4 shadow-sm text-sm">
                    <LuPlus /> Add Testimonial
                </button>
            </div>

            {isEditing ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">{editingItem ? "Edit Testimonial" : "New Testimonial"}</h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><LuX /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location (e.g. Pune)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial Text</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="input-field"
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                <select
                                    className="input-field"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                >
                                    {[5, 4, 3, 2, 1].map(r => (
                                        <option key={r} value={r}>{r} Stars</option>
                                    ))}
                                </select>
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
                        <div className="flex items-center gap-2 mt-4">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={formData.is_featured}
                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                className="w-4 h-4 text-green-600 rounded"
                            />
                            <label htmlFor="isFeatured" className="text-sm text-gray-700">Featured (Visible on homepage)</label>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary py-2 px-4 shadow-sm text-sm">Cancel</button>
                            <button type="submit" className="btn-primary py-2 px-4 shadow-sm text-sm"><LuSave /> Save Testimonial</button>
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
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Rating</th>
                                <th className="p-4 font-medium">Testimonial</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 min-h-[300px]">
                            {items.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No testimonials found.</td></tr>
                            ) : items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-gray-500 text-sm">{item.order}</td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.location}</div>
                                    </td>
                                    <td className="p-4 text-sm text-amber-500 flex items-center gap-1">
                                        <LuStar className="fill-current" /> {item.rating}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <p className="line-clamp-2 max-w-md">{item.text}</p>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleFeatured(item)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${item.is_featured ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                                        >
                                            {item.is_featured ? 'Featured' : 'Standard'}
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
