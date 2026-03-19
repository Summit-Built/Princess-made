import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { ArrowRight, Scissors, Heart, Sparkles, Instagram } from 'lucide-react';

export default function Home() {
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
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

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 texture-linen" />
          <div className="absolute inset-0 gradient-blush opacity-40" />

          <div className="container relative">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center text-center py-28 md:py-44 space-y-10"
            >
              {/* Script tagline */}
              <motion.p
                variants={itemVariants}
                className="font-script text-2xl md:text-3xl text-accent"
              >
                Just a girl with a dream
              </motion.p>

              {/* Main heading */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-light leading-[1.1] tracking-tight max-w-4xl"
              >
                Handcrafted
                <br />
                <span className="italic text-accent">with Love</span>
              </motion.h1>

              {/* Decorative divider */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 w-full max-w-xs"
              >
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/30" />
                <Sparkles size={16} className="text-accent/50" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/30" />
              </motion.div>

              {/* Subheading */}
              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-xl"
              >
                100% handmade bags, lovingly crafted one stitch at a time.
                Each piece is unique, just like you.
              </motion.p>

              {/* CTA */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/shop">
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-light tracking-[0.15em] uppercase text-sm hover:bg-accent/90 transition-all cursor-pointer"
                    style={{ borderRadius: '2px' }}
                  >
                    Shop Collection
                    <ArrowRight size={16} />
                  </motion.a>
                </Link>
                <Link href="/about">
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 px-8 py-4 border border-accent/30 text-foreground font-light tracking-[0.15em] uppercase text-sm hover:border-accent/60 transition-all cursor-pointer"
                    style={{ borderRadius: '2px' }}
                  >
                    Our Story
                  </motion.a>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Marquee / Feature Strip */}
        <section className="bg-accent/5 border-y border-accent/10 py-5 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-8 md:gap-16 text-xs tracking-[0.25em] uppercase text-muted-foreground font-light"
          >
            <span className="flex items-center gap-2">
              <Scissors size={14} className="text-accent" />
              100% Handmade
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <Heart size={14} className="text-accent" />
              Made with Love
            </span>
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              One of a Kind
            </span>
            <span className="hidden md:flex items-center gap-2">
              <Instagram size={14} className="text-accent" />
              @princessmadefashion
            </span>
          </motion.div>
        </section>

        {/* Featured Categories */}
        <section className="py-24 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <p className="font-script text-xl text-accent">Explore</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light">
                Our Collections
              </h2>
              <div className="flex items-center gap-4 max-w-xs mx-auto pt-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/20" />
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            >
              {[
                {
                  title: 'Laptop Cases',
                  description: 'Quilted & faux fur protection for your tech',
                  href: '/shop?category=Laptop%20Cases',
                  accent: 'from-[#f0ddd8] to-[#e8c4c0]',
                },
                {
                  title: 'Pouches',
                  description: 'Beautiful pouches for every occasion',
                  href: '/shop?category=Pouches',
                  accent: 'from-[#f5eeeb] to-[#e8ddd8]',
                },
                {
                  title: 'Pencil Cases',
                  description: 'Soft & stylish cases for your stationery',
                  href: '/shop?category=Pencil%20Cases',
                  accent: 'from-[#e8ddd8] to-[#d4c4be]',
                },
              ].map((category, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Link href={category.href}>
                    <motion.a
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="block cursor-pointer group"
                    >
                      <div className={`bg-gradient-to-br ${category.accent} p-12 md:p-14 text-center border border-accent/10 hover:border-accent/30 transition-all duration-500 relative overflow-hidden`} style={{ borderRadius: '2px' }}>
                        <div className="absolute inset-0 texture-linen opacity-50" />
                        <div className="relative">
                          <h3 className="text-2xl md:text-3xl font-serif font-light mb-3 text-foreground">
                            {category.title}
                          </h3>
                          <p className="text-sm text-muted-foreground font-light tracking-wide mb-6">
                            {category.description}
                          </p>
                          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent font-light group-hover:gap-3 transition-all">
                            Discover
                            <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </motion.a>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 gradient-warm" />
          <div className="absolute inset-0 texture-linen" />

          <div className="container relative">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center space-y-8"
            >
              <motion.p variants={itemVariants} className="font-script text-xl text-accent">
                Our Promise
              </motion.p>
              <motion.h2
                variants={itemVariants}
                className="text-4xl md:text-5xl font-serif font-light leading-tight"
              >
                Every Bag Tells <span className="italic">a Story</span>
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-muted-foreground font-light leading-relaxed text-lg"
              >
                At Princess Made, we believe in the beauty of slow fashion. Each bag is handcrafted
                from carefully selected materials, sewn with attention to every detail. No two pieces
                are exactly alike — that's the magic of handmade.
              </motion.p>

              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8"
              >
                {[
                  { icon: Scissors, title: 'Handcrafted', description: 'Every stitch placed with care and intention' },
                  { icon: Heart, title: 'Made with Love', description: 'Passion poured into every single piece' },
                  { icon: Sparkles, title: 'Unique', description: 'No two bags are exactly the same' },
                ].map((value, index) => (
                  <motion.div key={index} variants={itemVariants} className="space-y-3">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                      <value.icon size={20} className="text-accent" />
                    </div>
                    <h3 className="text-lg font-serif font-light">{value.title}</h3>
                    <p className="text-muted-foreground text-sm font-light leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Testimonial / Quote Section */}
        <section className="py-24 md:py-32 border-y border-accent/10">
          <div className="container max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="font-script text-5xl md:text-6xl text-accent/60 leading-none">"</p>
              <p className="text-2xl md:text-3xl font-serif font-light italic leading-relaxed text-foreground/80">
                Fashion is about something that comes from within you.
              </p>
              <div className="flex items-center gap-4 max-w-xs mx-auto">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/20" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-24 md:py-32 relative">
          <div className="absolute inset-0 gradient-rose-subtle" />
          <div className="container max-w-xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="font-script text-xl text-accent">Stay in Touch</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light">
                Join the Family
              </h2>
              <p className="text-muted-foreground font-light">
                Be the first to know about new drops, exclusive offers, and behind-the-scenes peeks.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="input-elegant flex-1"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary px-8"
                >
                  Subscribe
                </motion.button>
              </div>
              <p className="text-xs text-muted-foreground/60 font-light">
                No spam, ever. Unsubscribe anytime.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Instagram CTA */}
        <section className="py-16 border-t border-accent/10">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <p className="font-script text-xl text-accent">Follow Along</p>
              <a
                href="https://www.instagram.com/princessmadefashion/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-foreground hover:text-accent transition-colors group"
              >
                <Instagram size={20} />
                <span className="text-lg font-light tracking-wide group-hover:tracking-wider transition-all">
                  @princessmadefashion
                </span>
              </a>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
