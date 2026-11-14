import { apiDelete, apiDownload, apiGet, apiPatch, apiPost } from "./api";
import type { Paginated } from "./types";

// --------------------------------------------------------------------- blog

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  featuredImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: boolean;
  publishedAt: string | null;
  createdAt: string;
  user?: { id: number; name: string } | null;
}

export const blogApi = {
  list: (page = 1) => apiGet<Paginated<BlogPost>>(`/api/v1/admin/blog?page=${page}`),
  get: (id: number) => apiGet<BlogPost>(`/api/v1/admin/blog/${id}`),
  create: (form: FormData) => apiPost<BlogPost>("/api/v1/admin/blog", form),
  update: (id: number, form: FormData) => apiPatch<BlogPost>(`/api/v1/admin/blog/${id}`, form),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/blog/${id}`),
};

// -------------------------------------------------------------------- staff

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  roleId: number | null;
  role: { id: number; name: string; slug: string } | null;
  twoFactorEnabled: boolean;
  createdAt: string | null;
}

export interface StaffUserInput {
  name: string;
  email: string;
  roleId: number;
  password: string | null;
  passwordConfirmation: string | null;
}

export const staffApi = {
  list: (page = 1) => apiGet<Paginated<StaffUser>>(`/api/v1/admin/users?page=${page}`),
  get: (id: number) => apiGet<StaffUser>(`/api/v1/admin/users/${id}`),
  roleOptions: () => apiGet<{ id: number; name: string; slug: string }[]>("/api/v1/admin/users/role-options"),
  create: (input: StaffUserInput) => apiPost<StaffUser>("/api/v1/admin/users", input),
  update: (id: number, input: StaffUserInput) => apiPatch<StaffUser>(`/api/v1/admin/users/${id}`, input),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/users/${id}`),
};

export interface Permission {
  id: number;
  name: string;
  slug: string;
}

export interface RoleRow {
  id: number;
  name: string;
  slug: string;
  usersCount: number;
  permissions: Permission[];
}

export interface RoleDetail {
  id: number;
  name: string;
  slug: string;
  permissionIds: number[];
}

export const rolesApi = {
  list: (page = 1) => apiGet<Paginated<RoleRow>>(`/api/v1/admin/roles?page=${page}`),
  get: (id: number) => apiGet<RoleDetail>(`/api/v1/admin/roles/${id}`),
  permissions: () => apiGet<Permission[]>("/api/v1/admin/roles/permissions"),
  create: (input: { name: string; permissionIds: number[] }) => apiPost<RoleDetail>("/api/v1/admin/roles", input),
  update: (id: number, input: { name: string; permissionIds: number[] }) =>
    apiPatch<RoleDetail>(`/api/v1/admin/roles/${id}`, input),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/roles/${id}`),
};

// ------------------------------------------------------------- activity log

export interface ActivityEntry {
  id: number;
  action: string;
  subjectType: string | null;
  subjectId: number | null;
  subjectLabel: string | null;
  description: string;
  changes: Record<string, unknown> | null;
  createdAt: string;
  user: { id: number; name: string; email: string } | null;
}

export interface ActivityFilters {
  userId: string;
  action: string;
  dateFrom: string;
  dateTo: string;
}

const query = (params: Record<string, string | number | undefined>) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");

export const activityApi = {
  list: (page: number, filters: ActivityFilters) =>
    apiGet<Paginated<ActivityEntry> & { users: { id: number; name: string }[]; actions: string[] }>(
      `/api/v1/admin/activity-log?${query({ page, ...filters })}`,
    ),
};

// ------------------------------------------------------------------ reports

export interface ReportOverview {
  cards: {
    todaySales: number;
    todayOrders: number;
    monthlyRevenue: number;
    monthlyOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    monthlyDiscount: number;
    monthlyShipping: number;
    monthlyNetRevenue: number;
  };
  salesChart: { date: string; total: number; orders: number }[];
  orderStatus: { status: string; total: number }[];
  paymentStatus: { status: string; total: number }[];
  topProducts: { id: number; name: string; orders: number; units: number; revenue: number }[];
  topCategories: { id: number; name: string; products: number }[];
  topCustomers: { id: number; name: string; phone: string; orders: number; spent: number }[];
}

export interface SalesFilters {
  status: string;
  paymentStatus: string;
  coupon: string;
  from: string;
  to: string;
}

export interface SalesRow {
  id: number;
  orderNumber: string;
  createdAt: string;
  customer: { id: number; name: string; phone: string } | null;
  subtotal: string;
  discountAmount: string;
  shippingCharge: string;
  totalAmount: string;
  paymentStatus: string;
  orderStatus: string;
}

export interface SalesTotals {
  orders: number;
  subtotal: number;
  discount: number;
  shipping: number;
  sales: number;
  average: number;
}

export const reportsApi = {
  overview: () => apiGet<ReportOverview>("/api/v1/admin/reports/overview"),
  sales: (page: number, filters: SalesFilters) =>
    apiGet<Paginated<SalesRow> & { totals: SalesTotals }>(`/api/v1/admin/reports/sales?${query({ page, ...filters })}`),
  exportCsv: (filters: SalesFilters) =>
    apiDownload(`/api/v1/admin/reports/sales/export?${query({ ...filters })}`, "sales-report.csv"),
};
