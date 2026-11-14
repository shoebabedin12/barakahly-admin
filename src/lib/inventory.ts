import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { Paginated } from "./types";

// ---------------------------------------------------------------- suppliers

export interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  companyName: string | null;
  address: string | null;
  status: boolean;
  createdAt: string | null;
}

export interface SupplierRow extends Supplier {
  totalPurchaseAmount: number;
  /** Paid through the purchases' own payment records. */
  paidOnPurchases: number;
  /** Paid as general supplier payments. */
  supplierPayments: number;
  totalPaid: number;
  /** Negative when the supplier has been paid more than purchased (an advance). */
  totalDue: number;
}

export interface SupplierPayment {
  id: number;
  supplierId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: string | null;
  note: string | null;
}

export interface SupplierDetail extends SupplierRow {
  purchaseCount: number;
  purchases: Purchase[];
  payments: SupplierPayment[];
}

export type SupplierInput = Omit<Supplier, "id" | "createdAt">;

export interface SupplierPaymentInput {
  amount: string;
  paymentDate: string;
  paymentMethod: string | null;
  note: string | null;
}

export const suppliersApi = {
  list: (page = 1) => apiGet<Paginated<SupplierRow>>(`/api/v1/admin/suppliers?page=${page}`),
  get: (id: number) => apiGet<SupplierDetail>(`/api/v1/admin/suppliers/${id}`),
  create: (input: SupplierInput) => apiPost<Supplier>("/api/v1/admin/suppliers", input),
  update: (id: number, input: SupplierInput) => apiPatch<Supplier>(`/api/v1/admin/suppliers/${id}`, input),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/suppliers/${id}`),
  addPayment: (id: number, input: SupplierPaymentInput) =>
    apiPost<SupplierPayment>(`/api/v1/admin/suppliers/${id}/payments`, input),
  removePayment: (id: number, paymentId: number) =>
    apiDelete<{ message: string }>(`/api/v1/admin/suppliers/${id}/payments/${paymentId}`),
};

// ---------------------------------------------------------------- purchases

export type PurchaseStatus = "pending" | "completed" | "cancelled";
export type PurchasePaymentStatus = "unpaid" | "partial" | "paid";
export type FundingSource = "business" | "investment";

export interface Purchase {
  id: number;
  supplierId: number;
  supplier?: Supplier;
  purchaseNumber: string;
  purchaseDate: string;
  subtotal: string;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  paymentStatus: PurchasePaymentStatus;
  status: PurchaseStatus;
  fundingSource: FundingSource;
  investmentId: number | null;
  createdAt: string | null;
}

export interface PurchaseItem {
  id: number;
  productId: number;
  quantity: number;
  purchasePrice: string;
  landedCost: string | null;
  subtotal: string;
  productVariantId: number | null;
  product: { id: number; name: string; sku: string; stock: number } | null;
  variant: { id: number; label: string; sku: string | null; stock: number } | null;
}

export interface PurchaseCost {
  id: number;
  title: string;
  amount: string;
  costDate: string;
}

export interface PurchaseDetail extends Purchase {
  supplier: Supplier;
  investment: Investment | null;
  items: PurchaseItem[];
  costs: PurchaseCost[];
}

export interface PurchaseInput {
  supplierId: number;
  purchaseDate: string;
  status: PurchaseStatus;
  fundingSource: FundingSource;
  investmentId: number | null;
  items: { productId: number; variantId: number | null; quantity: number; price: string }[];
  costs?: { title: string; amount: string }[];
}

export interface PurchaseFormOptions {
  suppliers: { id: number; name: string; companyName: string | null }[];
  products: {
    id: number;
    name: string;
    sku: string;
    stock: number;
    costPrice: string | null;
    variants: { id: number; label: string; sku: string | null; stock: number; status: boolean }[];
  }[];
  investments: InvestmentRow[];
}

export const purchasesApi = {
  list: (page = 1) => apiGet<Paginated<Purchase>>(`/api/v1/admin/purchases?page=${page}`),
  get: (id: number) => apiGet<PurchaseDetail>(`/api/v1/admin/purchases/${id}`),
  formOptions: () => apiGet<PurchaseFormOptions>("/api/v1/admin/purchases/form-options"),
  create: (input: PurchaseInput) => apiPost<PurchaseDetail>("/api/v1/admin/purchases", input),
  update: (id: number, input: PurchaseInput) => apiPatch<PurchaseDetail>(`/api/v1/admin/purchases/${id}`, input),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/purchases/${id}`),
  complete: (id: number) => apiPost<PurchaseDetail>(`/api/v1/admin/purchases/${id}/complete`),
  addPayment: (id: number, amount: string) =>
    apiPost<PurchaseDetail>(`/api/v1/admin/purchases/${id}/payments`, { amount }),
  addCost: (id: number, input: { title: string; amount: string; costDate: string }) =>
    apiPost<PurchaseDetail>(`/api/v1/admin/purchases/${id}/costs`, input),
  removeCost: (id: number, costId: number) =>
    apiDelete<PurchaseDetail>(`/api/v1/admin/purchases/${id}/costs/${costId}`),
};

// -------------------------------------------------------------- investments

export interface Investment {
  id: number;
  investorName: string;
  amount: string;
  investedDate: string;
  note: string | null;
}

export interface InvestmentRow extends Investment {
  usedAmount: number;
  remainingAmount: number;
}

export interface InvestmentSummary {
  totalInvested: number;
  totalUsed: number;
  totalRemaining: number;
}

export interface InvestmentInput {
  investorName: string;
  amount: string;
  investedDate: string;
  note: string | null;
}

export const investmentsApi = {
  list: (page = 1) =>
    apiGet<Paginated<InvestmentRow> & { summary: InvestmentSummary }>(`/api/v1/admin/investments?page=${page}`),
  get: (id: number) => apiGet<Investment>(`/api/v1/admin/investments/${id}`),
  create: (input: InvestmentInput) => apiPost<Investment>("/api/v1/admin/investments", input),
  update: (id: number, input: InvestmentInput) => apiPatch<Investment>(`/api/v1/admin/investments/${id}`, input),
  remove: (id: number) => apiDelete<{ message: string }>(`/api/v1/admin/investments/${id}`),
};

/** Today as YYYY-MM-DD in the browser's timezone, for date inputs. */
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
