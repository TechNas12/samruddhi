"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { LuMail, LuChevronLeft, LuSave, LuRefreshCw, LuRotateCcw, LuEye, LuCode, LuInfo } from "react-icons/lu";
import Link from "next/link";

const PLACEHOLDERS = [
    { key: "{{user_name}}", desc: "Customer name" },
    { key: "{{user_email}}", desc: "Customer email" },
    { key: "{{user_phone}}", desc: "Customer phone" },
    { key: "{{order_id}}", desc: "Order ID" },
    { key: "{{order_date}}", desc: "Formatted order date" },
    { key: "{{items_html}}", desc: "HTML table rows of ordered items" },
    { key: "{{total}}", desc: "Order total (₹)" },
    { key: "{{address_html}}", desc: "Formatted shipping address" },
    { key: "{{admin_email}}", desc: "Admin contact email" },
    { key: "{{FRONTEND_URL}}", desc: "Frontend base URL" },
];


const SAMPLE_VALUES = {
    user_name: "Rahul Sharma",
    user_email: "rahul@example.com",
    user_phone: "9876543210",
    order_id: "42",
    order_date: "March 05, 2026",
    items_html: `
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Organic Turmeric Powder (x2)</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹300</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Cold Pressed Coconut Oil (x1)</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹450</td></tr>
    `,
    total: "750",
    address_html: "Rahul Sharma<br>123 MG Road<br>Pune, Maharashtra 411001<br>Phone: 9876543210",
    admin_email: "admin@samruddhi.com",
    FRONTEND_URL: "http://localhost:3000",
};


// Default templates must match the backend defaults
const DEFAULT_BUYER_TEMPLATE = `<html>
<head></head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #064e3b; text-align: center;">Thank you for your order, {{user_name}}!</h2>
    <p>We've received your order and are currently processing it. Here are the details:</p>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold;">Order ID: #{{order_id}}</p>
        <p style="margin: 0; color: #666;">Date: {{order_date}}</p>
    </div>

    <h3 style="color: #064e3b; border-bottom: 2px solid #064e3b; padding-bottom: 5px;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        {{items_html}}
        <tr>
            <td style="padding: 10px; font-weight: bold; text-align: right;">Total</td>
            <td style="padding: 10px; font-weight: bold; text-align: right; color: #064e3b; font-size: 1.2em;">₹{{total}}</td>
        </tr>
    </table>

    <h3 style="color: #064e3b; border-bottom: 2px solid #064e3b; padding-bottom: 5px;">Shipping Address</h3>
    <p>{{address_html}}</p>

    <p style="text-align: center; margin-top: 40px; color: #666; font-size: 0.9em;">
        If you have any questions, reply to this email or contact us at {{admin_email}}
    </p>
</body>
</html>`;

const DEFAULT_ADMIN_TEMPLATE = `<html>
<head></head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #d97706; text-align: center;">New Order Received!</h2>
    <p><strong>{{user_name}}</strong> just placed an order for <strong>₹{{total}}</strong>.</p>

    <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fef3c7;">
        <p style="margin: 0;"><strong>Order ID:</strong> #{{order_id}}</p>
        <p style="margin: 0;"><strong>Customer Email:</strong> {{user_email}}</p>
        <p style="margin: 0;"><strong>Customer Phone:</strong> {{user_phone}}</p>
    </div>

    <h3 style="color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 5px;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        {{items_html}}
        <tr>
            <td style="padding: 10px; font-weight: bold; text-align: right;">Total</td>
            <td style="padding: 10px; font-weight: bold; text-align: right; color: #d97706; font-size: 1.2em;">₹{{total}}</td>
        </tr>
    </table>

    <h3 style="color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 5px;">Shipping Instructions</h3>
    <p>{{address_html}}</p>

    <p style="text-align: center; margin-top: 40px;">
        <a href="{{FRONTEND_URL}}/admin/orders" style="background-color: #d97706; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Admin Panel</a>
    </p>

</body>
</html>`;

const TABS = [
    { id: "buyer", label: "Buyer Email", settingKey: "email_template_buyer", defaultTemplate: DEFAULT_BUYER_TEMPLATE },
    { id: "admin", label: "Admin Alert Email", settingKey: "email_template_admin", defaultTemplate: DEFAULT_ADMIN_TEMPLATE },
];

