"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Heart, Share2, Bell, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import type { StockStatus } from "@/components/shared/StockBadge";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stockStatus: StockStatus;
  stockQuantity?: number;
  imageUrl: string;
  shopId: string;
}

interface AddToCartSectionProps {
  product: Product;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const maxQty = product.stockQuantity ?? 10;
  const isOutOfStock = product.stockStatus === "out-of-stock";
  const isLowStock = product.stockStatus === "low-stock";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        shopId: product.shopId,
      },
      quantity
    );
    setAddedToCart(true);
    toast.success("Added to cart!", {
      description: `${quantity}x ${product.name}`,
      action: { label: "View Cart", onClick: () => (window.location.href = "/cart") },
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    setWishlisted((w) => !w);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="space-y-5">
      {/* Stock status */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
        ) : isLowStock ? (
          <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-sm">
            {product.stockQuantity ? `Only ${product.stockQuantity} left` : "Low Stock"}
          </Badge>
        ) : (
          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-sm">
            ✓ In Stock
          </Badge>
        )}
      </div>

      {/* Quantity selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">Quantity:</span>
          <div className="flex items-center border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-semibold text-foreground">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart / Notify CTA */}
      <div className="flex gap-3">
        {isOutOfStock ? (
          <Button variant="outline" className="flex-1 h-12 text-base gap-2" onClick={() => toast.info("We'll notify you when back in stock!")}>
            <Bell className="w-5 h-5" />
            Notify Me
          </Button>
        ) : (
          <Button
            className={cn(
              "flex-1 h-12 text-base gap-2 transition-all duration-300",
              addedToCart && "bg-emerald-600 hover:bg-emerald-600"
            )}
            onClick={handleAddToCart}
          >
            {addedToCart ? (
              <>
                <Check className="w-5 h-5" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </>
            )}
          </Button>
        )}

        {/* Wishlist */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-12 w-12 rounded-xl transition-all duration-200",
            wishlisted && "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
          )}
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("w-5 h-5", wishlisted && "fill-red-500")} />
        </Button>

        {/* Share */}
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-xl"
          onClick={handleShare}
          aria-label="Share product"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
