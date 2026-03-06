"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuUser, LuMail, LuLock, LuPhone, LuLeaf, LuCheck } from "react-icons/lu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional().refine(val => !val || /^\+?[\d\s-]{10,}$/.test(val), {
        message: "Invalid phone number format",
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

function RegisterContent() {
    const { register: registerUser } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await registerUser(data.name, data.email, data.password, data.phone || null);
            showNotification("Welcome aboard! Your account is ready.", "success");
            router.push(redirect);
        } catch (err) {
            showNotification(err.message || "Registration failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LuLeaf className="text-white text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 ">Create Account</h1>
                    <p className="text-gray-500 mt-1">Join the Samruddhi Organics community</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                            <div className="relative">
                                <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("name")}
                                    className={`input-field !pl-10 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Your name"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                            <div className="relative">
                                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    {...register("email")}
                                    className={`input-field !pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone (optional)</label>
                            <div className="relative">
                                <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    {...register("phone")}
                                    className={`input-field !pl-10 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{errors.phone.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
                            <div className="relative">
                                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    {...register("password")}
                                    className={`input-field !pl-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{errors.password.message}</p>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3">
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{" "}
                        <Link href={`/auth/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="text-green-600 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}


