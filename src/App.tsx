import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { notYetBuiltRoutes } from "./lib/navConfig";
import { BrandForm } from "./pages/brands/BrandForm";
import { BrandsList } from "./pages/brands/BrandsList";
import { CategoriesList } from "./pages/categories/CategoriesList";
import { CategoryForm } from "./pages/categories/CategoryForm";
import { ColorForm } from "./pages/colors/ColorForm";
import { ColorsList } from "./pages/colors/ColorsList";
import { ComingSoon } from "./pages/ComingSoon";
import { Dashboard } from "./pages/Dashboard";
import { LandingEditor } from "./pages/landing/LandingEditor";
import { LandingPagesList } from "./pages/landing/LandingPagesList";
import { Login } from "./pages/Login";
import { OrderDetail } from "./pages/orders/OrderDetail";
import { OrdersList } from "./pages/orders/OrdersList";
import { ProductForm } from "./pages/products/ProductForm";
import { ProductsList } from "./pages/products/ProductsList";
import { SizeForm } from "./pages/sizes/SizeForm";
import { SizesList } from "./pages/sizes/SizesList";
import { BannerForm, BannersList } from "./pages/banners/Banners";
import { CouponForm, CouponsList } from "./pages/coupons/Coupons";
import { CustomerForm, CustomersList } from "./pages/customers/Customers";
import { PaymentMethodForm, PaymentMethodsList } from "./pages/payment-methods/PaymentMethods";
import { ReviewsList } from "./pages/reviews/Reviews";
import { Settings } from "./pages/settings/Settings";
import { ShippingZoneForm, ShippingZonesList } from "./pages/shipping-zones/ShippingZones";
import { InvestmentForm, InvestmentsList } from "./pages/investments/Investments";
import { NewsletterBatch, NewsletterCompose, NewsletterList, NewsletterLogs } from "./pages/newsletter/Newsletter";
import { ActivityLog } from "./pages/activity/ActivityLog";
import { BlogForm, BlogList } from "./pages/blog/Blog";
import { SalesReport } from "./pages/reports/SalesReport";
import { RoleForm, RolesList, StaffForm, StaffList } from "./pages/staff/Staff";
import { PurchaseDetail, PurchaseForm, PurchasesList } from "./pages/purchases/Purchases";
import { SupplierForm, SuppliersList } from "./pages/suppliers/Suppliers";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />

              <Route path="/orders" element={<OrdersList />} />
              <Route path="/orders/:id" element={<OrderDetail />} />

              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />

              <Route path="/categories" element={<CategoriesList />} />
              <Route path="/categories/new" element={<CategoryForm />} />
              <Route path="/categories/:id/edit" element={<CategoryForm />} />

              <Route path="/landing-pages" element={<LandingPagesList />} />
              <Route path="/landing-pages/:categoryId" element={<LandingEditor />} />

              <Route path="/brands" element={<BrandsList />} />
              <Route path="/brands/new" element={<BrandForm />} />
              <Route path="/brands/:id/edit" element={<BrandForm />} />

              <Route path="/colors" element={<ColorsList />} />
              <Route path="/colors/new" element={<ColorForm />} />
              <Route path="/colors/:id/edit" element={<ColorForm />} />

              <Route path="/sizes" element={<SizesList />} />
              <Route path="/sizes/new" element={<SizeForm />} />
              <Route path="/sizes/:id/edit" element={<SizeForm />} />

              <Route path="/customers" element={<CustomersList />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />

              <Route path="/coupons" element={<CouponsList />} />
              <Route path="/coupons/new" element={<CouponForm />} />
              <Route path="/coupons/:id/edit" element={<CouponForm />} />

              <Route path="/reviews" element={<ReviewsList />} />

              <Route path="/shipping-zones" element={<ShippingZonesList />} />
              <Route path="/shipping-zones/new" element={<ShippingZoneForm />} />
              <Route path="/shipping-zones/:id/edit" element={<ShippingZoneForm />} />

              <Route path="/payment-methods" element={<PaymentMethodsList />} />
              <Route path="/payment-methods/new" element={<PaymentMethodForm />} />
              <Route path="/payment-methods/:id/edit" element={<PaymentMethodForm />} />

              <Route path="/banners" element={<BannersList />} />
              <Route path="/banners/new" element={<BannerForm />} />
              <Route path="/banners/:id/edit" element={<BannerForm />} />

              <Route path="/settings" element={<Settings />} />

              <Route path="/suppliers" element={<SuppliersList />} />
              <Route path="/suppliers/new" element={<SupplierForm />} />
              <Route path="/suppliers/:id/edit" element={<SupplierForm />} />

              <Route path="/purchases" element={<PurchasesList />} />
              <Route path="/purchases/new" element={<PurchaseForm />} />
              <Route path="/purchases/:id" element={<PurchaseDetail />} />
              <Route path="/purchases/:id/edit" element={<PurchaseForm />} />

              <Route path="/investments" element={<InvestmentsList />} />
              <Route path="/investments/new" element={<InvestmentForm />} />
              <Route path="/investments/:id/edit" element={<InvestmentForm />} />

              <Route path="/newsletter" element={<NewsletterList />} />
              <Route path="/newsletter/compose" element={<NewsletterCompose />} />
              <Route path="/newsletter/:id/compose" element={<NewsletterCompose />} />
              <Route path="/newsletter/logs" element={<NewsletterLogs />} />
              <Route path="/newsletter/logs/:batchId" element={<NewsletterBatch />} />

              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/new" element={<BlogForm />} />
              <Route path="/blog/:id/edit" element={<BlogForm />} />

              <Route path="/reports/sales" element={<SalesReport />} />

              <Route path="/users" element={<StaffList />} />
              <Route path="/users/new" element={<StaffForm />} />
              <Route path="/users/:id/edit" element={<StaffForm />} />
              <Route path="/roles" element={<RolesList />} />
              <Route path="/roles/new" element={<RoleForm />} />
              <Route path="/roles/:id/edit" element={<RoleForm />} />
              <Route path="/activity-log" element={<ActivityLog />} />

              {notYetBuiltRoutes.map((path) => (
                <Route key={path} path={path} element={<ComingSoon />} />
              ))}
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
