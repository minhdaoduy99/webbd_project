import axios from "axios";

/**
 * Dung ?? thay vi || de khi deploy sau Nginx cung domain HTTPS co the dat NEXT_PUBLIC_API_URL=""
 * (goi API qua duong dan tuong doi /api/v1/... ma khong dinh loi Mixed Content hay CORS).
 */
export const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080");

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default api;
