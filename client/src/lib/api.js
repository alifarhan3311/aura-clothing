// API Client Utility
// In development, Vite proxies /api → http://localhost:5000/api, so we use a
// relative base. In production, fall back to the env var or absolute URL.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD && import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api");

// In-memory token mirror — kept in sync by AuthContext (avoids React/localStorage drift)
let memoryToken =
  (typeof window !== "undefined" &&
    (localStorage.getItem("token") || localStorage.getItem("auth_token"))) ||
  null;

export function setAuthToken(token) {
  memoryToken = token || null;
}

function getAuthToken() {
  return (
    memoryToken ||
    (typeof window !== "undefined" &&
      (localStorage.getItem("token") || localStorage.getItem("auth_token"))) ||
    null
  );
}

/**
 * Core Request Interceptor & Runner
 */
async function request(endpoint, { method = "GET", body = null, headers = {}, ...customConfig } = {}) {
  const token = getAuthToken();

  const defaultHeaders = {};

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Handle body content type
  let formattedBody = body;
  if (body && !(body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
    formattedBody = JSON.stringify(body);
  }

  const config = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  if (formattedBody) {
    config.body = formattedBody;
  }

  const fullUrl = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  try {
    const response = await fetch(fullUrl, config);
    
    // Parse response
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data.message
          ? data.message
          : `Request failed with status ${response.status}`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err.message);
    throw err;
  }
}

/**
 * Axios-style interface wrapper
 */
export const api = {
  get: (url, config = {}) => request(url, { ...config, method: "GET" }),
  post: (url, body, config = {}) => request(url, { ...config, method: "POST", body }),
  put: (url, body, config = {}) => request(url, { ...config, method: "PUT", body }),
  patch: (url, body, config = {}) => request(url, { ...config, method: "PATCH", body }),
  delete: (url, config = {}) => request(url, { ...config, method: "DELETE" }),

  // Multipart Form Data Uploader
  upload: (url, formData, method = "POST", config = {}) =>
    request(url, {
      ...config,
      method,
      body: formData, // fetch automatically sets multipart boundary when body is FormData
    }),
};

/**
 * Helper to safely construct URL query strings without "undefined" or nulls
 */
export function buildQuery(params = {}) {
  const clean = {};
  Object.entries(params).forEach(([k, v]) => {
    if (
      v !== undefined &&
      v !== null &&
      v !== "" &&
      v !== "undefined" &&
      v !== "null"
    ) {
      clean[k] = v;
    }
  });
  const q = new URLSearchParams(clean).toString();
  return q ? `?${q}` : "";
}

// ── Auth Service ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  resendOTP: (data) => api.post("/auth/resend-otp", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (formData) => api.upload("/auth/update-profile", formData, "PUT"),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resendForgotPasswordOTP: (data) => api.post("/auth/resend-forgot-password-otp", data),
  verifyForgotPasswordOTP: (data) => api.post("/auth/verify-forgot-password-otp", data),
  updatePassword: (data) => api.post("/auth/update-password", data),
};

// ── Brand Service ─────────────────────────────────────────────────────────────
export const brandApi = {
  getAll: (params = {}) => api.get(`/brands${buildQuery(params)}`),
  getById: (id) => api.get(`/brands/${id}`),
  create: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload("/brands", formDataOrJson, "POST");
    }
    return api.post("/brands", formDataOrJson);
  },
  update: (id, formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload(`/brands/${id}`, formDataOrJson, "PUT");
    }
    return api.put(`/brands/${id}`, formDataOrJson);
  },
  updateStatus: (id, isActive) => api.patch(`/brands/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/brands/${id}`),
};

