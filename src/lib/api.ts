import { getToken, setToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      // Omit Content-Type for FormData - the browser needs to set its own
      // multipart boundary, which a manual header would override/break.
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    setToken(null);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? "Something went wrong. Please try again.";
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, response.status);
  }

  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const isFormData = body instanceof FormData;
  return request<T>(path, { method: "POST", body: isFormData ? body : body ? JSON.stringify(body) : undefined });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const isFormData = body instanceof FormData;
  return request<T>(path, { method: "PATCH", body: isFormData ? body : body ? JSON.stringify(body) : undefined });
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
