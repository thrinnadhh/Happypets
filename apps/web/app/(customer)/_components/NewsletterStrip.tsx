"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

export function NewsletterStrip(): JSX.Element {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmail('');
      toast.success("You're successfully subscribed!", {
        description: "Get ready for exclusive deals and pet care tips.",
      });
    }, 1000);
  };

  return (
    <section className="py-20 bg-secondary relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-48 h-48 bg-accent rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
      
      <div className="container px-4 relative z-10">
        <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Join the Happypets Family
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Subscribe to our newsletter for 10% off your first order, plus weekly pet care tips and exclusive offers.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0 transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
