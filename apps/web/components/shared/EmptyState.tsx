"use client";

import React from "react";
import { PackageOpen, WifiOff, SearchX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateVariant = "empty" | "network-error" | "not-found" | "no-results";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const VARIANT_DEFAULTS: Record<
  EmptyStateVariant,
  { icon: React.ReactNode; title: string; description: string; actionLabel: string }
> = {
  empty: {
    icon: <PackageOpen className="h-10 w-10" strokeWidth={1.5} />,
    title: "Nothing here yet",
    description: "Items you add will appear here.",
    actionLabel: "Browse Products",
  },
  "network-error": {
    icon: <WifiOff className="h-10 w-10" strokeWidth={1.5} />,
    title: "Connection Problem",
    description:
      "We couldn't load this content. Check your internet connection and try again.",
    actionLabel: "Try Again",
  },
  "not-found": {
    icon: <SearchX className="h-10 w-10" strokeWidth={1.5} />,
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    actionLabel: "Go Home",
  },
  "no-results": {
    icon: <SearchX className="h-10 w-10" strokeWidth={1.5} />,
    title: "No Products Found",
    description:
      "We couldn't find anything matching your filters. Try adjusting your search criteria.",
    actionLabel: "Clear Filters",
  },
};

export function EmptyState({
  variant = "empty",
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  className,
}: EmptyStateProps) {
  const defaults = VARIANT_DEFAULTS[variant];

  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;
  const displayActionLabel = actionLabel ?? defaults.actionLabel;
  const displayIcon = icon ?? defaults.icon;

  const isNetworkError = variant === "network-error";

  return (
    <div
      role="status"
      aria-label={displayTitle}
      className={cn(
        "flex min-h-[40vh] w-full flex-col items-center justify-center p-8 text-center animate-fade-in",
        className
      )}
    >
      {/* Illustration circle */}
      <div
        className={cn(
          "flex h-24 w-24 items-center justify-center rounded-full mb-6 transition-all",
          isNetworkError
            ? "bg-destructive/10 text-destructive"
            : "bg-muted/60 text-muted-foreground"
        )}
        aria-hidden="true"
      >
        {displayIcon}
      </div>

      <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
        {displayTitle}
      </h3>
      <p className="max-w-sm text-muted-foreground text-sm leading-relaxed mb-8">
        {displayDescription}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onAction && (
          <Button
            onClick={onAction}
            className={cn(
              "min-h-[44px] px-6 gap-2",
              isNetworkError ? "" : "variant-outline border-primary text-primary hover:bg-primary/10"
            )}
            variant={isNetworkError ? "default" : "outline"}
          >
            {isNetworkError && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
            {displayActionLabel}
          </Button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <Button
            onClick={onSecondaryAction}
            variant="ghost"
            className="min-h-[44px] text-muted-foreground hover:text-foreground"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
