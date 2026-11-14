import { apiGet, apiPost } from "./api";
import type { AdminUser, LoginResponse } from "./types";

export function login(email: string, password: string) {
  return apiPost<LoginResponse>("/api/v1/admin/auth/login", { email, password });
}

export function me() {
  return apiGet<AdminUser>("/api/v1/admin/auth/me");
}

export function twoFactorChallenge(challengeToken: string, code: string) {
  return apiPost<{ token: string; user: AdminUser }>("/api/v1/admin/auth/2fa/challenge", { challengeToken, code });
}

export function twoFactorStatus() {
  return apiGet<{ enabled: boolean }>("/api/v1/admin/auth/2fa");
}

export function twoFactorSetup() {
  return apiPost<{ secret: string; otpauthUri: string; qrCode: string; setupToken: string }>(
    "/api/v1/admin/auth/2fa/setup",
  );
}

export function twoFactorEnable(setupToken: string, code: string) {
  return apiPost<{ enabled: true; recoveryCodes: string[] }>("/api/v1/admin/auth/2fa/enable", { setupToken, code });
}

export function twoFactorDisable(password: string) {
  return apiPost<{ enabled: false }>("/api/v1/admin/auth/2fa/disable", { password });
}
