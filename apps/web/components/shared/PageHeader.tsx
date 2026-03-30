import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground whitespace-nowrap overflow-x-auto pb-1 no-scrollbar">
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">
            Home
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="h-4 w-4 mx-1.5 shrink-0 opacity-50" />
              <Link
                href={crumb.href}
                className={cn(
                  "hover:text-foreground transition-colors shrink-0",
                  i === breadcrumbs.length - 1 && "font-medium text-foreground pointer-events-none"
                )}
                aria-current={i === breadcrumbs.length - 1 ? "page" : undefined}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-muted-foreground mt-1 text-base">{description}</p>}
        </div>
        {action && (
          <div className="flex shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
