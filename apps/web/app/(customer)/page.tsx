import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HeroSection } from './_components/HeroSection';
import { CategoryStrip } from './_components/CategoryStrip';
import { RecommendedProducts } from './_components/RecommendedProducts';
import { BrandsShowcase } from './_components/BrandsShowcase';
import { WhyChooseUs } from './_components/WhyChooseUs';
import { NewsletterStrip } from './_components/NewsletterStrip';
import { ProductGrid } from '@/components/shared/ProductGrid';

export const metadata: Metadata = {
  title: 'Happypets | Premium Pet Nutrition in India',
  description: 'Shop organic, vet-approved pet food for dogs, cats, birds, and small pets. Fast delivery across India.',
  keywords: 'pet food, dog food, cat food, organic pet food, buy pet food online India, Happypets',
};

// JSON-LD structured data for the homepage
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Happypets',
  url: 'https://happypets.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://happypets.in/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function HomePage(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="flex flex-col min-h-screen">
        <HeroSection />
        
        <BrandsShowcase />
        
        <CategoryStrip />
        
        <Suspense fallback={
          <section className="py-20 bg-background container px-4">
            <div className="text-center mb-12 space-y-4">
              <div className="h-10 w-64 bg-muted animate-pulse mx-auto rounded-lg"></div>
              <div className="h-5 w-96 bg-muted animate-pulse mx-auto rounded-lg"></div>
            </div>
            <ProductGrid products={[]} isLoading={true} skeletonCount={5} layout="grid" className="md:grid-cols-5" />
          </section>
        }>
          <RecommendedProducts />
        </Suspense>

        <WhyChooseUs />
        
        <NewsletterStrip />
      </div>
    </>
  );
}
