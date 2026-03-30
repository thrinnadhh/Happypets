import { ProductGrid } from '@/components/shared/ProductGrid';
import type { StockStatus } from '@/components/shared/StockBadge';

// Mock DB fetch
async function getRecommendedProducts() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return [
    {
      id: '1',
      name: 'Premium Adult Dog Food - Chicken & Rice',
      brand: 'HappyPaws',
      price: 1499,
      originalPrice: 1999,
      rating: 4.8,
      reviews: 124,
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&q=80',
      stockStatus: 'in-stock' as StockStatus,
      isNew: true
    },
    {
      id: '2',
      name: 'Grain-Free Cat Kibble - Ocean Fish',
      brand: 'Purrfect',
      price: 899,
      rating: 4.5,
      reviews: 89,
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80',
      stockStatus: 'low-stock' as StockStatus
    },
    {
      id: '3',
      name: 'Organic Parakeet Seed Mix',
      brand: 'Feathers',
      price: 349,
      originalPrice: 450,
      rating: 4.2,
      reviews: 56,
      imageUrl: 'https://images.unsplash.com/photo-1552728089-57105a8e7aa5?w=500&q=80',
      stockStatus: 'in-stock' as StockStatus
    },
    {
      id: '4',
      name: 'Hamster Gourmet Pellets',
      brand: 'SmallPaws',
      price: 299,
      rating: 4.9,
      reviews: 210,
      imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd0999c?w=500&q=80',
      stockStatus: 'in-stock' as StockStatus
    },
    {
      id: '5',
      name: 'Puppy Starter Kit - Meat Medley',
      brand: 'HappyPaws',
      price: 2499,
      originalPrice: 2899,
      rating: 4.7,
      reviews: 34,
      imageUrl: 'https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?w=500&q=80',
      stockStatus: 'out-of-stock' as StockStatus
    }
  ];
}

export async function RecommendedProducts(): Promise<JSX.Element> {
  const products = await getRecommendedProducts();

  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">Recommended for Your Pets</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hand-picked nutrition tailored to your furry (or feathery) friend&apos;s specific needs.
          </p>
        </div>
        
        <ProductGrid products={products} layout="grid" className="md:grid-cols-5" />
      </div>
    </section>
  );
}
