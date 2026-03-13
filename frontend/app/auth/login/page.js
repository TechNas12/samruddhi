"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuMail, LuLock, LuEye, LuEyeOff } from "react-icons/lu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Flower } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

function LoginContent() {
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await login(data.email, data.password);
            showNotification("Successfully signed in!", "success");
            router.push(redirect);
        } catch (err) {
            showNotification(err.message || "Invalid email or password.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Flower className="text-white text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 ">Welcome Back</h1>
                    <p className="text-gray-500 mt-1">Sign in to your Samruddhi account</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                            <div className="relative">
                                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    {...register("email")}
                                    className={`input-field !pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Your Email"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
                            <div className="relative">
                                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    className={`input-field !pl-10 !pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Your Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{errors.password.message}</p>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don&apos;t have an account?{" "}
                        <Link href={`/auth/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="text-green-600 font-medium hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}


