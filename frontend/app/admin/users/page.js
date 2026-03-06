"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuUsers, LuUserPlus, LuUserMinus, LuSearch, LuRefreshCw, LuChevronLeft, LuPencil, LuTrash2, LuX, LuSave, LuTriangleAlert } from "react-icons/lu";
import Link from "next/link";

export default function ManageUsers() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Edit modal state
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "user" });
    const [editSaving, setEditSaving] = useState(false);

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            showNotification("Failed to load users. Are you sure you're an admin?", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && (!currentUser || currentUser.role !== "admin")) {
            router.push("/");
            return;
        }
        if (currentUser?.role === "admin") {
            fetchUsers();
        }
    }, [currentUser, authLoading]);

    const handleRoleUpdate = async (userId, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        const confirmMsg = newRole === "admin"
            ? "Are you sure you want to promote this user to ADMIN?"
            : "Are you sure you want to demote this admin to USER?";

        if (!confirm(confirmMsg)) return;

        setUpdatingId(userId);
        try {
            await api.updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            showNotification(`User role updated to ${newRole}`, "success");
        } catch (error) {
            console.error("Failed to update role:", error);
            showNotification("Failed to update user role.", "error");
        } finally {
            setUpdatingId(null);
            if (userId === currentUser.id && newRole === "user") {
                window.location.reload();
            }
        }
    };

    // ── Edit handlers ──
    const openEditModal = (u) => {
        setEditingUser(u);
        setEditForm({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            role: u.role || "user",
        });
    };

    const closeEditModal = () => {
        setEditingUser(null);
        setEditForm({ name: "", email: "", phone: "", role: "user" });
    };

    const handleEditSave = async () => {
        if (!editingUser) return;
        setEditSaving(true);
        try {
            const updatedUser = await api.adminUpdateUser(editingUser.id, editForm);
            setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
            showNotification("User updated successfully!", "success");
            closeEditModal();
            // If admin changed their own role to user, reload
            if (editingUser.id === currentUser.id && editForm.role === "user") {
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to update user:", error);
            showNotification(error.message || "Failed to update user.", "error");
        } finally {
            setEditSaving(false);
        }
    };

    // ── Delete handlers ──
    const handleDeleteClick = (u) => {
        setDeleteConfirm(u);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        setDeletingId(deleteConfirm.id);
        try {
            await api.adminDeleteUser(deleteConfirm.id);
            setUsers(users.filter(u => u.id !== deleteConfirm.id));
            showNotification("User deleted successfully.", "success");
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Failed to delete user:", error);
            showNotification(error.message || "Failed to delete user.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || !currentUser || currentUser.role !== "admin") return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Link href="/admin" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 mb-2">
                        <LuChevronLeft /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <LuUsers className="text-green-600" /> Manage Users
                    </h1>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1 md:w-64">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="input-field !pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                        title="Refresh list"
                    >
                        <LuRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-black">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">User</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Joined</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">No users found match your search.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{u.name}</div>
                                                    <div className="text-xs text-gray-500">ID: #{u.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">{u.email}</div>
                                            <div className="text-xs text-gray-500">{u.phone || "No phone"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Edit button */}
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Edit user"
                                                >
                                                    <LuPencil size={14} /> Edit
                                                </button>

                                                {/* Role toggle button */}
                                                <button
                                                    onClick={() => handleRoleUpdate(u.id, u.role)}
                                                    disabled={updatingId === u.id}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${u.role === "admin"
                                                        ? "text-orange-600 hover:bg-orange-50"
                                                        : "text-green-600 hover:bg-green-50"
                                                        } disabled:opacity-50`}
                                                >
                                                    {updatingId === u.id ? (
                                                        <LuRefreshCw className="animate-spin" size={14} />
                                                    ) : u.role === "admin" ? (
                                                        <><LuUserMinus size={14} /> Demote</>
                                                    ) : (
                                                        <><LuUserPlus size={14} /> Promote</>
                                                    )}
                                                </button>

                                                {/* Delete button – hidden for self */}
                                                {u.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => handleDeleteClick(u)}
                                                        disabled={deletingId === u.id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                                                        title="Delete user"
                                                    >
                                                        {deletingId === u.id ? (
                                                            <LuRefreshCw className="animate-spin" size={14} />
                                                        ) : (
                                                            <><LuTrash2 size={14} /> Delete</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="mt-4 text-xs text-gray-400 italic">
                * Note: Demoting yourself will immediately revoke your administrative privileges. Deleting a user removes all their orders, reviews, cart, wishlist, and addresses.
            </p>

            {/* ── Edit User Modal ── */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={closeEditModal}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <LuPencil className="text-blue-600" /> Edit User
                            </h2>
                            <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <LuX size={20} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="Phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={closeEditModal}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={editSaving}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {editSaving ? <LuRefreshCw className="animate-spin" size={14} /> : <LuSave size={14} />}
                                {editSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-6 text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LuTriangleAlert className="text-red-600" size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
                            <p className="text-sm text-gray-500 mb-1">
                                Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteConfirm.name}</span>?
                            </p>
                            <p className="text-xs text-red-500 font-medium">
                                This will permanently remove all their orders, reviews, cart items, wishlist, and addresses.
                            </p>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deletingId === deleteConfirm.id}
                                className="flex-1 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-l border-gray-100 disabled:opacity-50"
                            >
                                {deletingId === deleteConfirm.id ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
