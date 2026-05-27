import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { Sparkles, Truck, Clock, Package, MapPin } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';

export default function Shipping() {
  usePageMeta({ title: 'Shipping Information', description: 'princess-made shipping rates, delivery times and tracking information for Australia and international orders.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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

        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 gradient-blush opacity-30" />
          <div className="absolute inset-0 texture-linen" />
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <p className="font-script text-xl text-accent">Delivery Details</p>
              <h1 className="text-4xl md:text-6xl font-serif font-light">Shipping Information</h1>
              <p className="text-muted-foreground font-light max-w-lg mx-auto">
                Everything you need to know about how we get your handmade goodies to you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-12 md:py-16">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { icon: Clock, label: '3–5 Day Processing', desc: 'Each item is handmade with care' },
                { icon: Package, label: 'Tracked Delivery', desc: 'Tracking provided via Australia Post' },
                { icon: MapPin, label: 'Australia-Wide', desc: 'We ship to all Australian addresses' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-6 border border-border/30 space-y-3"
                  style={{ borderRadius: '2px' }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent">
                    <item.icon size={20} />
                  </div>
                  <p className="font-serif font-light">{item.label}</p>
                  <p className="text-xs text-muted-foreground font-light">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8 md:py-16">
          <div className="container max-w-3xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              {/* Processing Time */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Processing Time</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Because every item is handmade with love, orders typically take 3–5 business days to prepare
                  before they are dispatched. During busy periods (holidays, sales, or after a new collection
                  launch), processing may take a little longer — we appreciate your patience!
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  You will receive an email confirmation when your order is placed, and another when it has
                  been shipped with tracking details.
                </p>
              </motion.div>

              {/* Domestic Shipping */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Domestic Shipping (Australia)</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  All domestic orders are shipped via Australia Post. Delivery times after dispatch are typically:
                </p>
                <div className="space-y-3 pt-2">
                  {[
                    { method: 'Standard Shipping', time: '3–7 business days', cost: 'A$8.50' },
                    { method: 'Express Shipping', time: '1–3 business days', cost: 'A$14.00' },
                  ].map((row) => (
                    <div
                      key={row.method}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/30 gap-2"
                      style={{ borderRadius: '2px' }}
                    >
                      <div>
                        <p className="font-serif font-light">{row.method}</p>
                        <p className="text-sm text-muted-foreground font-light">{row.time}</p>
                      </div>
                      <p className="text-sm font-light text-accent">{row.cost}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Delivery times are estimates provided by Australia Post and may vary depending on your
                  location and circumstances outside our control.
                </p>
              </motion.div>

              {/* International Shipping */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">International Shipping</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  International shipping may be available on a case-by-case basis. If you are located outside
                  Australia and would like to order, please contact us before placing your order and we will
                  provide a shipping quote and estimated delivery timeframe.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Please note that international orders may be subject to customs duties and import taxes, which
                  are the responsibility of the buyer.
                </p>
              </motion.div>

              {/* Order Tracking */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Order Tracking</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Once your order has been dispatched, you will receive a shipping confirmation email with an
                  Australia Post tracking number. You can use this to track your parcel on the{' '}
                  <a
                    href="https://auspost.com.au/mypost/track"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Australia Post website
                  </a>
                  .
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  If you have an account with us, you can also view your order status and tracking information
                  from your dashboard.
                </p>
              </motion.div>

              {/* Lost or Delayed Parcels */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Lost or Delayed Parcels</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  If your order has not arrived within the expected timeframe, please check your tracking
                  information first. If your parcel appears lost or significantly delayed, contact us and we
                  will do our best to help resolve the issue with Australia Post.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  princess-made is not responsible for delays, loss or damage caused by Australia Post once the
                  parcel has been dispatched. However, we will always work with you to find a solution.
                </p>
              </motion.div>

              {/* Contact */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Questions?</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  If you have any questions about shipping, feel free to get in touch.
                </p>
                <div className="border border-border/30 p-6 space-y-2" style={{ borderRadius: '2px' }}>
                  <p className="font-serif font-light">princess-made</p>
                  <p className="text-sm text-muted-foreground font-light">
                    Email:{' '}
                    <a href="mailto:princessmadefashion@gmail.com" className="text-accent hover:underline">
                      princessmadefashion@gmail.com
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground font-light">
                    Instagram:{' '}
                    <a
                      href="https://www.instagram.com/princessmadefashion/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      @princessmadefashion
                    </a>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
