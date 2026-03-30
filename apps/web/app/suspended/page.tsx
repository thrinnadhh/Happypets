import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Suspended — Happypets",
};

export default function SuspendedPage({
  searchParams,
}: {
  searchParams?: { reason?: string };
}): JSX.Element {
  const reason = searchParams?.reason;

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldX className="w-12 h-12 text-red-600" />
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Suspended</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Your Happypets account has been suspended and you are unable to access the platform.
          </p>
        </div>

        {/* Reason */}
        {reason && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-left">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">Reason</p>
            <p className="text-sm text-red-800">{decodeURIComponent(reason)}</p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake or would like to appeal, please contact our support team.
          </p>
          <a
            href="mailto:support@thehappypets.in"
            className="flex items-center justify-center gap-2 text-primary font-medium text-sm hover:underline"
          >
            <Mail className="w-4 h-4" />
            support@thehappypets.in
          </a>
        </div>

        {/* Sign out */}
        <form action="/api/auth/signout" method="POST">
          <Button type="submit" variant="outline" className="w-full gap-2">
            Sign Out
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Happypets
        </p>
      </div>
    </div>
  );
}
