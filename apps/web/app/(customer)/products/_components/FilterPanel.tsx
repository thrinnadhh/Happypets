"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const CATEGORIES = [
  { value: "dog", label: "Dog Food", emoji: "🐶" },
  { value: "cat", label: "Cat Food", emoji: "🐱" },
  { value: "bird", label: "Bird Food", emoji: "🦜" },
  { value: "small-pets", label: "Small Pets", emoji: "🐹" },
];

const BRANDS = [
  { value: "royal-canin", label: "Royal Canin" },
  { value: "pedigree", label: "Pedigree" },
  { value: "drools", label: "Drools" },
  { value: "whiskas", label: "Whiskas" },
  { value: "happypaws", label: "HappyPaws" },
  { value: "purepet", label: "Purepet" },
];

const SHOPS = [
  { value: "shop-1", label: "Pawsome World" },
  { value: "shop-2", label: "Pet Paradise" },
  { value: "shop-3", label: "FurEver Yours" },
];

export type FilterState = {
  categories: string[];
  brands: string[];
  shops: string[];
  priceRange: [number, number];
  saleOnly: boolean;
  minRating: number | null;
};

interface FilterPanelProps {
  onFilterChange?: () => void;
  className?: string;
}

export function FilterPanel({ onFilterChange, className }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse existing URL params
  const getActive = (key: string) =>
    searchParams.get(key)?.split(",").filter(Boolean) ?? [];

  const selectedCategories = getActive("categories");
  const selectedBrands = getActive("brands");
  const selectedShops = getActive("shops");
  const priceMin = Number(searchParams.get("priceMin") ?? 0);
  const priceMax = Number(searchParams.get("priceMax") ?? 5000);
  const saleOnly = searchParams.get("sale") === "true";
  const minRating = searchParams.get("rating") ? Number(searchParams.get("rating")) : null;

  const updateParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete("page"); // reset pagination on filter change
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      onFilterChange?.();
    },
    [pathname, router, searchParams, onFilterChange]
  );

  const toggleMulti = (key: string, current: string[], value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParam({ [key]: next.length ? next.join(",") : null });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
    onFilterChange?.();
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedShops.length > 0 ||
    saleOnly ||
    minRating !== null ||
    priceMin > 0 ||
    priceMax < 5000;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold text-foreground">Filters</h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive h-auto py-0 px-2">
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.value} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                id={`cat-${cat.value}`}
                checked={selectedCategories.includes(cat.value)}
                onCheckedChange={() => toggleMulti("categories", selectedCategories, cat.value)}
              />
              <Label htmlFor={`cat-${cat.value}`} className="flex items-center gap-2 cursor-pointer text-sm">
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brand */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Brand</h3>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <div key={brand.value} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                id={`brand-${brand.value}`}
                checked={selectedBrands.includes(brand.value)}
                onCheckedChange={() => toggleMulti("brands", selectedBrands, brand.value)}
              />
              <Label htmlFor={`brand-${brand.value}`} className="cursor-pointer text-sm">{brand.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Shop */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Shop</h3>
        <div className="space-y-2">
          {SHOPS.map((shop) => (
            <div key={shop.value} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                id={`shop-${shop.value}`}
                checked={selectedShops.includes(shop.value)}
                onCheckedChange={() => toggleMulti("shops", selectedShops, shop.value)}
              />
              <Label htmlFor={`shop-${shop.value}`} className="cursor-pointer text-sm">
                <Badge variant="outline" className="text-xs font-medium">{shop.label}</Badge>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Price Range</h3>
        <Slider
          min={0}
          max={5000}
          step={50}
          value={[priceMin, priceMax]}
          onValueChange={([min, max]) =>
            updateParam({
              priceMin: min > 0 ? String(min) : null,
              priceMax: max < 5000 ? String(max) : null,
            })
          }
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>₹{priceMin.toLocaleString("en-IN")}</span>
          <span>₹{priceMax.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Rating</h3>
        <div className="space-y-2">
          {[4, 3].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                updateParam({ rating: minRating === rating ? null : String(rating) })
              }
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                minRating === rating
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3.5 h-3.5",
                      i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span>{rating}★ & above</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sale Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">On Sale Only</p>
          <p className="text-xs text-muted-foreground mt-0.5">Show discounted items</p>
        </div>
        <Switch
          checked={saleOnly}
          onCheckedChange={(checked) => updateParam({ sale: checked ? "true" : null })}
        />
      </div>
    </div>
  );
}
