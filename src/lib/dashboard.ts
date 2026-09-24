import { apiGet } from "./api";
import type { DashboardStats } from "./types";

export function getDashboardStats() {
  return apiGet<DashboardStats>("/api/v1/admin/dashboard");
}
