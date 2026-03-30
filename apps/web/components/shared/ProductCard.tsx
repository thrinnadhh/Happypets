"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "./RatingStars";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge, StockStatus } from "./StockBadge";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  imageUrl?: string;
  stockStatus: StockStatus;
  isNew?: boolean;
}

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list" | "featured" | "trending";
  className?: string;
  onAddToCart?: (id: string) => void;
  onFavorite?: (id: string) => void;
  loading?: boolean;
}

export function ProductCard({
  product,
  variant = "grid",
  className,
  onAddToCart,
  onFavorite,
  loading = false,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [heartBouncing, setHeartBouncing] = useState(false);
  const [cartBouncing, setCartBouncing] = useState(false);

  if (loading) {
    return <ProductCardSkeleton isList={variant === "list"} />;
  }

  const isList = variant === "list";
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
    setHeartBouncing(true);
    setTimeout(() => setHeartBouncing(false), 350);
    onFavorite?.(product.id);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockStatus === "out-of-stock") return;
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 400);
    onAddToCart?.(product.id);
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-card border border-border transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary",
        isList ? "flex flex-row" : "flex flex-col",
        className
      )}
    >
      <div
        className={cn(
          "relative bg-muted/20 overflow-hidden",
          isList ? "w-1/3 min-w-[120px] shrink-0" : "w-full aspect-square"
        )}
      >
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-primary/90 text-primary-foreground pointer-events-none shadow-sm font-bold uppercase text-[10px]">
              New
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="pointer-events-none shadow-sm font-bold tracking-widest uppercase text-[10px]">
              Sale
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 min-h-[36px] min-w-[36px] rounded-full bg-background/80 backdrop-blur-sm shadow-sm",
              "hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors",
              isWishlisted && "text-red-500 bg-red-50"
            )}
            onClick={handleFavorite}
            aria-label={`${isWishlisted ? "Remove" : "Add"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
            aria-pressed={isWishlisted}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-transform",
                heartBouncing && "animate-heart-pop",
                isWishlisted && "fill-current"
              )}
              aria-hidden="true"
            />
          </Button>
        </div>

        {/* Product image */}
        <Link
          href={`/product/${product.id}`}
          className="block h-full w-full outline-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes={
                isList
                  ? "120px"
                  : "(max-width: 375px) 50vw, (max-width: 768px) 45vw, 33vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex items-center justify-center w-full h-full text-muted-foreground/30"
              aria-hidden="true"
            >
              <ImageIcon className="w-12 h-12" strokeWidth={1} />
            </div>
          )}
        </Link>
      </div>

      <div className={cn("flex flex-col flex-1", isList ? "p-4" : "p-4")}>
        <div className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">
          {product.brand}
        </div>

        <Link
          href={`/product/${product.id}`}
          className="outline-none focus-visible:underline decoration-primary"
        >
          <h3 className="font-heading font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors text-sm sm:text-base">
            {product.name}
          </h3>
        </Link>

        {product.rating !== undefined && (
          <div className="mt-2 text-xs">
            <RatingStars rating={product.rating} count={product.reviews} size={14} />
          </div>
        )}

        <div
          className={cn(
            "mt-auto flex items-end justify-between",
            isList ? "pt-4" : "pt-4 gap-2"
          )}
        >
          <div className="flex flex-col">
            <PriceDisplay
              price={product.price}
              originalPrice={product.originalPrice}
              size={isList ? "md" : "sm"}
            />
            <div className="mt-1">
              <StockBadge status={product.stockStatus} />
            </div>
          </div>

          <Button
            size={isList ? "default" : "icon"}
            className={cn(
              "rounded-full transition-all duration-200 shadow-sm hover:shadow min-h-[40px]",
              "active:scale-90",
              cartBouncing && "animate-cart-pop",
              product.stockStatus === "out-of-stock" && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleAddToCart}
            disabled={product.stockStatus === "out-of-stock"}
            aria-label={
              isList
                ? `Add ${product.name} to cart`
                : `Add ${product.name} to cart`
            }
          >
            {isList ? (
              "Add to Cart"
            ) : (
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ProductCardSkeleton({ isList = false }: { isList?: boolean }) {
  return (
    <Card
      className={cn("overflow-hidden", isList ? "flex flex-row" : "flex flex-col")}
      aria-hidden="true"
    >
      <div
        className={cn(
          "bg-muted skeleton-shimmer",
          isList ? "w-1/3 min-w-[120px]" : "w-full aspect-square"
        )}
      />
      <div className="flex-1 p-4 space-y-3">
        <div className="h-3 w-1/4 bg-muted skeleton-shimmer rounded" />
        <div className="h-4 w-3/4 bg-muted skeleton-shimmer rounded" />
        <div className="h-4 w-1/2 bg-muted skeleton-shimmer rounded" />
        <div className="pt-4 flex justify-between items-end mt-auto">
          <div className="space-y-2">
            <div className="h-5 w-16 bg-muted skeleton-shimmer rounded" />
            <div className="h-4 w-20 bg-muted skeleton-shimmer rounded" />
          </div>
          <div className="h-10 w-10 bg-muted skeleton-shimmer rounded-full" />
        </div>
      </div>
    </Card>
  );
}
