import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { Sparkles } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';

export default function Terms() {
  usePageMeta({ title: 'Terms of Service', description: 'Princess Made terms and conditions for purchasing handmade bags and accessories.' });
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
              <p className="font-script text-xl text-accent">The Fine Print</p>
              <h1 className="text-4xl md:text-6xl font-serif font-light">Terms of Service</h1>
              <p className="text-muted-foreground font-light max-w-lg mx-auto">
                Please read these terms carefully before making a purchase.
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
              {/* Last Updated */}
              <motion.p variants={itemVariants} className="text-sm text-muted-foreground font-light">
                Last updated: March 2026
              </motion.p>

              {/* General Terms */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-2xl font-serif font-light">General Terms</h2>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Welcome to Princess Made. By accessing our website and placing an order, you agree to be
                  bound by these Terms of Service. If you do not agree with any part of these terms, please
                  do not use our website or services.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Princess Made is an Australian-based small business specialising in handmade bags, pouches
                  and accessories. All products are individually handcrafted, which means slight variations in
                  colour, texture and size may occur between items. These variations are a natural characteristic
                  of handmade goods and are not considered defects.
                </p>
              </motion.div>

              {/* Pricing */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Pricing</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  All prices on our website are listed in Australian Dollars (AUD) and include GST where
                  applicable. We reserve the right to change prices at any time without prior notice. The price
                  at the time you place your order is the price you will be charged.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Shipping costs are calculated at checkout and depend on your location and order total.
                </p>
              </motion.div>

              {/* Orders */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Orders and Payment</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  When you place an order, you are making an offer to purchase. We will send you an order
                  confirmation email once your order has been received. A contract is formed when your order
                  is confirmed and payment is successfully processed.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  All payments are processed securely through Stripe. We accept major credit and debit cards.
                  We do not store your payment card details on our servers. We reserve the right to cancel any
                  order if we are unable to fulfil it, in which case a full refund will be issued.
                </p>
              </motion.div>

              {/* Shipping */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Shipping</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We ship Australia-wide via Australia Post (AusPost). Orders are typically dispatched within
                  3-5 business days. As each item is handmade, please allow additional processing time during
                  busy periods.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Standard domestic delivery usually takes 3-7 business days after dispatch. Tracking
                  information will be provided via email once your order has been shipped. Princess Made is
                  not responsible for delays caused by Australia Post or unforeseen circumstances.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  International shipping may be available on request. Please contact us for a quote before
                  placing your order.
                </p>
              </motion.div>

              {/* Returns */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Returns and Exchanges</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Due to the handmade and unique nature of our products, we do not accept returns or exchanges
                  for change of mind. We want you to love your purchase, so please review product descriptions
                  and images carefully before ordering.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  If your item arrives damaged or is significantly different from what was described, please
                  contact us within 7 days of delivery with photos of the issue. We will work with you to
                  resolve the matter, which may include a replacement, repair or refund at our discretion.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Custom orders are non-refundable and cannot be returned unless they arrive faulty or damaged.
                </p>
              </motion.div>

              {/* Intellectual Property */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Intellectual Property</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  All content on this website, including but not limited to text, images, logos, product
                  designs, graphics and branding, is the intellectual property of Princess Made and is
                  protected by Australian and international copyright laws. You may not reproduce, distribute
                  or use any content from this website without our prior written consent.
                </p>
              </motion.div>

              {/* Limitation of Liability */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Limitation of Liability</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  To the maximum extent permitted by law, Princess Made shall not be liable for any indirect,
                  incidental, special, consequential or punitive damages arising out of or related to your use
                  of our website or products. Our total liability for any claim shall not exceed the amount you
                  paid for the product in question.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We make every effort to display product colours and details accurately. However, we cannot
                  guarantee that your device's display will accurately reflect the actual colours and textures
                  of our handmade products.
                </p>
              </motion.div>

              {/* Australian Consumer Law */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Australian Consumer Law</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Nothing in these terms is intended to exclude, restrict or modify any consumer rights under
                  the Australian Consumer Law (ACL) in the Competition and Consumer Act 2010 (Cth). If any
                  provision of these terms is inconsistent with the ACL, the ACL prevails to the extent of
                  the inconsistency. You are entitled to a replacement or refund for a major failure and
                  compensation for any other reasonably foreseeable loss or damage.
                </p>
              </motion.div>

              {/* Changes */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Changes to These Terms</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We may update these Terms of Service from time to time. Any changes will be posted on this
                  page with an updated revision date. Your continued use of the website after changes are
                  posted constitutes acceptance of the updated terms.
                </p>
              </motion.div>

              {/* Governing Law */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Governing Law</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  These terms are governed by and construed in accordance with the laws of Australia. Any
                  disputes arising from these terms or your use of our website shall be subject to the
                  exclusive jurisdiction of the courts of Australia.
                </p>
              </motion.div>

              {/* Contact */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Contact Us</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="border border-border/30 p-6 space-y-2" style={{ borderRadius: '2px' }}>
                  <p className="font-serif font-light">Princess Made</p>
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