function renderPreview(template) {
    let rendered = template;
    for (const [key, value] of Object.entries(SAMPLE_VALUES)) {
        rendered = rendered.replaceAll("{{" + key + "}}", value);
    }
    return rendered;
}

export default function EmailTemplatesPage() {
    const { user, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("buyer");
    const [templates, setTemplates] = useState({
        buyer: DEFAULT_BUYER_TEMPLATE,
        admin: DEFAULT_ADMIN_TEMPLATE,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    const iframeRef = useRef(null);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) {
            router.push("/");
            return;
        }
        if (user?.role === "admin") {
            loadTemplates();
        }
    }, [user, authLoading]);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const [buyerRes, adminRes] = await Promise.allSettled([
                api.getSetting("email_template_buyer"),
                api.getSetting("email_template_admin"),
            ]);
            setTemplates({
                buyer: buyerRes.status === "fulfilled" ? buyerRes.value.value : DEFAULT_BUYER_TEMPLATE,
                admin: adminRes.status === "fulfilled" ? adminRes.value.value : DEFAULT_ADMIN_TEMPLATE,
            });
        } catch {
            // fallback to defaults
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const tab = TABS.find(t => t.id === activeTab);
        setSaving(true);
        try {
            await api.updateSetting(tab.settingKey, {
                value: templates[activeTab],
                description: `${tab.label} HTML template`,
            });
            showNotification(`${tab.label} template saved!`, "success");
        } catch (error) {
            showNotification(error.message || "Failed to save template.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        const tab = TABS.find(t => t.id === activeTab);
        if (!confirm(`Reset "${tab.label}" to the default template? Your current edits will be lost.`)) return;
        setTemplates(prev => ({ ...prev, [activeTab]: tab.defaultTemplate }));
        showNotification("Template reset to default. Click Save to persist.", "info");
    };

    const currentTemplate = templates[activeTab];

    // Update iframe preview
    useEffect(() => {
        if (iframeRef.current && showPreview) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(renderPreview(currentTemplate));
                doc.close();
            }
        }
    }, [currentTemplate, showPreview, activeTab]);

    if (authLoading || !user || user.role !== "admin") return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 mb-2">
                    <LuChevronLeft /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <LuMail className="text-green-600" /> Email Templates
                </h1>
                <p className="text-sm text-gray-500 mt-1">Customize the emails sent when a customer places an order.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    <LuRefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    Loading templates...
                </div>
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowPreview(false)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!showPreview ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                <LuCode size={14} /> Code
                            </button>
                            <button
                                onClick={() => setShowPreview(true)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showPreview ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                <LuEye size={14} /> Split View
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleReset}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all"
                            >
                                <LuRotateCcw size={14} /> Reset to Default
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                {saving ? <LuRefreshCw className="animate-spin" size={14} /> : <LuSave size={14} />}
                                {saving ? "Saving..." : "Save Template"}
                            </button>
                        </div>
                    </div>

                    {/* Editor + Preview */}
                    <div className={`grid gap-4 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
                        {/* Code Editor */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">HTML Editor</span>
                            </div>
                            <textarea
                                value={currentTemplate}
                                onChange={(e) => setTemplates(prev => ({ ...prev, [activeTab]: e.target.value }))}
                                className="w-full h-[500px] p-4 font-mono text-sm text-gray-800 bg-gray-50/50 resize-none focus:outline-none"
                                spellCheck={false}
                            />
                        </div>

                        {/* Live Preview */}
                        {showPreview && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</span>
                                </div>
                                <iframe
                                    ref={iframeRef}
                                    className="w-full h-[500px] border-0"
                                    title="Email Preview"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        )}
                    </div>

                    {/* Placeholder Reference */}
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <LuInfo className="text-green-600" size={16} />
                            <span className="text-sm font-semibold text-gray-700">Available Placeholders</span>
                        </div>
                        <div className="p-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {PLACEHOLDERS.map(p => (
                                    <div key={p.key} className="flex items-center gap-2 text-sm">
                                        <code className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-mono">{p.key}</code>
                                        <span className="text-gray-500 text-xs">{p.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
