import React from 'react';
import { motion } from 'framer-motion';
import { Link, useSearch } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { usePageMeta } from '@/lib/usePageMeta';
import { Check, Package, ArrowRight, Sparkles, Loader2, MapPin } from 'lucide-react';

function OrderItemDisplay({ item }: { item: { productId: string; quantity: number; priceAtTime: number } }) {
  const { data: product } = trpc.products.getById.useQuery(item.productId, {
    enabled: !!item.productId,
  });

  return (
    <div className="flex items-center gap-3 py-3">
      {product?.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product?.name || 'Product'}
          className="w-14 h-14 object-cover flex-shrink-0"
          style={{ borderRadius: '2px' }}
        />
      ) : (
        <div className="w-14 h-14 bg-cream flex-shrink-0 flex items-center justify-center" style={{ borderRadius: '2px' }}>
          <Package size={16} className="text-muted-foreground/20" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-light truncate">{product?.name || 'Loading...'}</p>
        <p className="text-xs text-muted-foreground/60 font-light">Qty: {item.quantity}</p>
      </div>
      <p className="text-sm font-light text-accent whitespace-nowrap">
        A${((item.priceAtTime * item.quantity) / 100).toFixed(2)}
      </p>
    </div>
  );
}

export default function OrderConfirmation() {
  usePageMeta({ title: 'Order Confirmed', description: 'Your Princess Made order has been confirmed.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();
  const clearCart = useCartStore((state) => state.clearCart);

  const searchString = useSearch();
  const sessionId = new URLSearchParams(searchString).get('session_id');

  const { data: order } = trpc.orders.getBySessionId.useQuery(sessionId || '', {
    enabled: !!sessionId,
  });

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
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200">
                  <Check size={36} className="text-emerald-600" />
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
                  Your handmade treasures are being prepared with care
                </p>
              </motion.div>

              {/* Order Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card border border-border/30 overflow-hidden text-left"
                style={{ borderRadius: '2px' }}
              >
                {/* Order header */}
                <div className="p-6 bg-cream/30 border-b border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                        Order Number
                      </p>
                      <p className="font-serif font-light text-lg">
                        {order ? order.orderNumber : (
                          <span className="inline-flex items-center gap-2 text-muted-foreground/60 text-sm">
                            <Loader2 size={14} className="animate-spin" /> Loading...
                          </span>
                        )}
                      </p>
                    </div>
                    {order && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                          Total
                        </p>
                        <p className="text-xl font-serif font-light text-accent">
                          A${(order.totalAmount / 100).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order items */}
                {order && order.items && order.items.length > 0 && (
                  <div className="px-6 py-4 border-b border-border/20">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light mb-2">
                      Items Ordered
                    </p>
                    <div className="divide-y divide-border/10">
                      {order.items.map((item: any) => (
                        <OrderItemDisplay key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping address */}
                {order?.shippingAddress && (
                  <div className="px-6 py-4 border-b border-border/20">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light mb-1">
                          Shipping To
                        </p>
                        <p className="text-sm font-light">
                          {order.shippingAddress.street}
                        </p>
                        <p className="text-sm font-light text-muted-foreground">
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* What happens next */}
                <div className="px-6 py-4 border-b border-border/20">
                  <div className="flex items-start gap-3">
                    <Package size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">
                      We're preparing your order with care. You'll receive a tracking number via email once shipped.
                      Estimated delivery: 3-7 business days.
                    </p>
                  </div>
                </div>

                {/* Confirmation email info */}
                <div className="px-6 py-4">
                  <p className="text-xs text-muted-foreground/60 font-light mb-2">
                    A confirmation email has been sent with:
                  </p>
                  <ul className="text-xs font-light space-y-1.5 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Sparkles size={10} className="text-accent flex-shrink-0" /> Order details and receipt
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles size={10} className="text-accent flex-shrink-0" /> Shipping updates when dispatched
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles size={10} className="text-accent flex-shrink-0" /> Tracking number via Australia Post
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Progress Steps */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="grid grid-cols-3 gap-6 text-center">
                  {[
                    { num: '1', title: 'Confirmed', desc: 'Check your email', active: true },
                    { num: '2', title: 'Crafting', desc: 'We prepare your order', active: false },
                    { num: '3', title: 'Delivered', desc: 'To your doorstep', active: false },
                  ].map((step) => (
                    <div key={step.num} className="space-y-2">
                      <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-light ${
                        step.active
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-cream text-muted-foreground/40 border border-border/30'
                      }`}>
                        {step.active ? <Check size={14} /> : step.num}
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
                {isAuthenticated ? (
                  <Link href="/dashboard" className="btn-primary inline-flex items-center justify-center gap-2 cursor-pointer">
                    View My Orders
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link href="/track-order" className="btn-primary inline-flex items-center justify-center gap-2 cursor-pointer">
                    Track Your Order
                    <ArrowRight size={16} />
                  </Link>
                )}
                <Link href="/shop" className="btn-outline inline-flex items-center justify-center gap-2 cursor-pointer">
                  Continue Shopping
                </Link>
              </motion.div>

              {/* Create account prompt for guests */}
              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-accent/5 border border-accent/20 p-6 space-y-3"
                  style={{ borderRadius: '2px' }}
                >
                  <p className="font-serif font-light text-sm">Want to track all your orders in one place?</p>
                  <p className="text-xs text-muted-foreground font-light">
                    Create an account with the same email to view order history, save addresses, and more.
                  </p>
                  <Link href="/register" className="btn-outline inline-flex items-center gap-2 text-xs cursor-pointer">
                    Create Account
                  </Link>
                </motion.div>
              )}

              {/* Help */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-8 border-t border-border/30"
              >
                <p className="text-xs text-muted-foreground/50 font-light">
                  Questions?{' '}
                  <Link href="/contact" className="text-accent hover:text-accent/80 transition-colors">
                    Contact us
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
