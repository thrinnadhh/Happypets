"use client";

import React from "react";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

// Assuming we re-export the Product type from ProductCard
type Product = React.ComponentProps<typeof ProductCard>["product"];

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  layout?: "grid" | "list";
  className?: string;
  onAddToCart?: (id: string) => void;
  onFavorite?: (id: string) => void;
}

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  layout = "grid",
  className,
  onAddToCart,
  onFavorite,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div 
        className={cn(
          "grid gap-6 w-full animate-in fade-in duration-500",
          layout === "grid" 
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2",
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} isList={layout === "list"} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState 
        title="No Products Found" 
        description="We couldn't find any products matching your criteria. Try adjusting your filters."
      />
    );
  }

  return (
    <div 
      className={cn(
        "grid gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-700",
        layout === "grid" 
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={layout}
          onAddToCart={onAddToCart}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
}