// ── Category Service ──────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: (params = {}) => api.get(`/categories${buildQuery(params)}`),
  getById: (id) => api.get(`/categories/${id}`),
  // Fetch all active products that belong to a specific category
  getProducts: (id, params = {}) => api.get(`/categories/${id}/products${buildQuery(params)}`),
  create: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload("/categories", formDataOrJson, "POST");
    }
    return api.post("/categories", formDataOrJson);
  },
  update: (id, formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload(`/categories/${id}`, formDataOrJson, "PUT");
    }
    return api.put(`/categories/${id}`, formDataOrJson);
  },
  updateStatus: (id, isActive) => api.patch(`/categories/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ── Product Service ───────────────────────────────────────────────────────────
export const productApi = {
  getAll: (params = {}) => api.get(`/products${buildQuery(params)}`),
  getById: (id) => api.get(`/products/${id}`),
  search: (query) => api.get(`/products/search${buildQuery({ q: query })}`),
  // Convenience fetchers used by homepage sections
  getNewArrivals: (limit = 8) =>
    api.get(`/products?type=new-arrival&limit=${limit}&status=true`),
  getTrending: (limit = 8) =>
    api.get(`/products?type=trending&limit=${limit}&status=true`),
  getFeatured: (limit = 6) =>
    api.get(`/products?type=featured&limit=${limit}&status=true`),
  create: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload("/products", formDataOrJson, "POST");
    }
    return api.post("/products", formDataOrJson);
  },
  update: (id, formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload(`/products/${id}`, formDataOrJson, "PUT");
    }
    return api.put(`/products/${id}`, formDataOrJson);
  },
  updateStatus: (id, isActive) => api.patch(`/products/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/products/${id}`),
};

// ── User Service (Admin) ──────────────────────────────────────────────────────
export const userApi = {
  getAll: (params = {}) => api.get(`/users${buildQuery(params)}`),
  getById: (id) => api.get(`/users/${id}`),
  create: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload("/users", formDataOrJson, "POST");
    }
    return api.post("/users", formDataOrJson);
  },
  update: (id, formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload(`/users/${id}`, formDataOrJson, "PUT");
    }
    return api.put(`/users/${id}`, formDataOrJson);
  },
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};

// ── Catalog Service ───────────────────────────────────────────────────────────
// Wraps /api/catalog endpoints for section-based product browsing
export const catalogApi = {
  // GET /api/catalog — all sections overview (for nav/mega-menu)
  getAllSections: () => api.get("/catalog"),

  /**
   * GET /api/catalog/:section
   * Fetch products for a section with optional filters.
   *
   * @param {'women'|'men'|'kids'} section
   * @param {object} params - page, limit, category, brand, size, color,
   *                          minPrice, maxPrice, type, sortBy, order, search
   */
  getBySection: (section, params = {}) => api.get(`/catalog/${section}${buildQuery(params)}`),

  /**
   * GET /api/catalog/:section/meta
   * Fetch only sidebar categories + filter options (no products).
   */
  getMeta: (section) => api.get(`/catalog/${section}/meta`),
};

// ── Coupon Service ────────────────────────────────────────────────────────────
export const couponApi = {
  getAll: (params = {}) => api.get(`/coupons${buildQuery(params)}`),
  getById: (id) => api.get(`/coupons/${id}`),
  create: (data) => api.post("/coupons", data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  updateStatus: (id, isActive) => api.patch(`/coupons/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/coupons/${id}`),
  validate: (code, cartTotal, items = []) => api.post("/coupons/validate", { code, cartTotal, items }),
};

// ── Wishlist Service ──────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => api.get("/wishlist"),
  toggle: (productId) => api.post(`/wishlist/${productId}`, {}),
  clear: () => api.delete("/wishlist"),
};

// ── Order Service ──────────────────────────────────────────────────────────────
export const orderApi = {
  create: (data) => api.post("/orders", data),
  getMy: (params = {}) => api.get(`/orders/my${buildQuery(params)}`),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params = {}) => api.get(`/orders${buildQuery(params)}`),
  updateStatus: (id, status, note = "") => api.patch(`/orders/${id}/status`, { status, note }),
  // User cancel request (sends to admin for approval, does NOT cancel immediately)
  cancel: (id, reason = "") => api.patch(`/orders/${id}/cancel`, { reason }),
  // Admin: approve a user's cancel request → marks order as cancelled
  approveCancelRequest: (id, note = "") => api.patch(`/orders/${id}/cancel/approve`, { note }),
  // Admin: reject a user's cancel request → reverts order to previous status
  rejectCancelRequest: (id, note = "") => api.patch(`/orders/${id}/cancel/reject`, { note }),
  // Track by tracking number (no auth)
  track: (trackingNumber) => api.get(`/orders/track/${trackingNumber}`),
  // Get last checkout session from Redis
  getCheckoutSession: () => api.get("/orders/checkout-session"),
};

// ── Hero Slide / Banner Service ─────────────────────────────────────────────
export const slideApi = {
  getActive: () => api.get("/slides"),
  getAllAdmin: () => api.get("/slides/admin"),
  create: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload("/slides", formDataOrJson, "POST");
    }
    return api.post("/slides", formDataOrJson);
  },
  update: (id, formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload(`/slides/${id}`, formDataOrJson, "PUT");
    }
    return api.put(`/slides/${id}`, formDataOrJson);
  },
  updateStatus: (id, isActive) => api.patch(`/slides/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/slides/${id}`),
};

// ── Department / Section Service ─────────────────────────────────────────────
export const departmentApi = {
  getAll: () => api.get("/departments"),
  getAllAdmin: () => api.get("/departments/admin/all"),
  getByIdOrSlug: (idOrSlug) => api.get(`/departments/${idOrSlug}`),
  create: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload("/departments", formDataOrJson, "POST");
    }
    return api.post("/departments", formDataOrJson);
  },
  update: (id, formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.upload(`/departments/${id}`, formDataOrJson, "PUT");
    }
    return api.put(`/departments/${id}`, formDataOrJson);
  },
  updateStatus: (id, isActive) => api.patch(`/departments/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/departments/${id}`),
};

// ── Contact & Support Service ───────────────────────────────────────────────
export const contactApi = {
  // Public/User submit contact inquiry
  submit: (data) => api.post("/contact", data),
  // Customer get their own inquiries
  getMy: () => api.get("/contact/my"),
  // Admin endpoints
  getAll: (params = {}) => api.get(`/contact${buildQuery(params)}`),
  getStats: () => api.get("/contact/stats"),
  getById: (id) => api.get(`/contact/${id}`),
  updateStatus: (id, data) => api.patch(`/contact/${id}/status`, data),
  delete: (id) => api.delete(`/contact/${id}`),
};

export default api;

