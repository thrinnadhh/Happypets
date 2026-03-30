"use client";

import React, { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  className?: string;
  count?: number;
  onClick?: () => void;
}

export function CartButton({ className, count = 0, onClick }: CartButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const prevCount = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger bounce *only* when count increases (item added)
  useEffect(() => {
    if (mounted && count > prevCount.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 400);
      prevCount.current = count;
      return () => clearTimeout(timer);
    } else {
      prevCount.current = count;
    }
  }, [count, mounted]);

  if (!mounted) {
    return (
      // SSR placeholder — same dimensions to avoid layout shift
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative min-h-[44px] min-w-[44px]", className)}
        disabled
        aria-label="Cart (loading)"
      >
        <ShoppingCart className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative hover:bg-accent/20 group min-h-[44px] min-w-[44px]",
        className
      )}
      onClick={onClick}
      aria-label={count > 0 ? `Cart, ${count} item${count !== 1 ? "s" : ""}` : "Open cart"}
    >
      <ShoppingCart
        className="h-5 w-5 text-foreground transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      />
      {count > 0 && (
        <span
          key={count} // Force re-mount on count change to replay animation
          className={cn(
            "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm select-none",
            isBouncing && "animate-cart-pop"
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}
