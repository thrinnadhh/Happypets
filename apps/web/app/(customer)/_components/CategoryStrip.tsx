import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const CATEGORIES = [
  { name: 'Dog Food', emoji: '🐶', count: 124, color: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', href: '/category/dog' },
  { name: 'Cat Food', emoji: '🐱', count: 98, color: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', href: '/category/cat' },
  { name: 'Bird Food', emoji: '🦜', count: 45, color: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', href: '/category/bird' },
  { name: 'Small Pets', emoji: '🐹', count: 32, color: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', href: '/category/small-pets' },
];

export function CategoryStrip(): JSX.Element {
  return (
    <section className="py-16 bg-background">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-heading font-bold text-foreground">Shop by Category</h2>
          <Link href="/categories" className="text-primary font-medium hover:underline focus-visible:underline outline-none">
            View All &rarr;
          </Link>
        </div>
        
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0 md:px-0 md:mx-0 gap-6 snap-x snap-mandatory no-scrollbar">
          {CATEGORIES.map((cat, i) => (
            <Link key={i} href={cat.href} className="snap-center shrink-0 w-[240px] md:w-auto group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
              <Card className="h-full border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-card hover:-translate-y-1">
                <CardContent className="p-0 flex flex-col items-center justify-center">
                  <div className={`w-full aspect-[4/3] flex items-center justify-center ${cat.color} transition-colors duration-300 group-hover:bg-opacity-80`}>
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">
                      {cat.emoji}
                    </span>
                  </div>
                  <div className="p-6 text-center w-full bg-background group-hover:bg-muted/30 transition-colors">
                    <h3 className="text-xl font-heading font-bold mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className={`text-sm font-medium ${cat.text}`}>{cat.count} Products</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
