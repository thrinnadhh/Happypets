"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Store,
  Package,
  ShoppingBag,
  Users,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";

interface SuperAdminUser {
  id: string;
  full_name: string;
  email: string;
}

interface SuperAdminSidebarProps {
  user: SuperAdminUser;
  pendingAdminCount?: number;
}

const NAV_ITEMS = [
  { icon: BarChart3, label: "Dashboard", href: "/superadmin/dashboard", badge: null },
  { icon: UserCheck, label: "Admins", href: "/superadmin/admins", badge: "pending" },
  { icon: Store, label: "Shops", href: "/superadmin/shops", badge: null },
  { icon: Package, label: "Products", href: "/superadmin/products", badge: null },
  { icon: ShoppingBag, label: "Orders", href: "/superadmin/orders", badge: null },
  { icon: Users, label: "Customers", href: "/superadmin/customers", badge: null },
];

export default function SuperAdminSidebar({ user, pendingAdminCount = 0 }: SuperAdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "relative flex flex-col text-white shadow-2xl transition-all duration-300 ease-in-out shrink-0",
        "bg-gradient-to-b from-[#1e3a5f] via-[#162d4a] to-[#0f1f33]", // distinct blue-slate instead of green
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 border-b border-white/10 py-5", collapsed ? "justify-center px-3" : "px-5")}>
        <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <Crown className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Happypets</h1>
            <p className="text-[10px] text-blue-300 uppercase tracking-widest">SuperAdmin</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm cursor-pointer z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const showPendingBadge = item.badge === "pending" && pendingAdminCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 group relative",
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="relative shrink-0">
                <Icon className={cn(collapsed ? "w-5 h-5" : "w-4 h-4")} />
                {showPendingBadge && collapsed && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>

              {!collapsed && (
                <span className="text-sm font-medium flex-1">{item.label}</span>
              )}

              {!collapsed && showPendingBadge && (
                <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse ml-auto">
                  {pendingAdminCount > 9 ? "9+" : pendingAdminCount}
                </span>
              )}

              {!collapsed && !showPendingBadge && active && (
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow">
              {user.full_name?.[0]?.toUpperCase() ?? "S"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-blue-300 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <form action="/api/auth/signout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn(
              "text-blue-200 hover:text-white hover:bg-white/10 border border-white/10",
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
