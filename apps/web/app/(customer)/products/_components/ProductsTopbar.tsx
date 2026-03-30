"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
  { value: "discount", label: "Best Discount" },
];

interface ProductsTopbarProps {
  totalCount: number;
  onFilterOpen?: () => void;
}

export function ProductsTopbar({ totalCount, onFilterOpen }: ProductsTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? "relevance";
  const view = searchParams.get("view") ?? "grid";

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Compute active filter chips from URL
  const activeChips: { label: string; paramKey: string; value: string }[] = [];

  const categories = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  const brands = searchParams.get("brands")?.split(",").filter(Boolean) ?? [];
  const shops = searchParams.get("shops")?.split(",").filter(Boolean) ?? [];

  categories.forEach((c) =>
    activeChips.push({ label: `Category: ${c}`, paramKey: "categories", value: c })
  );
  brands.forEach((b) =>
    activeChips.push({ label: `Brand: ${b}`, paramKey: "brands", value: b })
  );
  shops.forEach((s) =>
    activeChips.push({ label: `Shop: ${s}`, paramKey: "shops", value: s })
  );
  if (searchParams.get("sale") === "true") {
    activeChips.push({ label: "On Sale", paramKey: "sale", value: "true" });
  }
  if (searchParams.get("rating")) {
    activeChips.push({
      label: `${searchParams.get("rating")}★ & above`,
      paramKey: "rating",
      value: searchParams.get("rating")!,
    });
  }
  if (searchParams.get("priceMin") || searchParams.get("priceMax")) {
    const min = searchParams.get("priceMin") ?? "0";
    const max = searchParams.get("priceMax") ?? "5000";
    activeChips.push({ label: `₹${min}–₹${max}`, paramKey: "priceRange", value: "" });
  }

  const removeChip = (chip: (typeof activeChips)[0]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (chip.paramKey === "categories" || chip.paramKey === "brands" || chip.paramKey === "shops") {
      const current = params.get(chip.paramKey)?.split(",").filter(Boolean) ?? [];
      const next = current.filter((v) => v !== chip.value);
      if (next.length === 0) {
        params.delete(chip.paramKey);
      } else {
        params.set(chip.paramKey, next.join(","));
      }
    } else if (chip.paramKey === "priceRange") {
      params.delete("priceMin");
      params.delete("priceMax");
    } else {
      params.delete(chip.paramKey);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Mobile filter button */}
        <Button
          variant="outline"
          size="sm"
          className="md:hidden flex items-center gap-2"
          onClick={onFilterOpen}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeChips.length > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {activeChips.length}
            </Badge>
          )}
        </Button>

        {/* Result count */}
        <p className="text-sm text-muted-foreground flex-1">
          <span className="font-semibold text-foreground">{totalCount.toLocaleString("en-IN")}</span> products found
        </p>

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => updateParam("sort", v === "relevance" ? null : v)}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex items-center gap-1 border border-border rounded-lg p-1 hidden sm:flex">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0 rounded-md transition-colors",
              view === "grid" && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={() => updateParam("view", "grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0 rounded-md transition-colors",
              view === "list" && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={() => updateParam("view", "list")}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active:</span>
          {activeChips.map((chip, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="flex items-center gap-1 text-xs cursor-pointer pr-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              onClick={() => removeChip(chip)}
            >
              {chip.label}
              <X className="w-3 h-3 ml-0.5" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
