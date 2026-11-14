export interface AdminRole {
  id: number;
  name: string;
  slug: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole | null;
  twoFactorEnabled?: boolean;
}

export type LoginResponse =
  | { token: string; user: AdminUser; twoFactorRequired?: undefined }
  | { twoFactorRequired: true; challengeToken: string };

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

export interface Category {
  id: number;
  parentId: number | null;
  parent: { id: number; name: string; slug: string } | null;
  name: string;
  slug: string;
  description: string | null;
  status: boolean;
}

export interface CategoryInput {
  name: string;
  description?: string | null;
  status: boolean;
  parentId?: number | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: boolean;
  createdAt: string;
}

export interface BrandInput {
  name: string;
  description?: string | null;
  status: boolean;
}

export interface Color {
  id: number;
  name: string;
  hexCode: string | null;
  image: string | null;
  status: boolean;
  createdAt: string;
}

export interface ColorInput {
  name: string;
  hexCode?: string | null;
  status: boolean;
  /** Set when editing and the existing image should be cleared without a replacement. */
  removeImage?: boolean;
}

export interface Size {
  id: number;
  name: string;
  status: boolean;
  createdAt: string;
}

export interface SizeInput {
  name: string;
  status: boolean;
}

export interface ProductImage {
  id: number;
  productId: number;
  image: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  productId: number;
  colorId: number | null;
  color: Color | null;
  sizeId: number | null;
  size: Size | null;
  sku: string | null;
  price: string | null;
  discountPrice: string | null;
  stock: number;
  image: string | null;
  status: boolean;
}

export interface Product {
  id: number;
  categoryId: number;
  category: Category | null;
  brandId: number | null;
  brand: Brand | null;
  name: string;
  slug: string;
  sku: string;
  sourceReference: string | null;
  price: string;
  discountPrice: string | null;
  costPrice: string | null;
  stock: number;
  description: string | null;
  status: boolean;
  createdAt: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface VariantInput {
  id?: number;
  colorId: number | null;
  sizeId: number | null;
  sku?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  stock: number;
  /** Index into the submitted variantImages files array, when this row got a new image. */
  imageIndex?: number | null;
  /** An already-uploaded product image path to reuse, instead of uploading a duplicate file. */
  reuseImagePath?: string | null;
  /** Set when the visitor cleared the existing image without picking a replacement. */
  removeImage?: boolean;
}

export interface ProductInput {
  categoryId: number;
  brandId: number | null;
  name: string;
  sourceReference?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  description?: string | null;
  status: boolean;
  variants: VariantInput[];
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  pendingPaymentDeliveredOrders: number;
  pendingPaymentDeliveredAmount: number;
  totalSales: number;
  todaySales: number;
  monthlySales: number;
  totalProfit: number;
  todayProfit: number;
  monthlyProfit: number;
  orderStatus: Record<string, number>;
  salesChart: { date: string; sales: number }[];
  topProducts: { productName: string; sku: string; totalSold: number; revenue: number }[];
  lowStockProducts: { id: number; name: string; sku: string; effectiveStock: number }[];
  recentOrders: {
    id: number;
    orderNumber: string;
    customerName: string | null;
    totalAmount: string;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
  }[];
  totalCustomers: number;
  recentCustomers: { id: number; name: string; email: string }[];
  totalSuppliers: number;
  totalPurchaseAmount: number;
  totalInvested: number;
  investmentUsed: number;
  investmentRemaining: number;
  totalFromBusinessFund: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderCustomer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  status: boolean;
  createdAt: string;
}

export interface OrderItemDetail {
  id: number;
  orderId: number;
  productId: number | null;
  product: Product | null;
  productVariantId: number | null;
  variant: ProductVariant | null;
  productName: string;
  variantColor: string | null;
  variantSize: string | null;
  price: string;
  quantity: number;
  subtotal: string;
}

export interface OrderStatusHistoryEntry {
  id: number;
  orderId: number;
  status: string;
  note: string | null;
  createdAt: string;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customer: OrderCustomer | null;
  shippingZoneId: number | null;
  shippingZone: { id: number; name: string; charge: string } | null;
  paymentMethodId: number | null;
  paymentMethodRef: { id: number; name: string; code: string } | null;
  paymentMethod: string | null;
  paymentGateway: string | null;
  transactionId: string | null;
  paymentDate: string | null;
  couponCode: string | null;
  discountAmount: string;
  subtotal: string;
  shippingCharge: string;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: string;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItemDetail[];
  statusHistories: OrderStatusHistoryEntry[];
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  today: number;
  thisMonth: number;
  revenue: number;
}

export interface OrderListResponse {
  data: OrderSummary[];
  meta: { page: number; perPage: number; total: number; lastPage: number };
  stats: OrderStats;
}
