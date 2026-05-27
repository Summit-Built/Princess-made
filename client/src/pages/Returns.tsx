import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { Sparkles } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';
import { Link } from 'wouter';

export default function Returns() {
  usePageMeta({ title: 'Returns & Exchanges', description: 'princess-made returns and exchanges policy for handmade bags and accessories.' });
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
              <p className="font-script text-xl text-accent">We Want You to Love It</p>
              <h1 className="text-4xl md:text-6xl font-serif font-light">Returns & Exchanges</h1>
              <p className="text-muted-foreground font-light max-w-lg mx-auto">
                Our policy on returns, exchanges and refunds for handmade items.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <div className="container max-w-3xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              {/* Overview */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-2xl font-serif font-light">Overview</h2>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We put so much love into every handmade piece and we want you to be thrilled with your
                  purchase. Because each item is individually crafted and unique, our return policy differs
                  slightly from mass-produced goods. Please read the details below carefully.
                </p>
              </motion.div>

              {/* Change of Mind */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Change of Mind</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Due to the handmade and unique nature of our products, we are unable to accept returns or
                  exchanges for change of mind. We encourage you to review product descriptions, measurements
                  and images carefully before placing your order. If you have any questions about a product,
                  please don't hesitate to{' '}
                  <Link href="/contact" className="text-accent hover:underline">
                    contact us
                  </Link>{' '}
                  before purchasing.
                </p>
              </motion.div>

              {/* Damaged or Faulty Items */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Damaged or Faulty Items</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  If your item arrives damaged or is significantly different from what was described on the
                  website, please contact us within <strong className="font-normal">7 days of delivery</strong>.
                  We will need:
                </p>
                <ul className="space-y-2 ml-4">
                  {[
                    'Your order number',
                    'Clear photos showing the damage or issue',
                    'A brief description of the problem',
                  ].map((item, i) => (
                    <li key={i} className="text-muted-foreground font-light leading-relaxed flex items-start gap-2">
                      <span className="text-accent mt-1.5 text-xs">&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Once we have reviewed the issue, we will work with you to find a solution. This may include
                  a replacement, repair, or refund at our discretion.
                </p>
              </motion.div>

              {/* Custom Orders */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Custom Orders</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Custom orders are made specifically to your requirements and are therefore non-refundable.
                  They cannot be returned or exchanged unless the item arrives faulty or damaged. Please
                  confirm all details (fabric, size, colour) carefully before we begin crafting your custom piece.
                </p>
              </motion.div>

              {/* Refund Process */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Refund Process</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  If a refund is approved, it will be processed to your original payment method within 5–10
                  business days. You will receive an email confirmation once the refund has been issued. Please
                  note that it may take additional time for the refund to appear on your statement depending
                  on your bank or payment provider.
                </p>
              </motion.div>

              {/* Handmade Variations */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">A Note on Handmade Variations</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Each princess-made product is individually handcrafted. Slight variations in colour, texture,
                  stitching and dimensions are a natural part of the handmade process and make each piece
                  one-of-a-kind. These variations are not considered defects and are not grounds for a return
                  or refund.
                </p>
              </motion.div>

              {/* Australian Consumer Law */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Your Consumer Rights</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Nothing in this policy is intended to limit your rights under the Australian Consumer Law.
                  You are entitled to a replacement or refund for a major failure and compensation for any
                  other reasonably foreseeable loss or damage. You are also entitled to have goods repaired or
                  replaced if they fail to be of acceptable quality and the failure does not amount to a major failure.
                </p>
              </motion.div>

              {/* Contact */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Need Help?</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  If you have any questions or need to report an issue with your order, please get in touch.
                  We are always here to help.
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
