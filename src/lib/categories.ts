import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { Category, CategoryInput, Paginated } from "./types";

export function listCategories(page = 1) {
  return apiGet<Paginated<Category>>(`/api/v1/admin/categories?page=${page}`);
}

export function listTopLevelCategories(excludeId?: number) {
  const query = excludeId ? `?exclude=${excludeId}` : "";
  return apiGet<Category[]>(`/api/v1/admin/categories/top-level${query}`);
}

export function getCategory(id: number) {
  return apiGet<Category>(`/api/v1/admin/categories/${id}`);
}

export function createCategory(input: CategoryInput) {
  return apiPost<Category>("/api/v1/admin/categories", input);
}

export function updateCategory(id: number, input: CategoryInput) {
  return apiPatch<Category>(`/api/v1/admin/categories/${id}`, input);
}

export function deleteCategory(id: number) {
  return apiDelete<{ message: string }>(`/api/v1/admin/categories/${id}`);
}
