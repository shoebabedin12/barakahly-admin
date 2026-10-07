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
