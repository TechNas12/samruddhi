const BASE_URL = "https://www.samruddhiorganics.shop";

export default async function sitemap() {
    // Static pages
    const staticPages = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
        { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
        { url: `${BASE_URL}/cart`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    ];

    // Dynamic product pages
    let productPages = [];
    try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiBase}/api/products`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const products = await res.json();
            productPages = products.map((product) => ({
                url: `${BASE_URL}/products/${product.slug}`,
                lastModified: product.updated_at ? new Date(product.updated_at) : new Date(product.created_at),
                changeFrequency: "weekly",
                priority: 0.8,
            }));
        }
    } catch (err) {
        console.error("Sitemap: Failed to fetch products", err);
    }

    return [...staticPages, ...productPages];
}
