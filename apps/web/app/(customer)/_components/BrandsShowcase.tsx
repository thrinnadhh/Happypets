const BRANDS = [
  { name: 'Royal Canin' },
  { name: 'Pedigree' },
  { name: 'Drools' },
  { name: 'Whiskas' },
  { name: 'Orijen' },
  { name: 'Acana' },
];

export function BrandsShowcase(): JSX.Element {
  return (
    <section className="py-12 bg-muted/40 border-y border-border">
      <div className="container px-4">
        <h2 className="text-sm font-heading font-bold text-center mb-8 text-foreground/50 uppercase tracking-[0.2em]">
          Trusted Partner Brands
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
          {BRANDS.map((brand, i) => (
            <div key={i} className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer">
              <span className="text-2xl font-bold font-heading text-foreground/40 hover:text-primary transition-colors">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
