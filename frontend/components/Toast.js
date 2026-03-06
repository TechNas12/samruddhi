"use client";
import React, { useEffect, useState } from "react";
import { LuLeaf, LuX } from "react-icons/lu";

export default function Toast({ message, type, onClose }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Start exit animation slightly before the context removes it
        const timer = setTimeout(() => setIsExiting(true), 4700);
        return () => clearTimeout(timer);
    }, []);

    const icons = {
        success: <LuLeaf className="text-green-600" />,
        error: <LuLeaf className="text-red-600" />,
        info: <LuLeaf className="text-blue-600" />,
    };

    const bgColors = {
        success: "bg-white border-green-500 text-green-900",
        error: "bg-white border-red-500 text-red-900",
        info: "bg-white border-blue-500 text-blue-900",
    };

    return (
        <div
            className={`
        pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl transition-all duration-500 ease-out transform
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
        ${bgColors[type] || bgColors.info}
        min-w-[320px] max-w-md border-2
      `}
        >
            <div className="text-xl flex-shrink-0">
                {icons[type] || icons.info}
            </div>
            <p className="text-sm font-medium text-gray-800 flex-1">{message}</p>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(onClose, 300);
                }}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
                <LuX className="text-gray-400" />
            </button>
        </div>
    );
}
