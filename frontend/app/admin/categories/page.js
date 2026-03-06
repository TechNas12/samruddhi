"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuLayers, LuPlus, LuPencil, LuTrash2, LuArrowLeft } from "react-icons/lu";

export default function AdminCategoriesPage() {
    const { user, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", slug: "", description: "" });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/"); return; }
        if (user?.role === "admin") api.getCategories().then(setCategories).catch(console.error).finally(() => setLoading(false));
    }, [user, authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") };
        try {
            if (editing) {
                await api.updateCategory(editing, data);
            } else {
                await api.createCategory(data);
            }
            showNotification(`Category ${editing ? "updated" : "created"} successfully!`, "success");
            setShowForm(false);
            setEditing(null);
            setForm({ name: "", slug: "", description: "" });
            api.getCategories().then(setCategories);
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    const handleEdit = (c) => {
        setEditing(c.id);
        setForm({ name: c.name, slug: c.slug, description: c.description || "" });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this category?")) return;
        try {
            await api.deleteCategory(id);
            setCategories(categories.filter((c) => c.id !== id));
            showNotification("Category deleted successfully", "success");
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    if (authLoading || !user || user.role !== "admin") return null;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition-colors"><LuArrowLeft /> Back to Dashboard</Link>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900  flex items-center gap-2"><LuLayers className="text-green-600" /> Manage Categories</h1>
                <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", slug: "", description: "" }); }} className="btn-primary text-sm"><LuPlus /> Add Category</button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4 text-lg">{editing ? "Update Category" : "New Category"}</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Category Name</label>
                            <input required placeholder="e.g. Composts & Soils" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Slug (URL)</label>
                            <input placeholder="auto-generated" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
                        <textarea placeholder="Briefly describe what this category includes..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-20 resize-none" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="btn-primary py-2 px-6 shadow-sm">{editing ? "Update" : "Create"}</button>
                        <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary py-2 px-6">Cancel</button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {categories.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-100">
                                <LuLayers size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{c.name}</p>
                                <p className="text-sm text-gray-500">{c.slug}</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => handleEdit(c)} className="text-gray-400 hover:text-blue-500 p-1"><LuPencil /></button>
                            <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 p-1"><LuTrash2 /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
