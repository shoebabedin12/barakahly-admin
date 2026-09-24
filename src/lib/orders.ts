import { apiGet, apiPatch, apiPost } from "./api";
import type {
  OrderDetail,
  OrderListResponse,
  OrderStatus,
  PaymentStatus,
} from "./types";

export interface OrderListFilters {
  page?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function listOrders(filters: OrderListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.status) params.set("status", filters.status);
  if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
  if (filters.search) params.set("search", filters.search);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);

  return apiGet<OrderListResponse>(`/api/v1/admin/orders?${params.toString()}`);
}

export function getOrder(id: number) {
  return apiGet<{ order: OrderDetail; mergeCandidates: OrderDetail[] }>(`/api/v1/admin/orders/${id}`);
}

export function updateOrderStatus(id: number, orderStatus: OrderStatus) {
  return apiPatch<{ order: OrderDetail }>(`/api/v1/admin/orders/${id}/status`, { orderStatus });
}

export function bulkUpdateOrderStatus(ids: number[], orderStatus: OrderStatus) {
  return apiPost<{ updated: number }>("/api/v1/admin/orders/bulk-status", { ids, orderStatus });
}

export function updatePaymentStatus(id: number, paymentStatus: PaymentStatus) {
  return apiPatch<{ order: OrderDetail }>(`/api/v1/admin/orders/${id}/payment-status`, { paymentStatus });
}

export function removeShippingCharge(id: number) {
  return apiPatch<{ order: OrderDetail }>(`/api/v1/admin/orders/${id}/remove-shipping-charge`);
}

export function mergeOrder(id: number, mergeOrderId: number) {
  return apiPost<{ order: OrderDetail }>(`/api/v1/admin/orders/${id}/merge`, { mergeOrderId });
}
