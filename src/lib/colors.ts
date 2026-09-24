import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { Color, ColorInput, Paginated } from "./types";

export function listColors(page = 1) {
  return apiGet<Paginated<Color>>(`/api/v1/admin/colors?page=${page}`);
}

export function listActiveColors() {
  return apiGet<Color[]>("/api/v1/admin/colors/active");
}

export function getColor(id: number) {
  return apiGet<Color>(`/api/v1/admin/colors/${id}`);
}

function buildFormData(input: ColorInput, image: File | null): FormData {
  const form = new FormData();
  form.set("name", input.name);
  if (input.hexCode) form.set("hexCode", input.hexCode);
  form.set("status", String(input.status));
  if (input.removeImage) form.set("removeImage", "true");
  if (image) form.set("image", image);
  return form;
}

export function createColor(input: ColorInput, image: File | null = null) {
  return apiPost<Color>("/api/v1/admin/colors", buildFormData(input, image));
}

export function updateColor(id: number, input: ColorInput, image: File | null = null) {
  return apiPatch<Color>(`/api/v1/admin/colors/${id}`, buildFormData(input, image));
}

export function deleteColor(id: number) {
  return apiDelete<{ message: string }>(`/api/v1/admin/colors/${id}`);
}
