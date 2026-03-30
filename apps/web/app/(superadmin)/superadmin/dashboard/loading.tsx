import React from "react";

export default function SuperAdminDashboardLoading(): JSX.Element {
  return (
    <div className="p-6 space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border h-24 rounded-lg p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
            <div className="space-y-2">
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              <div className="h-5 w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shops Status List */}
        <div className="bg-card border rounded-xl p-6 space-y-6">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Global Analytics Skeleton */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-[350px] w-full bg-muted/30 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}
