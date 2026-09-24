import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { Brand, BrandInput, Paginated } from "./types";

export function listBrands(page = 1) {
  return apiGet<Paginated<Brand>>(`/api/v1/admin/brands?page=${page}`);
}

export function getBrand(id: number) {
  return apiGet<Brand>(`/api/v1/admin/brands/${id}`);
}

export function createBrand(input: BrandInput) {
  return apiPost<Brand>("/api/v1/admin/brands", input);
}

export function updateBrand(id: number, input: BrandInput) {
  return apiPatch<Brand>(`/api/v1/admin/brands/${id}`, input);
}

export function deleteBrand(id: number) {
  return apiDelete<{ message: string }>(`/api/v1/admin/brands/${id}`);
}
