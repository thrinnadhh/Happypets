import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader } from "@/components/common/Loader";
import { PageTransition } from "@/components/common/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/products/ProductCard";
import { useCatalog } from "@/contexts/CatalogContext";
import {
  categoryCopy,
  displaySectionLabels,
  getCategoryPath,
  productCategories,
  sortProductsByPosition,
} from "@/data/catalog";
import { Product, ProductCategory } from "@/types";

function CategoryRail({
  category,
  products,
}: {
  category: ProductCategory;
  products: Product[];
}): JSX.Element {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      className="rounded-[34px] border border-white/60 bg-white/74 p-6 shadow-card backdrop-blur-sm md:p-8"
    >
      <div className="flex flex-col gap-4 border-b border-[#eee2cf] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-4xl font-semibold text-ink">{displaySectionLabels[category]}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{categoryCopy[category]}</p>
        </div>
        <Link to={getCategoryPath(category)} className="soft-button">
          View all {category.toLowerCase()}
        </Link>
      </div>

      {products.length ? (
        <div className="mt-6 flex snap-x gap-5 overflow-x-auto pb-2">
          {products.map((product) => (
            <div key={product.id} className="min-w-[280px] max-w-[280px] snap-start sm:min-w-[300px] sm:max-w-[300px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[28px] border border-dashed border-[#e8dcc9] bg-[#fbf7ef] px-6 py-10 text-center text-sm text-slate-500">
          Admins have not arranged this homepage rail yet.
        </div>
      )}
    </motion.section>
  );
}

export function CustomerHomePage(): JSX.Element {
  const { products, loading } = useCatalog();

  const sectionedProducts = useMemo(() => {
    const grouped = {
      Dog: [] as Product[],
      Cat: [] as Product[],
      Fish: [] as Product[],
      Hamster: [] as Product[],
      Rabbit: [] as Product[],
      Birds: [] as Product[],
    };

    products.forEach((product) => {
      if (product.displaySection !== "Home") {
        grouped[product.displaySection].push(product);
      }
    });

    return Object.fromEntries(
      Object.entries(grouped).map(([section, items]) => [section, sortProductsByPosition(items)]),
    ) as Record<ProductCategory, Product[]>;
  }, [products]);

  const topProducts = useMemo(() => {
    const recommended = sortProductsByPosition(
      products.filter((product) => product.tags?.includes("recommended")),
    );

    return recommended.length ? recommended.slice(0, 5) : sortProductsByPosition(products).slice(0, 5);
  }, [products]);

  const featuredProduct = topProducts[0];
  const supportingProducts = topProducts.slice(1);
  const categoryCount = productCategories.length;

  return (
    <PageTransition className="min-h-screen bg-soft-grid">
      <Navbar />
      <main className="mx-auto flex max-w-[1500px] flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
        <section className="grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[34px] bg-[#17324a] p-7 text-white shadow-[0_28px_60px_rgba(23,50,74,0.28)] md:p-9"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.28),transparent_34%),linear-gradient(155deg,rgba(255,255,255,0.05),transparent_46%)]" />
            <div className="relative">
              <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#f4df9d]">
                Premium pet e-commerce
              </span>
              <h1 className="mt-5 max-w-2xl font-heading text-5xl font-semibold tracking-[-0.04em] md:text-6xl">
                Browse by category, save favorites, and shop the tags your admins promote first.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/78">
                The homepage now acts like a clean, Amazon-inspired storefront: top products rise from recommended tags, every category rail is merchandised independently, and the new sidebar gets shoppers into category pages in one tap.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ["Top products", `${topProducts.length}`],
                  ["Live categories", `${categoryCount}`],
                  ["Recommended tags", `${products.filter((product) => product.tags?.includes("recommended")).length}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[24px] border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/62">{label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {productCategories.map((category) => (
                  <Link
                    key={category}
                    to={getCategoryPath(category)}
                    className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-medium text-white/88 transition hover:bg-white/16"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[34px] border border-white/60 bg-white/78 p-5 shadow-card backdrop-blur-sm md:p-6"
          >
            <div className="flex flex-col gap-2 border-b border-[#efe2cf] pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-4xl font-semibold text-ink">Top products</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                  Cleanly surfaced from your recommended tags and sorted by homepage position.
                </p>
              </div>
              <Link to="/favorites" className="soft-button">
                View favorites
              </Link>
            </div>

            {loading ? (
              <div className="py-10">
                <Loader label="Loading storefront..." />
              </div>
            ) : featuredProduct ? (
              <div className="mt-6 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                <Link to={`/product/${featuredProduct.id}`} className="group relative overflow-hidden rounded-[30px] bg-[#f8f2e7]">
                  <img
                    src={featuredProduct.image}
                    alt={featuredProduct.name}
                    className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-[420px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#13283a]/88 via-[#13283a]/24 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#f4df9d]">{featuredProduct.brand}</p>
                    <h3 className="mt-3 font-heading text-4xl font-semibold">{featuredProduct.name}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-7 text-white/76">{featuredProduct.description}</p>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#17324a]">
                        View product
                      </span>
                      <span className="text-sm font-medium text-white/76">
                        ${(
                          featuredProduct.discount
                            ? featuredProduct.price - (featuredProduct.price * featuredProduct.discount) / 100
                            : featuredProduct.price
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  {supportingProducts.map((product) => (
                    <div key={product.id} className="min-h-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[28px] border border-dashed border-[#eadcc8] bg-[#fbf7ef] px-6 py-12 text-center text-sm text-slate-500">
                Add products to the catalog and mark some as recommended to fill the top-products surface.
              </div>
            )}
          </motion.section>
        </section>

        {productCategories.map((category) => (
          <CategoryRail key={category} category={category} products={sectionedProducts[category]} />
        ))}
      </main>
    </PageTransition>
  );
}
