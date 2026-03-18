export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/account/", "/cart", "/checkout"],
            },
        ],
        sitemap: "https://www.samruddhiorganics.shop/sitemap.xml",
    };
}
