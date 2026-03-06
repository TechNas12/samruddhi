"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuMapPin, LuPlus, LuTrash2, LuArrowLeft, LuPencil } from "react-icons/lu";

export default function AddressesPage() {
    const { user, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ full_name: "", phone: "", street: "", city: "", state: "", pincode: "", is_default: false });

    useEffect(() => {
        if (!authLoading && !user) { router.push("/auth/login?redirect=/account/addresses"); return; }
        if (user) loadAddresses();
    }, [user, authLoading]);

    const loadAddresses = () => {
        api.getAddresses().then(setAddresses).catch(console.error).finally(() => setLoading(false));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createAddress(form);
            setShowForm(false);
            setForm({ full_name: "", phone: "", street: "", city: "", state: "", pincode: "", is_default: false });
            loadAddresses();
            showNotification("Address set as default", "success");
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this address?")) return;
        try {
            await api.deleteAddress(id);
            loadAddresses();
            showNotification("Address deleted successfully", "success");
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    if (authLoading || !user) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/account" className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition-colors"><LuArrowLeft /> Back to Account</Link>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900  flex items-center gap-2"><LuMapPin className="text-amber-500" /> My Addresses</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm"><LuPlus /> Add Address</button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                        <input required placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" />
                        <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                    </div>
                    <input required placeholder="Street Address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="input-field" />
                    <div className="grid sm:grid-cols-3 gap-3">
                        <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
                        <input required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" />
                        <input required placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-field" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="accent-green-600" /> Set as default
                    </label>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary text-sm">Save</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : addresses.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No addresses saved yet.</p>
            ) : (
                <div className="space-y-3">
                    {addresses.map((a) => (
                        <div key={a.id} className="bg-white rounded-xl p-5 border border-gray-100 flex items-start justify-between">
                            <div>
                                <p className="font-medium text-gray-900">{a.full_name} {a.is_default && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">Default</span>}</p>
                                <p className="text-sm text-gray-600">{a.street}</p>
                                <p className="text-sm text-gray-600">{a.city}, {a.state} - {a.pincode}</p>
                                <p className="text-sm text-gray-500">Phone: {a.phone}</p>
                            </div>
                            <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-500 p-1"><LuTrash2 /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
