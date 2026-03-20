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
import { ChevronLeft, Shield, Sparkles, Truck, ChevronDown, ShoppingBag } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const AU_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
];

const FREE_SHIPPING_THRESHOLD = 5000; // A$50.00 in cents

type FormErrors = {
  email?: string;
  fullName?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { mutate: createCheckoutSession } = trpc.checkout.createSession.useMutation();
  const { mutate: createGuestSession } = trpc.checkout.createGuestSession.useMutation();

  const totalPrice = getTotalPrice();
  const totalPriceInDollars = (totalPrice / 100).toFixed(2);
  const hasFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return undefined;
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;
      case 'street':
        if (!value.trim()) return 'Street address is required';
        return undefined;
      case 'city':
        if (!value.trim()) return 'City is required';
        return undefined;
      case 'state':
        if (!value) return 'Please select a state';
        return undefined;
      case 'postalCode':
        if (!value) return 'Postal code is required';
        if (!/^\d{4}$/.test(value)) return 'Australian postcodes must be 4 digits';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    newErrors.email = validateField('email', email);
    newErrors.fullName = validateField('fullName', fullName);
    newErrors.street = validateField('street', street);
    newErrors.city = validateField('city', city);
    newErrors.state = validateField('state', state);
    newErrors.postalCode = validateField('postalCode', postalCode);

    setErrors(newErrors);
    setTouched({ email: true, fullName: true, street: true, city: true, state: true, postalCode: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) return;

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
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

  const InlineError = ({ field }: { field: keyof FormErrors }) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-red-500 font-light mt-1"
      >
        {errors[field]}
      </motion.p>
    );
  };

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

                <form onSubmit={handleSubmit} className="space-y-10" noValidate>
                  {/* Contact */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (touched.email) {
                              setErrors(prev => ({ ...prev, email: validateField('email', e.target.value) }));
                            }
                          }}
                          onBlur={() => handleBlur('email', email)}
                          disabled={isAuthenticated}
                          className={`input-elegant disabled:opacity-60 disabled:cursor-not-allowed ${touched.email && errors.email ? 'border-red-400 focus:border-red-400' : ''}`}
                        />
                        <InlineError field="email" />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (touched.fullName) {
                              setErrors(prev => ({ ...prev, fullName: validateField('fullName', e.target.value) }));
                            }
                          }}
                          onBlur={() => handleBlur('fullName', fullName)}
                          className={`input-elegant ${touched.fullName && errors.fullName ? 'border-red-400 focus:border-red-400' : ''}`}
                        />
                        <InlineError field="fullName" />
                      </div>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                      Shipping Address
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={street}
                          onChange={(e) => {
                            setStreet(e.target.value);
                            if (touched.street) {
                              setErrors(prev => ({ ...prev, street: validateField('street', e.target.value) }));
                            }
                          }}
                          onBlur={() => handleBlur('street', street)}
                          className={`input-elegant ${touched.street && errors.street ? 'border-red-400 focus:border-red-400' : ''}`}
                        />
                        <InlineError field="street" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            placeholder="City / Suburb"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              if (touched.city) {
                                setErrors(prev => ({ ...prev, city: validateField('city', e.target.value) }));
                              }
                            }}
                            onBlur={() => handleBlur('city', city)}
                            className={`input-elegant ${touched.city && errors.city ? 'border-red-400 focus:border-red-400' : ''}`}
                          />
                          <InlineError field="city" />
                        </div>
                        <div className="relative">
                          <select
                            value={state}
                            onChange={(e) => {
                              setState(e.target.value);
                              if (touched.state) {
                                setErrors(prev => ({ ...prev, state: validateField('state', e.target.value) }));
                              }
                            }}
                            onBlur={() => handleBlur('state', state)}
                            className={`input-elegant appearance-none cursor-pointer ${!state ? 'text-muted-foreground/50' : ''} ${touched.state && errors.state ? 'border-red-400 focus:border-red-400' : ''}`}
                          >
                            <option value="" disabled>State / Territory</option>
                            {AU_STATES.map((s) => (
                              <option key={s.value} value={s.value}>{s.value} - {s.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
                          <InlineError field="state" />
                        </div>
                      </div>
                      <div className="max-w-[200px]">
                        <input
                          type="text"
                          placeholder="Postcode"
                          value={postalCode}
                          onChange={(e) => {
                            // Only allow digits, max 4
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setPostalCode(val);
                            if (touched.postalCode) {
                              setErrors(prev => ({ ...prev, postalCode: validateField('postalCode', val) }));
                            }
                          }}
                          onBlur={() => handleBlur('postalCode', postalCode)}
                          maxLength={4}
                          inputMode="numeric"
                          className={`input-elegant ${touched.postalCode && errors.postalCode ? 'border-red-400 focus:border-red-400' : ''}`}
                        />
                        <InlineError field="postalCode" />
                      </div>
                    </div>
                  </div>

                  {/* Shipping estimate */}
                  <div className="flex items-start gap-3 p-4 bg-cream/50 border border-border/30" style={{ borderRadius: '2px' }}>
                    <Truck size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-light text-foreground">
                        {hasFreeShipping ? 'Free Standard Shipping' : 'Standard Shipping'}
                      </p>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed">
                        Estimated delivery: 3-7 business days within Australia.
                        {!hasFreeShipping && (
                          <> Spend A${((FREE_SHIPPING_THRESHOLD - totalPrice) / 100).toFixed(2)} more for free shipping.</>
                        )}
                      </p>
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
                    {isProcessing && <Spinner size={16} />}
                    {isProcessing ? 'Processing...' : `Pay A$${totalPriceInDollars}`}
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
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-14 h-14 object-cover flex-shrink-0"
                            style={{ borderRadius: '2px' }}
                          />
                        ) : (
                          <div className="w-14 h-14 bg-cream flex-shrink-0 flex items-center justify-center" style={{ borderRadius: '2px' }}>
                            <ShoppingBag size={16} className="text-muted-foreground/20" />
                          </div>
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
                      <span className={hasFreeShipping ? 'text-emerald-600' : 'text-sage'}>
                        {hasFreeShipping ? 'Free' : 'Calculated at payment'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border/30">
                      <span className="text-sm font-light text-muted-foreground uppercase tracking-[0.1em]">Total</span>
                      <span className="text-xl font-serif font-light text-accent">A${totalPriceInDollars}</span>
                    </div>
                  </div>

                  {/* Free shipping badge */}
                  {hasFreeShipping && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700" style={{ borderRadius: '2px' }}>
                      <Truck size={14} className="flex-shrink-0" />
                      <p className="text-[11px] font-light">Free shipping included!</p>
                    </div>
                  )}
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
