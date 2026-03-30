import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

interface StockBadgeProps {
  status: StockStatus;
  quantity?: number;
  className?: string;
}

export function StockBadge({ status, quantity, className }: StockBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "in-stock":
        return {
          label: "In Stock",
          className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-emerald-200",
        };
      case "low-stock":
        return {
          label: quantity ? `Only ${quantity} left` : "Low Stock",
          className: "bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-amber-200",
        };
      case "out-of-stock":
        return {
          label: "Out of Stock",
          className: "bg-destructive/10 text-destructive hover:bg-destructive/10 border-destructive/20",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border shadow-sm",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
