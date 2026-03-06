"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import { LuMapPin, LuPlus, LuCheck, LuArrowLeft, LuTruck, LuCreditCard, LuArrowRight, LuShoppingBag } from "react-icons/lu";

export default function CheckoutPage() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const { items, totalPrice, fetchCart } = useCart();
    const router = useRouter();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [newAddr, setNewAddr] = useState({
        full_name: "", phone: "", street: "", city: "", state: "", pincode: "", is_default: false,
    });

    useEffect(() => {
        if (!user) {
            router.push("/auth/login?redirect=/checkout");
            return;
        }
        if (items.length === 0) {
            router.push("/cart");
            return;
        }
        loadAddresses();
    }, [user]);

    const loadAddresses = async () => {
        try {
            const data = await api.getAddresses();
            setAddresses(data);
            const def = data.find((a) => a.is_default);
            if (def) setSelectedAddress(def.id);
            else if (data.length > 0) setSelectedAddress(data[0].id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNewAddress = async (e) => {
        e.preventDefault();
        try {
            const addr = await api.createAddress(newAddr);
            setAddresses([...addresses, addr]);
            setSelectedAddress(addr.id);
            setShowNewAddress(false);
            setNewAddr({ full_name: "", phone: "", street: "", city: "", state: "", pincode: "", is_default: false });
            showNotification("Address saved successfully", "success");
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            showNotification("Please select a delivery address to proceed", "error");
            return;
        }
        try {
            setPlacing(true);
            await api.createOrder({ address_id: selectedAddress });
            await fetchCart();
            router.push("/account/orders?success=true");
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setPlacing(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900  mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Address Section */}
                <div className="lg:col-span-3 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <LuMapPin className="text-green-600" /> Delivery Address
                        </h2>

                        <div className="space-y-3">
                            {addresses.map((a) => (
                                <label key={a.id} className={`block bg-white rounded-xl p-4 border-2 cursor-pointer transition-colors ${selectedAddress === a.id ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                                    <div className="flex items-start gap-3">
                                        <input type="radio" name="address" checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} className="mt-1 accent-green-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">{a.full_name}</p>
                                            <p className="text-sm text-gray-600">{a.street}</p>
                                            <p className="text-sm text-gray-600">{a.city}, {a.state} - {a.pincode}</p>
                                            <p className="text-sm text-gray-500">Phone: {a.phone}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {!showNewAddress ? (
                            <button onClick={() => setShowNewAddress(true)} className="btn-secondary mt-3 text-sm">
                                <LuPlus /> Add New Address
                            </button>
                        ) : (
                            <form onSubmit={handleNewAddress} className="bg-white rounded-xl p-4 border border-gray-100 mt-3 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input required placeholder="Full Name" value={newAddr.full_name} onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })} className="input-field" />
                                    <input required placeholder="Phone" value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} className="input-field" />
                                </div>
                                <input required placeholder="Street Address" value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} className="input-field" />
                                <div className="grid grid-cols-3 gap-3">
                                    <input required placeholder="City" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="input-field" />
                                    <input required placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className="input-field" />
                                    <input required placeholder="Pincode" value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} className="input-field" />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="btn-primary text-sm">Save Address</button>
                                    <button type="button" onClick={() => setShowNewAddress(false)} className="btn-secondary text-sm">Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Order Items */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">🌿</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.product?.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="font-semibold text-green-700 text-sm">₹{(item.product?.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4 ">Order Summary</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Items Total</span><span>₹{totalPrice.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className="text-green-600">Free</span></div>
                            <div className="border-t pt-3 flex justify-between"><span className="font-semibold">Total</span><span className="text-xl font-bold text-green-700">₹{totalPrice.toFixed(2)}</span></div>
                        </div>
                        <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full justify-center">
                            {placing ? "Placing Order..." : <><LuCheck /> Place Order</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
