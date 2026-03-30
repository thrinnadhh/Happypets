import { ShieldCheck, Leaf, HeartHandshake } from 'lucide-react';

export function WhyChooseUs(): JSX.Element {
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">Why Choose Happypets?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We are committed to providing the best nutrition and care for your pets, backed by science and love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20 group-hover:bg-secondary transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-2">
              <Leaf className="w-10 h-10 text-secondary group-hover:text-secondary-foreground transition-colors" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-foreground">100% Organic Ingredients</h3>
            <p className="text-muted-foreground leading-relaxed">
              We source only the finest, chemical-free ingredients to ensure your pet gets purely natural nutrition.
            </p>
          </div>
          
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-2">
              <ShieldCheck className="w-10 h-10 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-foreground">Vet Approved Formulas</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every product is rigorously tested and approved by leading veterinary nutritionists across India.
            </p>
          </div>

          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 border border-accent/30 group-hover:bg-accent transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-2">
              <HeartHandshake className="w-10 h-10 text-accent-foreground group-hover:text-foreground transition-colors" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-foreground">Delivered With Care</h3>
            <p className="text-muted-foreground leading-relaxed">
              From our warehouse to your doorstep, we handle your pet's food with the utmost care and hygiene.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
