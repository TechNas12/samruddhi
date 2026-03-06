"use client";
import { useState, useRef } from "react";
import { LuUpload, LuX, LuLoader, LuImage } from "react-icons/lu";
import { api, getImageUrl } from "@/lib/api";

export default function ImageUploader({ onUpload, currentImage, label = "Upload Image", className = "" }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;

        // Client-side validation
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(file.type)) {
            setError("Only JPEG, PNG, WebP, and GIF files are allowed.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File is too large. Maximum size is 5 MB.");
            return;
        }

        setError("");
        setUploading(true);
        try {
            const result = await api.uploadImage(file);
            onUpload(result.url);
        } catch (err) {
            setError(err.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        handleFile(file);
        // Reset so the same file can be selected again
        e.target.value = "";
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onUpload("");
        setError("");
    };

    return (
        <div className={className}>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleChange}
                className="hidden"
            />

            {currentImage ? (
                /* ── Preview Mode ── */
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                    <img
                        src={getImageUrl(currentImage)}
                        alt="Uploaded preview"
                        className="w-full h-40 object-cover"
                        onError={(e) => { e.target.src = ""; e.target.alt = "Image failed to load"; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={handleClick}
                            className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow transition-all"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red-500/90 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow transition-all"
                        >
                            <LuX size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                /* ── Drop Zone ── */
                <div
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer
                        transition-all duration-200 select-none
                        ${dragging
                            ? "border-green-500 bg-green-50/70 scale-[1.01]"
                            : "border-gray-200 bg-gray-50/50 hover:border-green-400 hover:bg-green-50/30"
                        }
                        ${uploading ? "pointer-events-none opacity-70" : ""}
                    `}
                >
                    {uploading ? (
                        <>
                            <LuLoader className="w-8 h-8 text-green-600 animate-spin" />
                            <span className="text-sm font-medium text-green-700">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dragging ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                {dragging ? <LuImage className="w-5 h-5" /> : <LuUpload className="w-5 h-5" />}
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">{label}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    Drag & drop or <span className="text-green-600 font-medium">browse</span>
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">JPEG, PNG, WebP, GIF • Max 5 MB</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    );
}
