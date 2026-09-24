import { apiGet, apiPost } from "./api";
import type { AdminUser, LoginResponse } from "./types";

export function login(email: string, password: string) {
  return apiPost<LoginResponse>("/api/v1/admin/auth/login", { email, password });
}

export function me() {
  return apiGet<AdminUser>("/api/v1/admin/auth/me");
}
