import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { usePageMeta } from '@/lib/usePageMeta';
import { ChevronLeft, Loader2, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  usePageMeta({ title: 'Checkout', description: 'Complete your Princess Made order.' });
  const [, navigate] = useLocation();
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const { isAuthenticated, user } = useAuth();
  const cartItems = useCartStore((state) => state.getTotalItems());

  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutate: createCheckoutSession } = trpc.checkout.createSession.useMutation();
  const { mutate: createGuestSession } = trpc.checkout.createGuestSession.useMutation();

  const totalPrice = getTotalPrice();
  const totalPriceInDollars = (totalPrice / 100).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) return;

    if (!email || !fullName) {
      toast.error('Please fill in your email and name');
      return;
    }

    setIsProcessing(true);

    const itemsPayload = items.map(item => ({
      stripePriceId: item.stripePriceId || '',
      stripeProductId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
    }));

    const callbacks = {
      onSuccess: (data: { url: string; sessionId: string }) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: (error: any) => {
        console.error('Checkout error:', error.message);
        toast.error('Checkout failed. Please try again.');
        setIsProcessing(false);
      },
    };

    try {
      if (isAuthenticated) {
        // Authenticated checkout
        createCheckoutSession(
          {
            items: itemsPayload,
            shippingAddress: street ? {
              street,
              city,
              state,
              postalCode,
              country: 'AU',
            } : undefined,
          },
          callbacks,
        );
      } else {
        // Guest checkout
        createGuestSession(
          {
            items: itemsPayload,
            email,
            name: fullName,
            shippingAddress: {
              street,
              city,
              state,
              postalCode,
              country: 'AU',
            },
          },
          callbacks,
        );
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header cartCount={cartItems} isAuthenticated={isAuthenticated} />
          <div className="container py-24 text-center space-y-6">
            <h1 className="text-3xl font-serif font-light">Your Cart is Empty</h1>
            <p className="text-muted-foreground font-light">
              Add some handmade treasures before checking out.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => window.location.href = '/shop'}
              className="btn-primary inline-flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Browse Collection
            </motion.button>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header cartCount={cartItems} isAuthenticated={isAuthenticated} />

        <section className="py-12 md:py-20">
          <div className="container">
            {/* Back */}
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => window.location.href = '/shop'}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 font-light"
            >
              <ChevronLeft size={16} />
              Back to Shopping
            </motion.button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
              >
                <h1 className="text-3xl md:text-4xl font-serif font-light mb-10">
                  Checkout
                </h1>

                {!isAuthenticated && (
                  <div className="flex items-center gap-3 p-4 bg-cream/50 border border-border/30 mb-8" style={{ borderRadius: '2px' }}>
                    <Sparkles size={16} className="text-accent flex-shrink-0" />
                    <p className="text-xs text-muted-foreground font-light">
                      Already have an account?{' '}
                      <a href="/login" className="text-accent hover:text-accent/80 underline">Sign in</a>{' '}
                      for faster checkout and order tracking.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Contact */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isAuthenticated}
                        className="input-elegant disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="input-elegant"
                      />
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                      Shipping Address
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                        className="input-elegant"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          className="input-elegant"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                          className="input-elegant"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                        className="input-elegant"
                      />
                    </div>
                  </div>

                  {/* Stripe notice */}
                  <div className="flex items-start gap-3 p-4 bg-cream border border-border/30" style={{ borderRadius: '2px' }}>
                    <Shield size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      Payment is processed securely through Stripe. Your card information is never stored on our servers.
                    </p>
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isProcessing}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing && <Loader2 size={16} className="animate-spin" />}
                    {isProcessing ? 'Processing...' : 'Complete Purchase'}
                  </motion.button>
                </form>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-28 border border-border/30 bg-card p-6 space-y-6" style={{ borderRadius: '2px' }}>
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                    Order Summary
                  </h3>

                  {/* Items */}
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-14 h-14 object-cover flex-shrink-0"
                            style={{ borderRadius: '2px' }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-light truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground/60 font-light">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-light text-accent whitespace-nowrap">
                          A${((item.price * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t border-border/30 pt-4">
                    <div className="flex justify-between text-sm font-light">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>A${totalPriceInDollars}</span>
                    </div>
                    <div className="flex justify-between text-sm font-light">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-sage">Free</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border/30">
                      <span className="text-sm font-light text-muted-foreground uppercase tracking-[0.1em]">Total</span>
                      <span className="text-xl font-serif font-light text-accent">A${totalPriceInDollars}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
