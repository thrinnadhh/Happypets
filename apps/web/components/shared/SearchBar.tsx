"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  onSearch,
  className,
  placeholder = "Search for pet food, toys, etc...",
  debounceMs = 300,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  
  // Debounced search logic could be integrated here with a true hook
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch && query !== "") {
        onSearch(query);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <div className={cn("relative flex w-full max-w-sm items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 pr-10 focus-visible:ring-primary rounded-full bg-background border-border/80"
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 text-muted-foreground hover:bg-transparent hover:text-foreground h-8 w-8"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
