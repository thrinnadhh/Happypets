import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Happypets",
};

// Auth pages have no navigation — clean full-screen layout
export default function AuthLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
