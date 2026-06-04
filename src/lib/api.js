import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
});

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Auth API helpers ──────────────────────────────────────────────

export function loginApi(email, password) {
  return api.post("/login", { email, password });
}

export function logoutApi() {
  return api.post("/logout");
}

export function getMeApi() {
  return api.get("/me");
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

// ── Dashboard API helpers ─────────────────────────────────────────

export function getDashboardApi() {
  return api.get("/dashboard");
}

// ── Product API helpers ───────────────────────────────────────────

export function getProductsApi(params = {}) {
  return api.get("/products", { params });
}

export function createProductApi(data) {
  return api.post("/products", data);
}

export function updateProductApi(id, data) {
  return api.put(`/products/${id}`, data);
}

export function deleteProductApi(id) {
  return api.delete(`/products/${id}`);
}

export default api;
