"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Manage Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: Users,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-2xl text-emerald-600"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            EB
          </div>
          <span>EasyBuy</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-4">
          Menu
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group",
                isActive
                  ? "bg-emerald-50 text-emerald-600 shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-emerald-600"
                    : "text-zinc-400 group-hover:text-zinc-600",
                )}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200"
        >
          <Home className="w-5 h-5 text-zinc-400" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
