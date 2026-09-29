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
