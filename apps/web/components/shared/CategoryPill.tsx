import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CategoryPillProps {
  label: string;
  emoji?: string;
  href?: string;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CategoryPill({
  label,
  emoji,
  href,
  isActive = false,
  className,
  onClick,
}: CategoryPillProps) {
  const innerContent = (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
        isActive
          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
          : "bg-background border text-foreground hover:bg-accent hover:border-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
    >
      {emoji && <span className="text-base" role="img" aria-hidden>{emoji}</span>}
      {label}
    </span>
  );

  if (href) {
    return <Link href={href}>{innerContent}</Link>;
  }

  return innerContent;
}
