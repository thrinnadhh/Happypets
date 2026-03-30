"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ProductTabsProps {
  description: string;
  details: {
    weight?: string;
    manufacturedDate?: string;
    expiryDate?: string;
    tags?: string[];
    ingredients?: string;
    nutritionalInfo?: string;
  };
  reviews: {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }[];
  averageRating: number;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export function ProductTabs({ description, details, reviews, averageRating }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl">
        <TabsTrigger value="description" className="rounded-lg text-sm">Description</TabsTrigger>
        <TabsTrigger value="details" className="rounded-lg text-sm">Details</TabsTrigger>
        <TabsTrigger value="reviews" className="rounded-lg text-sm">
          Reviews
          {reviews.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 text-[10px]">{reviews.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Description */}
      <TabsContent value="description" className="mt-6">
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          {description.split("\n").map((para, i) => (
            <p key={i} className="mb-3">{para}</p>
          ))}
        </div>
      </TabsContent>

      {/* Details */}
      <TabsContent value="details" className="mt-6">
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[
                { label: "Weight / Size", value: details.weight },
                { label: "Manufactured Date", value: details.manufacturedDate },
                { label: "Best Before", value: details.expiryDate },
                { label: "Key Ingredients", value: details.ingredients },
                { label: "Nutritional Info", value: details.nutritionalInfo },
              ]
                .filter((row) => row.value)
                .map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : "bg-background"}>
                    <td className="px-4 py-3 font-medium text-foreground w-40">{row.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {details.tags && details.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {details.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Reviews */}
      <TabsContent value="reviews" className="mt-6 space-y-6">
        {/* Summary */}
        <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-xl border border-border">
          <div className="text-center">
            <p className="text-5xl font-bold font-heading text-foreground">{averageRating.toFixed(1)}</p>
            <StarDisplay rating={averageRating} />
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
          </div>
        </div>

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {review.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{review.author}</p>
                      {review.verified && (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 h-4">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <StarDisplay rating={review.rating} />
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
