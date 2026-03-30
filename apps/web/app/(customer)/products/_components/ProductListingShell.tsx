"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel } from "./FilterPanel";
import { ProductsTopbar } from "./ProductsTopbar";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductListingShellProps {
  totalCount: number;
  children: React.ReactNode;
}

export function ProductListingShell({ totalCount, children }: ProductListingShellProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="container px-4 py-8">
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8 scrollbar-thin">
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Topbar with mobile filter trigger built in */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <ProductsTopbar totalCount={totalCount} onFilterOpen={() => setFilterOpen(true)} />
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
              <SheetHeader className="text-left pb-4">
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <FilterPanel onFilterChange={() => setFilterOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Products */}
          {children}
        </div>
      </div>
    </div>
  );
}
