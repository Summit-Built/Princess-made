import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sparkles, ArrowRight, Search, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  const [, setLocation] = useLocation();

  const popularLinks = [
    { href: '/shop', label: 'Shop All Products', icon: ShoppingBag },
    { href: '/shop?category=Laptop%20Cases', label: 'Laptop Cases', icon: Sparkles },
    { href: '/shop?category=Pouches', label: 'Pouches', icon: Sparkles },
    { href: '/about', label: 'Our Story', icon: Sparkles },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <section className="flex-1 flex items-center relative py-20 md:py-32">
          <div className="absolute inset-0 gradient-rose-subtle" />
          <div className="absolute inset-0 texture-linen opacity-30" />

          <div className="container relative max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Large decorative 404 */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <p className="font-script text-7xl md:text-9xl text-accent/20 leading-none select-none" aria-hidden="true">
                  404
                </p>
              </motion.div>

              {/* Heading */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 max-w-xs mx-auto">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/20" />
                  <Sparkles size={16} className="text-accent/50" aria-hidden="true" />
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/20" />
                </div>

                <h1 className="text-3xl md:text-4xl font-serif font-light">
                  This page wandered off
                </h1>

                <p className="text-muted-foreground font-light max-w-md mx-auto leading-relaxed">
                  Looks like this page doesn't exist. It may have been moved or the link might be outdated.
                  Let's get you back on track.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLocation('/')}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-light tracking-[0.15em] uppercase text-sm hover:bg-accent/90 transition-all min-h-[44px]"
                  style={{ borderRadius: '2px' }}
                >
                  <Home size={16} />
                  Go Home
                </motion.button>
                <Link href="/shop">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-accent/30 text-foreground font-light tracking-[0.15em] uppercase text-sm hover:border-accent/60 transition-all cursor-pointer min-h-[44px]"
                    style={{ borderRadius: '2px' }}
                  >
                    <Search size={16} />
                    Browse Shop
                  </motion.div>
                </Link>
              </div>

              {/* Popular links */}
              <div className="pt-8 space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/50 font-light">
                  Popular pages
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {popularLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="flex items-center gap-2 p-3 bg-card border border-border/40 hover:border-accent/30 text-sm text-foreground/70 hover:text-accent font-light transition-all cursor-pointer min-h-[44px]"
                        style={{ borderRadius: '2px' }}
                      >
                        <link.icon size={14} className="text-accent/50 flex-shrink-0" />
                        <span className="truncate">{link.label}</span>
                        <ArrowRight size={12} className="ml-auto text-muted-foreground/30 flex-shrink-0" />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
