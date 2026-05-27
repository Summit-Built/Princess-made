import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { Scissors, Heart, Sparkles, Instagram, ArrowRight } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';

export default function About() {
  usePageMeta({ title: 'About', description: 'The story behind Princess Made — handcrafted bags made with love in Australia.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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
        <section className="relative py-16 sm:py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 gradient-blush opacity-40" />
          <div className="absolute inset-0 texture-linen" />
          <div className="container relative">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <motion.p variants={itemVariants} className="font-script text-xl sm:text-2xl text-accent">
                Our Story
              </motion.p>
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-7xl font-serif font-light leading-tight"
              >
                Made with <Heart className="inline-block text-accent mb-1 w-9 h-9 sm:w-12 sm:h-12 md:w-[4.5rem] md:h-[4.5rem]" strokeWidth={1.25} />
              </motion.h1>
              <motion.div variants={itemVariants} className="flex items-center gap-4 max-w-xs mx-auto" aria-hidden="true">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/30" />
                <Sparkles size={16} className="text-accent/50" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/30" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 sm:py-20 md:py-28">
          <div className="container">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center space-y-8"
            >
              <motion.p variants={itemVariants} className="font-script text-xl text-accent">
                The Beginning
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed px-4 sm:px-0"
              >
                Princess Made started as a passion project — just a girl with a sewing machine and a dream.
                What began as making gifts for friends quickly became something bigger when people started
                asking where they could buy one too.
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed px-4 sm:px-0"
              >
                Every single piece is handmade from start to finish. From choosing the perfect fabrics
                to placing the final stitch, each product is crafted with love and care. No factories,
                no mass production — just handmade goodness.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 gradient-warm" />
          <div className="absolute inset-0 texture-linen" />
          <div className="container relative">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center space-y-10 sm:space-y-12"
            >
              <div className="space-y-4">
                <motion.p variants={itemVariants} className="font-script text-xl text-accent">
                  What We Stand For
                </motion.p>
                <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-serif font-light">
                  Our Values
                </motion.h2>
              </div>

              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 max-w-4xl mx-auto pt-4"
              >
                {[
                  {
                    icon: Scissors,
                    title: 'Handcrafted Quality',
                    description:
                      'Every stitch is placed with care and intention. We take our time to make sure each piece is perfect before it leaves our hands.',
                  },
                  {
                    icon: Heart,
                    title: 'Made with Love',
                    description:
                      'This isn\'t just a business — it\'s a labour of love. We pour our heart into every single item we create.',
                  },
                  {
                    icon: Sparkles,
                    title: 'One of a Kind',
                    description:
                      'No two pieces are exactly the same. Each product has its own unique character, just like you.',
                  },
                ].map((value, index) => (
                  <motion.div key={index} variants={itemVariants} className="space-y-4">
                    <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                      <value.icon size={22} className="text-accent" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-serif font-light">{value.title}</h3>
                    <p className="text-muted-foreground text-sm font-light leading-relaxed px-4 sm:px-0">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Materials */}
        <section className="py-16 sm:py-20 md:py-28">
          <div className="container">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center space-y-8"
            >
              <motion.p variants={itemVariants} className="font-script text-xl text-accent">
                The Details
              </motion.p>
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-serif font-light">
                What Goes Into Each Piece
              </motion.h2>
              <motion.div variants={itemVariants} className="text-left space-y-6 pt-4 px-2 sm:px-0">
                {[
                  { label: 'Faux Fur', detail: 'Luxuriously soft, carefully selected for texture and quality' },
                  { label: 'Quilted Fabric', detail: 'Padded with flex foam for structure and protection' },
                  { label: 'Cambric Lace', detail: 'Delicate trim that adds the perfect finishing touch' },
                  { label: 'Machine Washable', detail: 'Practical meets pretty — easy to care for' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 pb-6 border-b border-border/20 last:border-0 last:pb-0">
                    <Sparkles size={14} className="text-accent mt-1 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-serif font-light">{item.label}</p>
                      <p className="text-sm text-muted-foreground font-light mt-1">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 gradient-rose-subtle" />
          <div className="container relative text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="font-script text-xl text-accent">Ready to Shop?</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light">
                Find Your Perfect Piece
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4 sm:px-0">
                <Link href="/shop">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-light tracking-[0.15em] uppercase text-sm cursor-pointer min-h-[48px] w-full sm:w-auto"
                    style={{ borderRadius: '2px' }}
                  >
                    Shop Collection
                    <ArrowRight size={16} />
                  </motion.div>
                </Link>
                <a
                  href="https://www.instagram.com/princessmadefashion/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Princess Made on Instagram"
                >
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-accent/30 text-foreground font-light tracking-[0.15em] uppercase text-sm cursor-pointer min-h-[48px] w-full sm:w-auto"
                    style={{ borderRadius: '2px' }}
                  >
                    <Instagram size={16} />
                    Follow Us
                  </motion.span>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
