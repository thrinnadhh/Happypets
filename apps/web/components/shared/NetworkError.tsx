"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({
  message = "Something went wrong. Check your internet connection.",
  onRetry,
  className = "",
}: NetworkErrorProps): React.JSX.Element {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-destructive" aria-hidden="true" />
      </div>
      <div>
        <p className="font-heading font-semibold text-foreground text-lg">Connection Error</p>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="gap-2 cursor-pointer"
          aria-label="Retry loading data"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </Button>
      )}
    </div>
  );
}
