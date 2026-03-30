"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, GripVertical, Plus, Trash2 } from "lucide-react";

// Mock featured product lists
const INITIAL_RECOMMENDED = [
  { id: "1", name: "Royal Canin Medium Adult 2kg", category: "Dog Food", price: 1299, rating: 4.6 },
  { id: "2", name: "Farmina N&D Cat 1.5kg", category: "Cat Food", price: 2499, rating: 4.8 },
  { id: "3", name: "Drools Focus Puppy 1kg", category: "Dog Food", price: 649, rating: 4.5 },
  { id: "4", name: "Whiskas Adult Tuna 1.2kg", category: "Cat Food", price: 499, rating: 4.3 },
];

const INITIAL_TRENDING = [
  { id: "5", name: "Pedigree Adult Chicken 10kg", category: "Dog Food", price: 1899, rating: 4.4 },
  { id: "6", name: "NutriPet Hamster Mix 500g", category: "Hamster Food", price: 229, rating: 4.7 },
  { id: "3", name: "Drools Focus Puppy 1kg", category: "Dog Food", price: 649, rating: 4.5 },
];

const ALL_PRODUCTS = [
  { id: "7", name: "Taiyo Goldfish Pellets 200g", category: "Fish Food", price: 129, rating: 4.2 },
  { id: "8", name: "Whiskas Kitten Ocean Fish 400g", category: "Cat Food", price: 349, rating: 4.5 },
  { id: "9", name: "Pedigree Dentastix Medium", category: "Dog Treats", price: 200, rating: 4.1 },
];

type Product = typeof INITIAL_RECOMMENDED[0];

function FeaturedList({
  title,
  items,
  onRemove,
  onMoveUp,
  onMoveDown,
  availableToAdd,
  onAdd,
}: {
  title: string;
  items: Product[];
  onRemove: (id: string) => void;
  onMoveUp: (i: number) => void;
  onMoveDown: (i: number) => void;
  availableToAdd: Product[];
  onAdd: (p: Product) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <Badge variant="secondary">{items.length} products</Badge>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab shrink-0" />
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-lg shrink-0">
              🛍️
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{item.category}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                  {item.rating}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-semibold">₹{item.price}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onMoveUp(i)}
                disabled={i === 0}
              >↑</Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onMoveDown(i)}
                disabled={i === items.length - 1}
              >↓</Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
            No products yet. Add from the list below.
          </div>
        )}
      </div>

      {/* Add from available */}
      {availableToAdd.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Add Products</p>
          <div className="space-y-2">
            {availableToAdd.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · ₹{p.price}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => onAdd(p)} className="gap-1.5 shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFeaturedPage(): JSX.Element {
  const [recommended, setRecommended] = useState<Product[]>(INITIAL_RECOMMENDED);
  const [trending, setTrending] = useState<Product[]>(INITIAL_TRENDING);

  const moveUp = (list: Product[], setList: typeof setRecommended, i: number) => {
    if (i === 0) return;
    const next = [...list];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setList(next);
  };

  const moveDown = (list: Product[], setList: typeof setRecommended, i: number) => {
    if (i === list.length - 1) return;
    const next = [...list];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setList(next);
  };

  const recAvailable = [...ALL_PRODUCTS].filter((p) => !recommended.find((r) => r.id === p.id));
  const trendAvailable = [...ALL_PRODUCTS].filter((p) => !trending.find((r) => r.id === p.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Featured Products</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage which products appear in the Recommended and Trending sections on the homepage.
        </p>
      </div>

      <Tabs defaultValue="recommended">
        <TabsList className="mb-6">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          <FeaturedList
            title="Recommended Products"
            items={recommended}
            onRemove={(id) => setRecommended((p) => p.filter((r) => r.id !== id))}
            onMoveUp={(i) => moveUp(recommended, setRecommended, i)}
            onMoveDown={(i) => moveDown(recommended, setRecommended, i)}
            availableToAdd={recAvailable}
            onAdd={(p) => setRecommended((r) => [...r, p])}
          />
        </TabsContent>

        <TabsContent value="trending">
          <FeaturedList
            title="Trending Products"
            items={trending}
            onRemove={(id) => setTrending((p) => p.filter((r) => r.id !== id))}
            onMoveUp={(i) => moveUp(trending, setTrending, i)}
            onMoveDown={(i) => moveDown(trending, setTrending, i)}
            availableToAdd={trendAvailable}
            onAdd={(p) => setTrending((r) => [...r, p])}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
