import React from "react";

export default function ProductDetailLoading(): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Image Gallery Skeleton */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="aspect-square w-full bg-muted animate-pulse rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>

          <div className="h-8 w-40 bg-muted animate-pulse rounded" />

          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-full bg-muted animate-pulse rounded" />
            ))}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <div className="h-12 w-32 bg-muted animate-pulse rounded-md" />
            <div className="h-12 flex-1 bg-muted animate-pulse rounded-md" />
          </div>

          <div className="pt-8 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
