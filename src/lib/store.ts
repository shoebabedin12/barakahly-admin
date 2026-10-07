import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { Paginated } from "./types";

// ---------------------------------------------------------------- customers

export interface CustomerRow {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  status: boolean;
  createdAt: string | null;
  ordersCount: number;
  totalSpent: number;
}

export interface CustomerDetail extends CustomerRow {
  hasPassword: boolean;
  orders: {
    id: number;
    orderNumber: string;
    totalAmount: string;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string | null;
  }[];
}

export interface CustomerInput {
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  status: boolean;
  password?: string | null;
  passwordConfirmation?: string | null;
}

export const customersApi = {
  list: (page = 1, search = "") =>
    apiGet<Paginated<CustomerRow>>(
      `/api/v1/admin/customers?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    ),
  get: (id: number) => apiGet<CustomerDetail>(`/api/v1/admin/customers/${id}`),
  create: (input: CustomerInput) => apiPost<CustomerDetail>("/api/v1/admin/customers", input),
  update: (id: number, input: CustomerInput) => apiPatch<CustomerDetail>(`/api/v1/admin/customers/${id}`, input),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/customers/${id}`),
};

// ------------------------------------------------------------------ coupons

export interface Coupon {
  id: number;
  code: string;
  type: "fixed" | "percentage";
  value: string;
  minOrderAmount: string;
  maxDiscount: string | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  status: boolean;
}

export interface CouponInput {
  code: string;
  type: "fixed" | "percentage";
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  status: boolean;
}

export const couponsApi = {
  list: (page = 1) => apiGet<Paginated<Coupon>>(`/api/v1/admin/coupons?page=${page}`),
  get: (id: number) => apiGet<Coupon>(`/api/v1/admin/coupons/${id}`),
  create: (input: CouponInput) => apiPost<Coupon>("/api/v1/admin/coupons", input),
  update: (id: number, input: CouponInput) => apiPatch<Coupon>(`/api/v1/admin/coupons/${id}`, input),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/coupons/${id}`),
};

// ---------------------------------------------------------- payment methods

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  instructions: string | null;
  receivingNumber: string | null;
  sortOrder: number;
  requiresTransactionId: boolean;
  status: boolean;
}

export type PaymentMethodInput = Omit<PaymentMethod, "id" | "sortOrder"> & { sortOrder: string };

export const paymentMethodsApi = {
  list: () => apiGet<Paginated<PaymentMethod>>("/api/v1/admin/payment-methods"),
  get: (id: number) => apiGet<PaymentMethod>(`/api/v1/admin/payment-methods/${id}`),
  create: (input: PaymentMethodInput) => apiPost<PaymentMethod>("/api/v1/admin/payment-methods", input),
  update: (id: number, input: PaymentMethodInput) =>
    apiPatch<PaymentMethod>(`/api/v1/admin/payment-methods/${id}`, input),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/payment-methods/${id}`),
};

// ----------------------------------------------------------- shipping zones

export interface ShippingZone {
  id: number;
  name: string;
  charge: string;
  status: boolean;
}

export interface ShippingZoneInput {
  name: string;
  charge: string;
  status: boolean;
}

export const shippingZonesApi = {
  list: () => apiGet<Paginated<ShippingZone>>("/api/v1/admin/shipping-zones"),
  get: (id: number) => apiGet<ShippingZone>(`/api/v1/admin/shipping-zones/${id}`),
  create: (input: ShippingZoneInput) => apiPost<ShippingZone>("/api/v1/admin/shipping-zones", input),
  update: (id: number, input: ShippingZoneInput) =>
    apiPatch<ShippingZone>(`/api/v1/admin/shipping-zones/${id}`, input),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/shipping-zones/${id}`),
};

// ------------------------------------------------------------------ banners

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  imageUrl: string;
  position: "hero" | "promo";
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  status: boolean;
}

export interface BannerInput {
  title: string;
  subtitle: string;
  position: "hero" | "promo";
  buttonText: string;
  buttonLink: string;
  sortOrder: string;
  status: boolean;
}

function bannerForm(input: BannerInput, image: File | null) {
  const form = new FormData();
  Object.entries(input).forEach(([key, value]) => form.append(key, String(value)));
  if (image) form.append("image", image);
  return form;
}

export const bannersApi = {
  list: () => apiGet<Paginated<Banner>>("/api/v1/admin/banners"),
  get: (id: number) => apiGet<Banner>(`/api/v1/admin/banners/${id}`),
  create: (input: BannerInput, image: File | null) =>
    apiPost<Banner>("/api/v1/admin/banners", bannerForm(input, image)),
  update: (id: number, input: BannerInput, image: File | null) =>
    apiPatch<Banner>(`/api/v1/admin/banners/${id}`, bannerForm(input, image)),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/banners/${id}`),
};

// ------------------------------------------------------------------ reviews

export interface ReviewRow {
  id: number;
  rating: number;
  comment: string | null;
  status: boolean;
  createdAt: string | null;
  product: { id: number; name: string; slug: string } | null;
  customer: { id: number; name: string; phone: string } | null;
}

export const reviewsApi = {
  list: (page = 1, rating = "", status = "") =>
    apiGet<Paginated<ReviewRow>>(`/api/v1/admin/reviews?page=${page}&rating=${rating}&status=${status}`),
  toggle: (id: number) => apiPatch<{ id: number; status: boolean }>(`/api/v1/admin/reviews/${id}/toggle`),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/reviews/${id}`),
};

// ----------------------------------------------------------------- settings

export interface StoreSettings {
  siteName: string;
  siteLogo: string | null;
  siteFavicon: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  shippingCharge: string;
  currency: string;
  facebook: string | null;
  facebookPixelId: string | null;
  clarityProjectId: string | null;
  gtmId: string | null;
  instagram: string | null;
  youtube: string | null;
  whatsapp: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  flashDealEndsAt: string | null;
  maintenanceMode: boolean;
  mailHost: string | null;
  mailPort: string | null;
  mailEncryption: string | null;
  mailUsername: string | null;
  hasMailPassword: boolean;
  mailFromAddress: string | null;
  mailFromName: string | null;
}

export const settingsApi = {
  get: () => apiGet<StoreSettings>("/api/v1/admin/settings"),
  update: (form: FormData) => apiPost<StoreSettings>("/api/v1/admin/settings", form),
};

export const formatMoney = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === ""
    ? "-"
    : `৳${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
