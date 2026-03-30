import { Button } from '@/components/ui/button';
import { ShieldCheck, Truck, RotateCcw, Stethoscope } from 'lucide-react';

export function HeroSection(): JSX.Element {
  return (
    <section className="relative w-full min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-secondary/90 to-primary/80">
      {/* Abstract Background pattern / Silhouette */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full"> 
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative z-10 px-4 py-20 text-center md:text-left flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary-foreground text-sm font-medium mb-4 shadow-sm">
            New & Improved Formulas
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight">
            Premium Pet Nutrition,<br />
            <span className="text-accent">Delivered Fresh</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-200 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Trusted by pet parents across India. Give your furry friends the balanced, organic diet they deserve, packed with flavor.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 px-8 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              Shop Now
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 text-lg py-6 px-8 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
              Explore Categories
            </Button>
          </div>
        </div>

        <div className="flex-1 hidden md:block relative animate-in fade-in duration-1000 delay-300">
           {/* Pet illustration or floating emojis */}
           <div className="relative w-full aspect-square max-w-lg mx-auto">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 rounded-full blur-3xl"></div>
             
             {/* Floating elements */}
             <div className="absolute top-10 right-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🐕</div>
             <div className="absolute bottom-20 left-10 text-6xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🐈</div>
             <div className="absolute top-1/3 left-1/4 text-5xl animate-pulse">🦴</div>
             <div className="absolute bottom-1/3 right-1/4 text-4xl animate-pulse">🐟</div>
             
             {/* Central big representation */}
             <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-[12rem] filter drop-shadow-2xl grayscale opacity-90 transition-all duration-700 hover:grayscale-0 hover:scale-110 cursor-default">🐾</span>
             </div>
           </div>
        </div>
      </div>

      {/* Trust Badges bottom row */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10">
        <div className="container px-4 py-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between gap-6 min-w-max text-white/90 text-sm font-medium">
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-accent" /> 100% Authentic</div>
            <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-accent" /> Fast Delivery</div>
            <div className="flex items-center gap-2"><RotateCcw className="w-5 h-5 text-accent" /> Easy Returns</div>
            <div className="flex items-center gap-2"><Stethoscope className="w-5 h-5 text-accent" /> Vet Approved</div>
          </div>
        </div>
      </div>
    </section>
  );
}
