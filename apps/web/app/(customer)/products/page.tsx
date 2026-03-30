import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { ProductGrid } from "@/components/shared/ProductGrid";
import { ProductListingShell } from "./_components/ProductListingShell";
import type { StockStatus } from "@/components/shared/StockBadge";

export const metadata: Metadata = {
  title: "All Products | Happypets",
  description:
    "Browse our full selection of premium, vet-approved pet food for dogs, cats, birds, and small pets. Filter by category, brand, price, and more.",
};

// Simulated server-side data fetch
async function getProducts(searchParams: Record<string, string | string[] | undefined>) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const ALL_PRODUCTS = [
    {
      id: "1",
      name: "Royal Canin Adult Dog Food – Chicken & Rice 3kg",
      brand: "Royal Canin",
      price: 1499,
      originalPrice: 1999,
      rating: 4.8,
      reviews: 243,
      imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&q=80",
      stockStatus: "in-stock" as StockStatus,
      isNew: false,
    },
    {
      id: "2",
      name: "Pedigree Adult Dry Dog Food – Meat & Rice 10kg",
      brand: "Pedigree",
      price: 1199,
      rating: 4.5,
      reviews: 312,
      imageUrl: "https://images.unsplash.com/photo-1601758064954-cbb63b93b7e6?w=500&q=80",
      stockStatus: "in-stock" as StockStatus,
      isNew: false,
    },
    {
      id: "3",
      name: "Whiskas Tuna Flavour Adult Cat Food 1.2kg",
      brand: "Whiskas",
      price: 499,
      originalPrice: 599,
      rating: 4.3,
      reviews: 189,
      imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80",
      stockStatus: "in-stock" as StockStatus,
      isNew: true,
    },
    {
      id: "4",
      name: "Drools Absolute Calcium Puppy Dog Treats",
      brand: "Drools",
      price: 299,
      rating: 4.7,
      reviews: 98,
      imageUrl: "https://images.unsplash.com/photo-1601296248898-de5acc8b1bba?w=500&q=80",
      stockStatus: "low-stock" as StockStatus,
      isNew: false,
    },
    {
      id: "5",
      name: "HappyPaws Senior Dog Kibble – Lamb & Veg 5kg",
      brand: "HappyPaws",
      price: 2199,
      originalPrice: 2799,
      rating: 4.9,
      reviews: 67,
      imageUrl: "https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?w=500&q=80",
      stockStatus: "in-stock" as StockStatus,
      isNew: true,
    },
    {
      id: "6",
      name: "Purepet Budgie Seed Mix 500g",
      brand: "Purepet",
      price: 149,
      rating: 4.1,
      reviews: 55,
      imageUrl: "https://images.unsplash.com/photo-1552728089-57105a8e7aa5?w=500&q=80",
      stockStatus: "in-stock" as StockStatus,
      isNew: false,
    },
    {
      id: "7",
      name: "Drools Focus Adult Cat Food – Ocean Fish 3kg",
      brand: "Drools",
      price: 749,
      originalPrice: 899,
      rating: 4.4,
      reviews: 134,
      imageUrl: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=500&q=80",
      stockStatus: "in-stock" as StockStatus,
      isNew: false,
    },
    {
      id: "8",
      name: "Royal Canin Kitten Dry Cat Food 2kg",
      brand: "Royal Canin",
      price: 899,
      rating: 4.6,
      reviews: 201,
      imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80",
      stockStatus: "out-of-stock" as StockStatus,
      isNew: false,
    },
  ];

  // Simple filter simulation
  const sp = typeof searchParams === "object" ? searchParams : {};
  let filtered = [...ALL_PRODUCTS];

  const brands = String(sp.brands ?? "").split(",").filter(Boolean);
  if (brands.length > 0) {
    filtered = filtered.filter((p) =>
      brands.some((b) => p.brand.toLowerCase().replace(/\s+/g, "-") === b)
    );
  }

  const saleOnly = sp.sale === "true";
  if (saleOnly) {
    filtered = filtered.filter((p) => p.originalPrice && p.originalPrice > p.price);
  }

  const minRating = sp.rating ? Number(sp.rating) : null;
  if (minRating) {
    filtered = filtered.filter((p) => (p.rating ?? 0) >= minRating);
  }

  const priceMax = sp.priceMax ? Number(sp.priceMax) : 5000;
  const priceMin = sp.priceMin ? Number(sp.priceMin) : 0;
  filtered = filtered.filter((p) => p.price >= priceMin && p.price <= priceMax);

  const sort = String(sp.sort ?? "relevance");
  if (sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  if (sort === "discount")
    filtered.sort(
      (a, b) =>
        (b.originalPrice ? b.originalPrice - b.price : 0) -
        (a.originalPrice ? a.originalPrice - a.price : 0)
    );

  return { products: filtered, total: filtered.length };
}

interface ProductsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { products, total } = await getProducts(searchParams);
  const view = (String(searchParams.view ?? "grid")) as "grid" | "list";

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">All Products</span>
          </nav>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="container px-4 py-8">
            <div className="flex gap-8">
              <div className="hidden md:block w-64 shrink-0">
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <ProductGrid products={[]} isLoading skeletonCount={8} />
              </div>
            </div>
          </div>
        }
      >
        <ProductListingShell totalCount={total}>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Search className="w-10 h-10 text-muted-foreground/50" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground">No Products Found</h3>
              <p className="text-muted-foreground max-w-sm">
                We couldn&apos;t find anything matching your filters. Try adjusting your search criteria.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-flex items-center px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors min-h-[44px]"
                aria-label="Clear all filters and view all products"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <ProductGrid
              products={products}
              layout={view}
              className={
                view === "grid"
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              }
            />
          )}
        </ProductListingShell>
      </Suspense>
    </>
  );
}
