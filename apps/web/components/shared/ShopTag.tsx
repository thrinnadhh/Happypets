import React from "react";
import { Badge } from "@/components/ui/badge";
import { Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopTagProps {
  name: string;
  className?: string;
  icon?: boolean;
}

export function ShopTag({ name, className, icon = true }: ShopTagProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "bg-secondary/10 text-secondary hover:bg-secondary/20 font-medium px-2.5 py-0.5",
        className
      )}
    >
      {icon && <Store className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />}
      {name}
    </Badge>
  );
}
