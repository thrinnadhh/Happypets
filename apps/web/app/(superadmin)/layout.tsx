import type { Metadata } from "next";
import { ReactNode } from "react";
import SuperAdminSidebar from "@/components/superadmin/SuperAdminSidebar";

export const metadata: Metadata = {
  title: "SuperAdmin — Happypets",
};

const MOCK_SUPERADMIN = {
  id: "sa-1",
  full_name: "Super Admin",
  email: "superadmin@happypets.in",
};

// In production: fetch real pending count from Supabase
const PENDING_ADMIN_COUNT = 3; // mock

export default function SuperAdminLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <SuperAdminSidebar user={MOCK_SUPERADMIN} pendingAdminCount={PENDING_ADMIN_COUNT} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              SuperAdmin Console
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] flex items-center justify-center text-sm font-bold text-white shadow">
              S
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold">{MOCK_SUPERADMIN.full_name}</p>
              <p className="text-[10px] text-muted-foreground">Super Administrator</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
