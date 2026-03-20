import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { usePageMeta } from '@/lib/usePageMeta';
import { Search, Package, Truck, Check, MapPin, ExternalLink } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function TrackOrder() {
  usePageMeta({ title: 'Track Order', description: 'Track your Princess Made order status and shipping.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();

  const searchString = useSearch();
  const urlEmail = new URLSearchParams(searchString).get('email') || '';
  const [email, setEmail] = useState(urlEmail);
  const [searchEmail, setSearchEmail] = useState(urlEmail);

  const { data: orders, isLoading, isError } = trpc.orders.lookupByEmail.useQuery(
    { email: searchEmail },
    { enabled: !!searchEmail },
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSearchEmail(email);
  };

  const statusSteps = ['processing', 'shipped', 'in_transit', 'delivered'];
  const statusLabels: Record<string, string> = {
    processing: 'Processing',
    shipped: 'Shipped',
    in_transit: 'In Transit',
    delivered: 'Delivered',
  };
  const statusIcons: Record<string, typeof Package> = {
    processing: Package,
    shipped: Truck,
    in_transit: MapPin,
    delivered: Check,
  };

  const getStepIndex = (status: string | null) => {
    if (!status) return -1;
    return statusSteps.indexOf(status);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header
          cartCount={cartItems}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => (window.location.href = '/login')}
          onLogoutClick={logout}
        />

        <section className="py-16 md:py-24">
          <div className="container max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 mb-12"
            >
              <p className="font-script text-xl text-accent">Stay Updated</p>
              <h1 className="text-4xl md:text-5xl font-serif font-light">Track Your Order</h1>
              <p className="text-muted-foreground font-light">
                Enter the email you used at checkout to see your orders
              </p>
            </motion.div>

            {/* Search form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 mb-12"
            >
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-elegant pl-11 w-full"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="btn-primary px-8 flex items-center justify-center gap-2"
              >
                {isLoading && <Spinner size={14} />}
                Find Orders
              </motion.button>
            </motion.form>

            {/* Results */}
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Spinner size={24} className="mx-auto" />
                </motion.div>
              )}

              {searchEmail && !isLoading && isError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 border border-destructive/20 space-y-4"
                  style={{ borderRadius: '2px' }}
                  role="alert"
                >
                  <Package size={32} className="mx-auto text-destructive/30" />
                  <p className="font-serif font-light text-destructive">Something went wrong</p>
                  <p className="text-sm text-muted-foreground font-light">
                    We couldn't look up your orders. Please try again.
                  </p>
                </motion.div>
              )}

              {searchEmail && !isLoading && !isError && orders && orders.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 border border-border/30 space-y-4"
                  style={{ borderRadius: '2px' }}
                >
                  <Package size={32} className="mx-auto text-muted-foreground/20" />
                  <p className="font-serif font-light">No orders found</p>
                  <p className="text-sm text-muted-foreground font-light">
                    Make sure you're using the same email you checked out with
                  </p>
                </motion.div>
              )}

              {orders && orders.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {orders.map((order: any) => {
                    const currentStep = getStepIndex(order.shippingStatus);

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-border/30 p-6 space-y-6"
                        style={{ borderRadius: '2px' }}
                      >
                        {/* Order header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-serif font-light">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground/60 font-light">
                              {new Date(order.createdAt).toLocaleDateString('en-AU', {
                                year: 'numeric', month: 'long', day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-lg font-serif font-light text-accent">
                              A${(order.totalAmount / 100).toFixed(2)}
                            </p>
                            {(() => {
                              const statusConfig: Record<string, { bg: string; dot: string; label: string }> = {
                                pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', label: 'Pending' },
                                completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', label: 'Completed' },
                                failed: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400', label: 'Failed' },
                                cancelled: { bg: 'bg-gray-50 text-gray-500 border-gray-200', dot: 'bg-gray-400', label: 'Cancelled' },
                                refunded: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', label: 'Refunded' },
                              };
                              const config = statusConfig[order.status] || statusConfig.cancelled;
                              return (
                                <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1 font-light tracking-wider uppercase border ${config.bg}`} style={{ borderRadius: '10px' }}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                  {config.label}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Shipping progress */}
                        {order.shippingStatus && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              {statusSteps.map((step, i) => {
                                const Icon = statusIcons[step];
                                const isActive = i <= currentStep;
                                const isCurrent = i === currentStep;
                                return (
                                  <React.Fragment key={step}>
                                    <div className="flex flex-col items-center gap-1.5">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                        isCurrent ? 'bg-accent text-accent-foreground' :
                                        isActive ? 'bg-accent/20 text-accent' :
                                        'bg-cream text-muted-foreground/30'
                                      }`}>
                                        <Icon size={14} />
                                      </div>
                                      <span className={`text-[9px] uppercase tracking-wider font-light ${
                                        isActive ? 'text-foreground' : 'text-muted-foreground/40'
                                      }`}>
                                        {statusLabels[step]}
                                      </span>
                                    </div>
                                    {i < statusSteps.length - 1 && (
                                      <div className={`flex-1 h-px mx-2 mb-5 ${
                                        i < currentStep ? 'bg-accent/40' : 'bg-border/30'
                                      }`} />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Tracking link */}
                        {order.trackingNumber && (
                          <div className="flex items-center justify-between p-4 bg-cream/50 border border-border/20" style={{ borderRadius: '2px' }}>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-light">Tracking Number</p>
                              <p className="font-mono text-sm mt-1">{order.trackingNumber}</p>
                            </div>
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
                            >
                              Track <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
