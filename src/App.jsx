import { Routes, Route, Navigate } from "react-router-dom";
import AppSidebar from "./components/layout/AppSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import useAppearance from "./hooks/useAppearance";

import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ProductEdit from "./pages/ProductEdit";
import Transactions from "./pages/Transactions";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import InventoryLogs from "./pages/InventoryLogs";
import Reports from "./pages/Reports";
import Suppliers from "./pages/Suppliers";
import PurchaseOrders from "./pages/PurchaseOrders";
import StockOpnames from "./pages/StockOpnames";
import StockOpnameDetail from "./pages/StockOpnameDetail";
import PurchaseOrderEdit from "./pages/PurchaseOrderEdit";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import SupplierDetail from "./pages/SupplierDetail";
import Categories from "./pages/Categories";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ActivityLogs from "./pages/ActivityLogs";
import AiAssistant from "./pages/AiAssistant";

import { Toaster } from "sonner";

export default function App() {
  // Apply accent color CSS variables on mount
  useAppearance();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes (sidebar layout) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex min-h-screen w-full bg-[#f7f8fa] dark:bg-gray-900">
              <AppSidebar />
              <main className="flex-1 ml-[260px] p-7 lg:p-10 max-w-[1600px]">
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  {/* Specific product routes BEFORE /products/:id */}
                  <Route path="/products/:id/edit" element={<ProductEdit />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory-logs" element={<InventoryLogs />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/purchase-orders" element={<PurchaseOrders />} />
                  {/* Specific purchase-order routes BEFORE /purchase-orders/:id */}
                  <Route
                    path="/purchase-orders/:id/edit"
                    element={<PurchaseOrderEdit />}
                  />
                  <Route
                    path="/purchase-orders/:id"
                    element={<PurchaseOrderDetail />}
                  />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/suppliers/:id" element={<SupplierDetail />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/stock-opnames" element={<StockOpnames />} />
                  <Route
                    path="/stock-opnames/:id"
                    element={<StockOpnameDetail />}
                  />
                  <Route path="/activity-logs" element={<ActivityLogs />} />
                  <Route path="/ai-assistant" element={<AiAssistant />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
                <Toaster richColors position="top-center" />
              </main>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
