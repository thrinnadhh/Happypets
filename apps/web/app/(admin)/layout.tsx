import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin Dashboard — Happypets",
};

// Mock user for layout — in production this would come from Supabase server auth
const MOCK_ADMIN_USER = {
  id: "admin-1",
  full_name: "Shop Admin",
  email: "admin@happypets.in",
  role: "admin" as const,
};

export default function AdminLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar user={MOCK_ADMIN_USER} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <AdminTopbar user={MOCK_ADMIN_USER} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
