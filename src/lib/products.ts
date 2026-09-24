import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { Paginated, Product, ProductInput } from "./types";

export interface ProductListFilters {
  page?: number;
  search?: string;
  categoryId?: number;
  brandId?: number;
  status?: boolean;
}

export function listProducts(filters: ProductListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.search) params.set("search", filters.search);
  if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
  if (filters.brandId) params.set("brandId", String(filters.brandId));
  if (filters.status !== undefined) params.set("status", String(filters.status));

  return apiGet<Paginated<Product>>(`/api/v1/admin/products?${params.toString()}`);
}

export function getProduct(id: number) {
  return apiGet<Product>(`/api/v1/admin/products/${id}`);
}

function buildFormData(input: ProductInput, images: File[], variantImages: File[]): FormData {
  const form = new FormData();
  form.set("categoryId", String(input.categoryId));
  if (input.brandId) form.set("brandId", String(input.brandId));
  form.set("name", input.name);
  if (input.sourceReference) form.set("sourceReference", input.sourceReference);
  form.set("price", String(input.price));
  if (input.discountPrice !== null && input.discountPrice !== undefined) {
    form.set("discountPrice", String(input.discountPrice));
  }
  form.set("stock", String(input.stock));
  if (input.description) form.set("description", input.description);
  form.set("status", String(input.status));
  form.set("variants", JSON.stringify(input.variants));
  images.forEach((file) => form.append("images", file));
  variantImages.forEach((file) => form.append("variantImages", file));
  return form;
}

export function createProduct(input: ProductInput, images: File[], variantImages: File[] = []) {
  return apiPost<Product>("/api/v1/admin/products", buildFormData(input, images, variantImages));
}

export function updateProduct(id: number, input: ProductInput, images: File[], variantImages: File[] = []) {
  return apiPatch<Product>(`/api/v1/admin/products/${id}`, buildFormData(input, images, variantImages));
}

export function deleteProduct(id: number) {
  return apiDelete<{ message: string }>(`/api/v1/admin/products/${id}`);
}

export function bulkProductAction(ids: number[], action: "delete" | "active" | "inactive") {
  return apiPost<{ message: string }>("/api/v1/admin/products/bulk-action", { ids, action });
}

export function deleteProductImage(imageId: number) {
  return apiDelete<{ message: string }>(`/api/v1/admin/products/images/${imageId}`);
}

export function setPrimaryProductImage(imageId: number) {
  return apiPatch<{ message: string }>(`/api/v1/admin/products/images/${imageId}/primary`);
}

export function reorderProductImages(imageIds: number[]) {
  return apiPost<{ message: string }>("/api/v1/admin/products/images/reorder", { imageIds });
}
