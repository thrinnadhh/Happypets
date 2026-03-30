"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { Heart, HeartCrack, ShoppingCart, Star, Trash2, PawPrint } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

// Wishlist is stored in zustand or localStorage; mock data for demonstration
const INITIAL_WISHLIST = [
  {
    id: "w-1",
    productId: "prod-1",
    name: "Farmina N&D Ancestral Grain Cat 1.5kg",
    brand: "Farmina",
    category: "Cat Food",
    price: 2499,
    discountPercentage: 5,
    image: "",
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    shopId: "shop-1",
  },
  {
    id: "w-2",
    productId: "prod-2",
    name: "Royal Canin Medium Adult 2kg",
    brand: "Royal Canin",
    category: "Dog Food",
    price: 1299,
    discountPercentage: 10,
    image: "",
    rating: 4.6,
    reviewCount: 521,
    inStock: true,
    shopId: "shop-1",
  },
  {
    id: "w-3",
    productId: "prod-3",
    name: "Drools Focus Puppy Super Premium 1kg",
    brand: "Drools",
    category: "Dog Food",
    price: 649,
    discountPercentage: 15,
    image: "",
    rating: 4.5,
    reviewCount: 189,
    inStock: false,
    shopId: "shop-2",
  },
  {
    id: "w-4",
    productId: "prod-4",
    name: "NutriPet Hamster Mix 500g",
    brand: "NutriPet",
    category: "Hamster Food",
    price: 229,
    discountPercentage: 0,
    image: "",
    rating: 4.7,
    reviewCount: 78,
    inStock: true,
    shopId: "shop-2",
  },
  {
    id: "w-5",
    productId: "prod-5",
    name: "Whiskas Kitten Ocean Fish 400g",
    brand: "Whiskas",
    category: "Cat Food",
    price: 349,
    discountPercentage: 0,
    image: "",
    rating: 4.3,
    reviewCount: 312,
    inStock: true,
    shopId: "shop-1",
  },
  {
    id: "w-6",
    productId: "prod-6",
    name: "Taiyo Goldfish Pellets 200g",
    brand: "Taiyo",
    category: "Fish Food",
    price: 129,
    discountPercentage: 0,
    image: "",
    rating: 4.2,
    reviewCount: 45,
    inStock: true,
    shopId: "shop-3",
  },
];

type WishlistItem = typeof INITIAL_WISHLIST[0];


export default function WishlistPage(): JSX.Element {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const { addItem } = useCartStore();

  const discountedPrice = (item: WishlistItem) =>
    item.discountPercentage > 0
      ? Math.round(item.price * (1 - item.discountPercentage / 100))
      : item.price;

  const handleRemove = (id: string) => {
    setWishlist((p) => p.filter((w) => w.id !== id));
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.inStock) return;
    addItem(
      {
        id: item.productId,
        variantId: null,
        name: item.name,
        price: discountedPrice(item),
        image: item.image,
        shopId: item.shopId,
      },
      1
    );
    toast.success("Added to cart!");
  };

  const handleMoveAllToCart = () => {
    const inStockItems = wishlist.filter((w) => w.inStock);
    inStockItems.forEach((item) =>
      addItem(
        { id: item.productId, variantId: null, name: item.name, price: discountedPrice(item), image: item.image, shopId: item.shopId },
        1
      )
    );
    setWishlist((prev) => prev.filter((w) => !w.inStock));
    toast.success(`${inStockItems.length} items added to cart!`);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-5 p-8 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <HeartCrack className="w-10 h-10 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Your wishlist is empty</h2>
          <p className="text-muted-foreground text-sm">
            Save products you love and find them here later.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/products">Explore Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const inStockCount = wishlist.filter((w) => w.inStock).length;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-500 text-red-500" /> My Wishlist
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{wishlist.length} saved items</p>
          </div>
          {inStockCount > 0 && (
            <Button onClick={handleMoveAllToCart} className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Move all to Cart ({inStockCount})
            </Button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map((item) => {
            const finalPrice = discountedPrice(item);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center text-6xl">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full group-hover:scale-110 transition-transform duration-300">
                      <PawPrint className="w-14 h-14 text-primary/30" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {item.discountPercentage > 0 && (
                      <Badge className="bg-red-500 text-white text-xs font-bold px-2 w-fit">
                        {item.discountPercentage}% OFF
                      </Badge>
                    )}
                    {!item.inStock && (
                      <Badge variant="secondary" className="text-xs w-fit">Out of Stock</Badge>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-muted-foreground hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{item.brand}</p>
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="text-sm font-semibold leading-snug hover:text-primary transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{item.rating}</span>
                    <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-bold text-primary">₹{finalPrice.toLocaleString("en-IN")}</span>
                    {item.discountPercentage > 0 && (
                      <span className="text-xs text-muted-foreground line-through">₹{item.price.toLocaleString("en-IN")}</span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <Button
                    className="w-full mt-3 gap-2 h-11"
                    disabled={!item.inStock}
                    onClick={() => handleAddToCart(item)}
                    variant={item.inStock ? "default" : "outline"}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {item.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
