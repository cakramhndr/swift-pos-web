import { Routes, Route } from "react-router-dom";
import AppSidebar from "./components/layout/AppSidebar";

import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products";
import Transactions from "./pages/Transactions";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";

import { SidebarProvider } from "@/components/ui/sidebar";

import { Toaster } from "sonner";

const salesData = [
  {
    name: "Mon",
    sales: 4000,
  },
  {
    name: "Tue",
    sales: 3000,
  },
  {
    name: "Wed",
    sales: 5000,
  },
  {
    name: "Thu",
    sales: 2780,
  },
  {
    name: "Fri",
    sales: 1890,
  },
  {
    name: "Sat",
    sales: 6390,
  },
  {
    name: "Sun",
    sales: 4490,
  },
];

export default function App() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f5f7fb]">
        <AppSidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/inventory" element={<Inventory />} />
          </Routes>

          <Toaster richColors position="top-center" />
        </main>
      </div>
    </SidebarProvider>
  );
}
