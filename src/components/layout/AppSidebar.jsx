import { Link, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Warehouse,
  BarChart3,
PieChart,
Settings,
} from "lucide-react"

const items = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Products",
    icon: Package,
    path: "/products",
  },
  {
    title: "Transactions",
    icon: ShoppingCart,
    path: "/transactions",
  },
  {
    title: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    title: "Inventory",
    icon: Warehouse,
    path: "/inventory",
  },
  {
    type: "divider",
    label: "Analytics",
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
  {
    title: "Analytics",
    icon: PieChart,
    path: "/analytics",
  },
  {
    type: "divider",
    label: "System",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
]

export default function AppSidebar() {

  const location = useLocation()

  return (
<Sidebar className="w-[260px] border-r border-[#ececf2] bg-white">
  <SidebarContent>

    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Swift POS
      </h1>
    </div>

    <SidebarGroup>
      <SidebarGroupContent>
        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Main Menu
        </p>
        <SidebarMenu>
          {items.map((item) => {
            if (item.type === "divider") {
              return (
               <p
                    key={item.label}
                    className="px-4 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400"
                    >
                    {item.label}
                </p>
              )
            }
            return (
            <SidebarMenuItem
              key={item.title}
  
            >
              <SidebarMenuButton
               data-active={location.pathname === item.path}
                asChild
                className="
                  h-11 rounded-xl px-4
                  hover:bg-gray-100
                  hover:translate-x-0.5
                  hover:text-violet-600
                  transition-all duration-200
                  data-[active=true]:bg-violet-100
                  data-[active=true]:text-violet-700
                " 
                 
              >
                <Link
                to={item.path}
                  className="flex items-center gap-3 text-sm font-medium">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

      </SidebarGroupContent>
    </SidebarGroup>

  </SidebarContent>
</Sidebar>
  )
}


