export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};




async function request(endpoint, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Something went wrong" }));
    throw new Error(error.detail || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  register: (data) => request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => request("/api/auth/me"),
  updateMe: (data) => request("/api/auth/me", { method: "PUT", body: JSON.stringify(data) }),

  // Products
  getProducts: (params = "") => request(`/api/products/${params ? "?" + params : ""}`),
  getProduct: (slug) => {
    if (!slug || slug === "undefined") {
      throw new Error("Product slug is missing or invalid");
    }
    return request(`/api/products/${slug}`);
  },
  createProduct: (data) => request("/api/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => request("/api/categories"),
  createCategory: (data) => request("/api/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/api/categories/${id}`, { method: "DELETE" }),

  // Reviews
  getReviews: (productId) => request(`/api/reviews?product_id=${productId}`),
  createReview: (data) => request("/api/reviews", { method: "POST", body: JSON.stringify(data) }),
  deleteReview: (id) => request(`/api/reviews/${id}`, { method: "DELETE" }),

  // Cart
  getCart: () => request("/api/cart"),
  addToCart: (data) => request("/api/cart", { method: "POST", body: JSON.stringify(data) }),
  updateCartItem: (id, data) => request(`/api/cart/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  removeFromCart: (id) => request(`/api/cart/${id}`, { method: "DELETE" }),
  clearCart: () => request("/api/cart", { method: "DELETE" }),

  // Wishlist
  getWishlist: () => request("/api/wishlist"),
  addToWishlist: (data) => request("/api/wishlist", { method: "POST", body: JSON.stringify(data) }),
  removeFromWishlist: (id) => request(`/api/wishlist/${id}`, { method: "DELETE" }),

  // Orders
  getOrders: () => request("/api/orders"),
  getOrder: (id) => request(`/api/orders/${id}`),
  createOrder: (data) => request("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrderStatus: (id, data) => request(`/api/orders/${id}/status`, { method: "PUT", body: JSON.stringify(data) }),

  // Addresses
  getAddresses: () => request("/api/addresses"),
  createAddress: (data) => request("/api/addresses", { method: "POST", body: JSON.stringify(data) }),
  updateAddress: (id, data) => request(`/api/addresses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAddress: (id) => request(`/api/addresses/${id}`, { method: "DELETE" }),

  // Admin
  getAdminStats: () => request("/api/admin/stats"),
  getUsers: () => request("/api/admin/users"),
  updateUserRole: (id, role) => request(`/api/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  adminUpdateUser: (id, data) => request(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  adminDeleteUser: (id) => request(`/api/admin/users/${id}`, { method: "DELETE" }),

  // Carousel
  getCarouselItems: () => request("/api/carousel"),
  getAllCarouselItems: () => request("/api/carousel/all"),
  createCarouselItem: (data) => request("/api/carousel", { method: "POST", body: JSON.stringify(data) }),
  updateCarouselItem: (id, data) => request(`/api/carousel/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCarouselItem: (id) => request(`/api/carousel/${id}`, { method: "DELETE" }),

  // Uploads
  uploadImage: async (file) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail || "Upload failed");
    }
    const data = await res.json();
    return { url: data.url };
  },

  // Settings
  getSetting: (key) => request(`/api/settings/${key}`),
  updateSetting: (key, data) => request(`/api/settings/${key}`, { method: "PUT", body: JSON.stringify(data) }),

  // Testimonials
  getTestimonials: () => request("/api/testimonials"),
  getAllTestimonials: () => request("/api/testimonials/all"),
  createTestimonial: (data) => request("/api/testimonials", { method: "POST", body: JSON.stringify(data) }),
  updateTestimonial: (id, data) => request(`/api/testimonials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTestimonial: (id) => request(`/api/testimonials/${id}`, { method: "DELETE" }),
};
