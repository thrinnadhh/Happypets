"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Package,
  Tag,
  ShoppingCart,
  ClipboardList,
  Star,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface AdminSidebarProps {
  user: AdminUser;
}

const NAV_ITEMS = [
  { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Tag, label: "Brands", href: "/admin/brands" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: ClipboardList, label: "Inventory", href: "/admin/inventory" },
  { icon: Star, label: "Featured", href: "/admin/featured" },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-gradient-to-b from-[#2C4A2E] to-[#1a2e1c] text-white shadow-xl transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-white/10 py-5",
          collapsed ? "justify-center px-3" : "px-5"
        )}
      >
        <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-xl">🐾</span>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Happypets</h1>
            <p className="text-[10px] text-green-300 uppercase tracking-widest">Admin</p>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm cursor-pointer z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 group",
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-green-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon
                className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")}
              />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className={cn("border-t border-white/10 p-3 space-y-3", collapsed && "flex flex-col items-center")}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user.full_name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-green-300 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <form action="/api/auth/signout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn(
              "text-green-200 hover:text-white hover:bg-white/10 border border-white/10",
              collapsed ? "w-10 h-10" : "w-full gap-2"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && "Logout"}
          </Button>
        </form>
      </div>
    </aside>
  );
}
