import { DisplaySection, Product, ProductCategory, ProductTag } from "@/types";

export const productCategories: ProductCategory[] = [
  "Dog",
  "Cat",
  "Fish",
  "Hamster",
  "Rabbit",
  "Birds",
];

export const categoryLifeStages: Partial<Record<ProductCategory, string[]>> = {
  Dog: ["Adult", "Puppy"],
  Cat: ["Adult", "Kitten"],
};

export const displaySections: DisplaySection[] = ["Home", ...productCategories];

export const displaySectionLabels: Record<DisplaySection, string> = {
  Home: "Home",
  Dog: "Dog Products",
  Cat: "Cat Products",
  Fish: "Fish Products",
  Hamster: "Hamster Products",
  Rabbit: "Rabbit Products",
  Birds: "Bird Products",
};

export const productTags: ProductTag[] = ["recommended", "trending", "popular"];

export const productTagLabels: Record<ProductTag, string> = {
  recommended: "Recommended",
  trending: "Trending",
  popular: "Popular",
};

export const productTagStyles: Record<ProductTag, string> = {
  recommended: "border-[#e9c86e] bg-[#fff4cf] text-[#8a6512]",
  trending: "border-[#cbd9e8] bg-[#eef4fb] text-[#2f4f6f]",
  popular: "border-[#e7d2b8] bg-[#f8efe4] text-[#7a5a31]",
};

export const categorySlugs: Record<ProductCategory, string> = {
  Dog: "dog",
  Cat: "cat",
  Fish: "fish",
  Hamster: "hamster",
  Rabbit: "rabbit",
  Birds: "birds",
};

export const categoryCopy: Record<ProductCategory, string> = {
  Dog: "High-protein meals, joint support, and everyday essentials for energetic companions.",
  Cat: "Indoor nutrition, coat care, and premium formulas for selective feline routines.",
  Fish: "Balanced feed, clean-water support, and aquarium staples that keep tanks healthy.",
  Hamster: "Compact nutrition, bedding-friendly treats, and soft care for curious little pets.",
  Rabbit: "Gentle digestion blends, hay-friendly nutrition, and calm daily feeding support.",
  Birds: "Seed blends, plumage support, and light daily nutrition for vibrant aviary care.",
};

export const DEFAULT_PRODUCT_POSITION = 999;

export function getDefaultDisplaySection(category: ProductCategory): DisplaySection {
  return category;
}

export function getCategoryPath(category: ProductCategory): string {
  return `/category/${categorySlugs[category]}`;
}

export function getCategoryFromSlug(slug?: string): ProductCategory | null {
  const entry = Object.entries(categorySlugs).find(([, value]) => value === slug?.toLowerCase());
  return (entry?.[0] as ProductCategory | undefined) ?? null;
}

export function sortTags(tags: ProductTag[] = []): ProductTag[] {
  return [...tags].sort((left, right) => productTags.indexOf(left) - productTags.indexOf(right));
}

export function normalizeLifeStage(
  category: ProductCategory,
  value?: string,
  fallbackSource = "",
): string {
  const trimmedValue = value?.trim() ?? "";
  const normalizedValue = trimmedValue.toLowerCase();
  const haystack = `${trimmedValue} ${fallbackSource}`.toLowerCase();
  const allowedStages = categoryLifeStages[category] ?? [];

  const exactMatch = allowedStages.find((stage) => stage.toLowerCase() === normalizedValue);
  if (exactMatch) {
    return exactMatch;
  }

  if (category === "Dog") {
    if (haystack.includes("puppy")) {
      return "Puppy";
    }
    if (haystack.includes("adult")) {
      return "Adult";
    }
  }

  if (category === "Cat") {
    if (haystack.includes("kitten")) {
      return "Kitten";
    }
    if (haystack.includes("adult")) {
      return "Adult";
    }
  }

  return trimmedValue;
}

export function sortProductsByPosition(products: Product[]): Product[] {
  return [...products].sort((left, right) => {
    if (left.position !== right.position) {
      return left.position - right.position;
    }

    return left.name.localeCompare(right.name);
  });
}
