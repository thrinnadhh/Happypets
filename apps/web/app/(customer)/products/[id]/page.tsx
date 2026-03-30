import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImageGallery } from "./_components/ProductImageGallery";
import { AddToCartSection } from "./_components/AddToCartSection";
import { ProductTabs } from "./_components/ProductTabs";
import { ProductGrid } from "@/components/shared/ProductGrid";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/shared/RatingStars";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import type { StockStatus } from "@/components/shared/StockBadge";
import { AlertTriangle } from "lucide-react";

// ─── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_PRODUCTS: Record<string, any> = {
  "1": {
    id: "1",
    name: "Royal Canin Adult Dog Food – Chicken & Rice 3kg",
    brand: "Royal Canin",
    brandSlug: "royal-canin",
    category: "Dog Food",
    categorySlug: "dog",
    shopId: "shop-1",
    shopName: "Pawsome World",
    price: 1499,
    originalPrice: 1999,
    rating: 4.8,
    reviews: 243,
    stockStatus: "in-stock" as StockStatus,
    stockQuantity: 42,
    isNew: false,
    images: [
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80",
      "https://images.unsplash.com/photo-1601758064954-cbb63b93b7e6?w=800&q=80",
      "https://images.unsplash.com/photo-1601296248898-de5acc8b1bba?w=800&q=80",
    ],
    description:
      "Royal Canin Adult Dog Food is a precisely balanced, complete, and scientifically formulated nutrition designed for adult dogs over 12 months.\n\nEnriched with a complex of antioxidants including Vitamin E and Vitamin C to help neutralize free radicals and keep your dog's immune system strong. The high quality protein blend supports healthy muscle mass and the kibble shape is designed to encourage chewing.\n\nSuitable for medium-sized breeds. Always consult your veterinarian for the best diet for your specific pet.",
    details: {
      weight: "3 kg",
      manufacturedDate: "January 2025",
      expiryDate: "December 2026",
      ingredients: "Dehydrated Poultry Protein, Rice, Maize, Animal Fats, Maize Gluten",
      nutritionalInfo: "Protein: 27% | Fat: 14% | Crude Fibre: 3.2% | Moisture: 10%",
      tags: ["Vet Recommended", "Grain-Inclusive", "Adult 12m+", "Chicken Flavor"],
    },
    productReviews: [
      {
        id: "r1",
        author: "Priya S.",
        rating: 5,
        comment: "My golden retriever absolutely loves this! His coat looks shinier after just 3 weeks.",
        date: "March 2025",
        verified: true,
      },
      {
        id: "r2",
        author: "Rahul M.",
        rating: 4,
        comment: "Good quality, very happy with the purchase. Slightly pricey but worth it for the quality.",
        date: "February 2025",
        verified: true,
      },
    ],
    expiryWarning: null, // null | "warning" | "expired"
  },
};

const RELATED: any[] = [
  { id: "2", name: "Pedigree Adult 10kg", brand: "Pedigree", price: 1199, rating: 4.5, reviews: 312, imageUrl: "https://images.unsplash.com/photo-1601758064954-cbb63b93b7e6?w=400&q=80", stockStatus: "in-stock" as StockStatus },
  { id: "4", name: "Drools Puppy Treats", brand: "Drools", price: 299, rating: 4.7, reviews: 98, imageUrl: "https://images.unsplash.com/photo-1601296248898-de5acc8b1bba?w=400&q=80", stockStatus: "low-stock" as StockStatus },
  { id: "5", name: "HappyPaws Senior Dog 5kg", brand: "HappyPaws", price: 2199, originalPrice: 2799, rating: 4.9, reviews: 67, imageUrl: "https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?w=400&q=80", stockStatus: "in-stock" as StockStatus, isNew: true },
];

// ─── Dynamic Metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = MOCK_PRODUCTS[params.id];
  if (!product) return { title: "Product Not Found | Happypets" };

  return {
    title: `${product.name} | Happypets`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [{ url: product.images[0] }],
    },
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = MOCK_PRODUCTS[params.id];
  if (!product) notFound();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: product.stockStatus === "out-of-stock"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Expiry Banner */}
      {product.expiryWarning === "warning" && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-2 text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">This product expires within 30 days. Please check the expiry date before purchasing.</p>
        </div>
      )}
      {product.expiryWarning === "expired" && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">This product has expired and cannot be added to cart.</p>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
            <span>/</span>
            <Link href={`/products?categories=${product.categorySlug}`} className="hover:text-foreground transition-colors">
              {product.category}
            </Link>
            <span>/</span>
            <Link href={`/products?brands=${product.brandSlug}`} className="hover:text-foreground transition-colors">
              {product.brand}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-8 space-y-16">
        {/* ── Main Product Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left – Images */}
          <div>
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right – Info */}
          <div className="space-y-5">
            {/* Brand + Shop */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/products?brands=${product.brandSlug}`}
                className="text-sm font-semibold text-primary uppercase tracking-widest hover:underline"
              >
                {product.brand}
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Badge variant="outline" className="text-xs">{product.shopName}</Badge>
              {product.isNew && <Badge className="text-xs">New</Badge>}
              {discount && (
                <Badge variant="destructive" className="text-xs font-bold">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <a href="#reviews" className="flex items-center gap-2 w-fit">
              <RatingStars rating={product.rating} count={product.reviews} size={18} />
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ({product.reviews} reviews)
              </span>
            </a>

            {/* Price */}
            <div className="py-4 border-y border-border">
              <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="lg" />
              {discount && (
                <p className="text-sm text-emerald-600 font-medium mt-1">
                  You save ₹{(product.originalPrice - product.price).toLocaleString("en-IN")} ({discount}%)
                </p>
              )}
            </div>

            {/* Add to cart section */}
            <AddToCartSection
              product={{
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                originalPrice: product.originalPrice,
                stockStatus: product.stockStatus,
                stockQuantity: product.stockQuantity,
                imageUrl: product.images[0],
                shopId: product.shopId,
              }}
            />
          </div>
        </div>

        {/* ── Product Tabs ── */}
        <div id="reviews">
          <ProductTabs
            description={product.description}
            details={product.details}
            reviews={product.productReviews}
            averageRating={product.rating}
          />
        </div>

        {/* ── Related Products ── */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
            You Might Also Like
          </h2>
          <ProductGrid
            products={RELATED}
            layout="grid"
            className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          />
        </section>
      </div>
    </>
  );
}
