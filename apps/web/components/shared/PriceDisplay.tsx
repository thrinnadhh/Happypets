import React from "react";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showSavings?: boolean;
}

export function PriceDisplay({
  price,
  originalPrice,
  className,
  size = "md",
  showSavings = false,
}: PriceDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasDiscount = originalPrice && originalPrice > price;
  const savingsPercent = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-semibold text-foreground tracking-tight",
            {
              "text-lg": size === "sm",
              "text-xl": size === "md",
              "text-3xl": size === "lg",
            }
          )}
        >
          {formatCurrency(price)}
        </span>
        {hasDiscount && (
          <span
            className={cn(
              "text-muted-foreground line-through decoration-muted-foreground/50 font-medium",
              {
                "text-xs": size === "sm",
                "text-sm": size === "md",
                "text-base": size === "lg",
              }
            )}
          >
            {formatCurrency(originalPrice)}
          </span>
        )}
      </div>
      
      {hasDiscount && showSavings && (
        <div className="mt-1">
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive ring-1 ring-inset ring-destructive/20">
            Save {savingsPercent}%
          </span>
        </div>
      )}
    </div>
  );
}
