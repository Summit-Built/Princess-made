import React from 'react';
import { motion } from 'framer-motion';
import { Link, useSearch } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Check, Package, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

export default function OrderConfirmation() {
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();
  const clearCart = useCartStore((state) => state.clearCart);

  const searchString = useSearch();
  const sessionId = new URLSearchParams(searchString).get('session_id');

  // Try to find the order by session ID
  const { data: orders } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const order = orders?.find((o: any) => o.stripeSessionId === sessionId);

  React.useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header
          cartCount={cartItems}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => (window.location.href = '/login')}
          onLogoutClick={logout}
        />

        <section className="py-24 md:py-32">
          <div className="container max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-10"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center border border-sage/20">
                  <Check size={36} className="text-sage" />
                </div>
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <p className="font-script text-2xl text-accent">Thank You!</p>
                <h1 className="text-4xl md:text-5xl font-serif font-light">
                  Order Confirmed
                </h1>
                <p className="text-muted-foreground font-light">
                  Your handmade treasures are on their way
                </p>
              </motion.div>

              {/* Order Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-cream/50 border border-border/30 p-8 space-y-5 text-left"
                style={{ borderRadius: '2px' }}
              >
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                    Order Number
                  </p>
                  <p className="font-serif font-light">
                    {order ? `#PM-${String(order.id).padStart(5, '0')}` : (
                      <span className="inline-flex items-center gap-2 text-muted-foreground/60">
                        <Loader2 size={14} className="animate-spin" /> Loading...
                      </span>
                    )}
                  </p>
                </div>

                {order && (
                  <div className="border-t border-border/20 pt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/60 font-light">Total</span>
                    <span className="text-lg font-serif font-light text-accent">
                      A${(order.totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t border-border/20 pt-4 flex items-start gap-3">
                  <Package size={18} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-light text-muted-foreground leading-relaxed">
                    We're preparing your order with care. You'll receive a tracking number via email shortly.
                  </p>
                </div>

                <div className="border-t border-border/20 pt-4 space-y-2">
                  <p className="text-xs text-muted-foreground/60 font-light">
                    A confirmation email has been sent with:
                  </p>
                  <ul className="text-xs font-light space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Sparkles size={10} className="text-accent" /> Order details
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles size={10} className="text-accent" /> Shipping information
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles size={10} className="text-accent" /> Estimated delivery
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* What's Next */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="grid grid-cols-3 gap-6 text-center">
                  {[
                    { num: '1', title: 'Confirmed', desc: 'Check your email' },
                    { num: '2', title: 'Crafting', desc: 'We prepare your order' },
                    { num: '3', title: 'Delivered', desc: 'To your doorstep' },
                  ].map((step) => (
                    <div key={step.num} className="space-y-2">
                      <div className="w-8 h-8 mx-auto bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-light">
                        {step.num}
                      </div>
                      <p className="font-serif font-light text-sm">{step.title}</p>
                      <p className="text-[11px] text-muted-foreground/60 font-light">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              >
                <Link href="/dashboard">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    className="btn-primary inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    View My Orders
                    <ArrowRight size={16} />
                  </motion.a>
                </Link>
                <Link href="/shop">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    className="btn-outline inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Continue Shopping
                  </motion.a>
                </Link>
              </motion.div>

              {/* Help */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="pt-8 border-t border-border/30"
              >
                <p className="text-xs text-muted-foreground/50 font-light">
                  Questions?{' '}
                  <Link href="/contact">
                    <a className="text-accent hover:text-accent/80 transition-colors">
                      Contact us
                    </a>
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
