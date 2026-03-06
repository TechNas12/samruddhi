"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuUser, LuArrowLeft, LuSave } from "react-icons/lu";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();
    const [form, setForm] = useState({ name: "", phone: "" });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) { router.push("/auth/login?redirect=/account/profile"); return; }
        if (user) setForm({ name: user.name || "", phone: user.phone || "" });
    }, [user, authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.updateMe(form);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            showNotification("Profile updated successfully!", "success");
        } catch (err) {
            showNotification(err.message, "error");
        }
        finally { setSaving(false); }
    };

    if (authLoading || !user) return null;

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/account" className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition-colors"><LuArrowLeft /> Back to Account</Link>
            <h1 className="text-2xl font-bold text-gray-900  mb-6 flex items-center gap-2"><LuUser className="text-green-600" /> Edit Profile</h1>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                        <input type="email" value={user.email} disabled className="input-field !bg-gray-50 !text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Name</label>
                        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saved ? "✓ Saved!" : saving ? "Saving..." : <><LuSave /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
