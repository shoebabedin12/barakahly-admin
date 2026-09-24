import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { Paginated, Size, SizeInput } from "./types";

export function listSizes(page = 1) {
  return apiGet<Paginated<Size>>(`/api/v1/admin/sizes?page=${page}`);
}

export function listActiveSizes() {
  return apiGet<Size[]>("/api/v1/admin/sizes/active");
}

export function getSize(id: number) {
  return apiGet<Size>(`/api/v1/admin/sizes/${id}`);
}

export function createSize(input: SizeInput) {
  return apiPost<Size>("/api/v1/admin/sizes", input);
}

export function updateSize(id: number, input: SizeInput) {
  return apiPatch<Size>(`/api/v1/admin/sizes/${id}`, input);
}

export function deleteSize(id: number) {
  return apiDelete<{ message: string }>(`/api/v1/admin/sizes/${id}`);
}
