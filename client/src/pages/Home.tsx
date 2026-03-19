import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { ArrowRight, Scissors, Heart, Sparkles, Instagram, Check, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';

export default function Home() {
  usePageMeta({ title: 'Princess Made', description: 'Handcrafted bags and accessories made with love in Australia. 100% handmade, one of a kind.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();
  // Prefetch products so Shop page loads instantly
  trpc.products.list.useQuery(undefined, { staleTime: 5 * 60 * 1000 });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      toast.success('Welcome to the Princess Made family!');
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.');
    },
  });

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
              className="flex flex-col items-center text-center py-20 sm:py-28 md:py-44 space-y-6 sm:space-y-8 md:space-y-10"
            >
              {/* Script tagline */}
              <motion.p
                variants={itemVariants}
                className="font-script text-xl sm:text-2xl md:text-3xl text-accent"
              >
                Just a girl with a dream
              </motion.p>

              {/* Main heading - properly sized for mobile */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-light leading-[1.1] tracking-tight max-w-4xl"
              >
                Handcrafted
                <br />
                <span className="italic text-accent">with Love</span>
              </motion.h1>

              {/* Decorative divider */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 w-full max-w-xs"
                aria-hidden="true"
              >
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/30" />
                <Sparkles size={16} className="text-accent/50" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/30" />
              </motion.div>

              {/* Subheading */}
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-xl px-4 sm:px-0"
              >
                100% handmade bags, lovingly crafted one stitch at a time.
                Each piece is unique, just like you.
              </motion.p>

              {/* CTA */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 w-full sm:w-auto px-4 sm:px-0">
                <Link href="/shop">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-light tracking-[0.15em] uppercase text-sm hover:bg-accent/90 transition-all cursor-pointer min-h-[48px] w-full sm:w-auto"
                    style={{ borderRadius: '2px' }}
                  >
                    Shop Collection
                    <ArrowRight size={16} />
                  </motion.div>
                </Link>
                <Link href="/about">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-accent/30 text-foreground font-light tracking-[0.15em] uppercase text-sm hover:border-accent/60 transition-all cursor-pointer min-h-[48px] w-full sm:w-auto"
                    style={{ borderRadius: '2px' }}
                  >
                    Our Story
                  </motion.div>
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
            className="flex items-center justify-center gap-6 sm:gap-8 md:gap-16 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase text-muted-foreground font-light flex-wrap"
          >
            <span className="flex items-center gap-2">
              <Scissors size={14} className="text-accent" aria-hidden="true" />
              100% Handmade
            </span>
            <span className="flex items-center gap-2">
              <Heart size={14} className="text-accent" aria-hidden="true" />
              Made with Love
            </span>
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent" aria-hidden="true" />
              One of a Kind
            </span>
            <span className="hidden md:flex items-center gap-2">
              <Instagram size={14} className="text-accent" aria-hidden="true" />
              @princessmadefashion
            </span>
          </motion.div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 sm:py-24 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16 space-y-4"
            >
              <p className="font-script text-xl text-accent">Explore</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light">
                Our Collections
              </h2>
              <div className="flex items-center gap-4 max-w-xs mx-auto pt-2" aria-hidden="true">
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
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
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
                    <motion.div
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="block cursor-pointer group"
                    >
                      <div className={`bg-gradient-to-br ${category.accent} p-10 sm:p-12 md:p-14 text-center border border-accent/10 hover:border-accent/30 transition-all duration-500 relative overflow-hidden`} style={{ borderRadius: '2px' }}>
                        <div className="absolute inset-0 texture-linen opacity-50" />
                        <div className="relative">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-light mb-3 text-foreground">
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
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
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
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-light leading-tight"
              >
                Every Bag Tells <span className="italic">a Story</span>
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-muted-foreground font-light leading-relaxed text-base sm:text-lg px-4 sm:px-0"
              >
                At Princess Made, we believe in the beauty of slow fashion. Each bag is handcrafted
                from carefully selected materials, sewn with attention to every detail. No two pieces
                are exactly alike — that's the magic of handmade.
              </motion.p>

              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8"
              >
                {[
                  { icon: Scissors, title: 'Handcrafted', description: 'Every stitch placed with care and intention' },
                  { icon: Heart, title: 'Made with Love', description: 'Passion poured into every single piece' },
                  { icon: Sparkles, title: 'Unique', description: 'No two bags are exactly the same' },
                ].map((value, index) => (
                  <motion.div key={index} variants={itemVariants} className="space-y-3">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                      <value.icon size={20} className="text-accent" aria-hidden="true" />
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

        {/* Customer love / Social Proof Section */}
        <section className="py-16 sm:py-24 md:py-32 border-y border-accent/10">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center space-y-6 mb-12"
            >
              <p className="font-script text-xl text-accent">Customer Love</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-light">
                What Our Customers Say
              </h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {[
                {
                  quote: 'Absolutely love my laptop case! The quilting is so soft and it fits my MacBook perfectly. You can really tell it was made with care.',
                  name: 'Sarah',
                  location: 'Sydney',
                  product: 'Quilted Laptop Case',
                },
                {
                  quote: 'I bought a pouch as a gift for my sister and she was obsessed. The faux fur is SO cute. Already ordering one for myself!',
                  name: 'Jess',
                  location: 'Melbourne',
                  product: 'Faux Fur Pouch',
                },
                {
                  quote: 'The attention to detail is incredible for the price. My pencil case gets so many compliments at uni. Supporting small business feels great too.',
                  name: 'Mia',
                  location: 'Brisbane',
                  product: 'Pencil Case',
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="p-6 md:p-8 bg-card border border-border/40 text-left space-y-4 relative"
                  style={{ borderRadius: '2px' }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5" role="img" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-accent/70 text-accent/70" />
                    ))}
                  </div>

                  <p className="text-sm text-foreground/80 font-light leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>

                  <div className="pt-2 border-t border-border/30">
                    <p className="text-sm font-serif font-light text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 font-light">
                      {testimonial.location} · {testimonial.product}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 gradient-rose-subtle" />
          <div className="absolute inset-0 texture-linen opacity-20" />

          <div className="container max-w-xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6 sm:space-y-8 p-6 sm:p-10 md:p-12 bg-card/50 backdrop-blur-sm border border-border/30"
              style={{ borderRadius: '2px' }}
            >
              <p className="font-script text-xl text-accent">Stay in Touch</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light">
                Join the Family
              </h2>
              <p className="text-muted-foreground font-light text-sm sm:text-base">
                Be the first to know about new drops, exclusive offers, and behind-the-scenes peeks.
              </p>
              {newsletterSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 text-accent font-light py-4"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Check size={16} className="text-accent" />
                  </div>
                  <span>You're in! Thanks for subscribing.</span>
                </motion.div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) subscribeMutation.mutate({ email: newsletterEmail });
                  }}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="input-elegant flex-1"
                    aria-label="Email address for newsletter"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="btn-primary px-8 flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    {subscribeMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                    Subscribe
                  </motion.button>
                </form>
              )}
              <p className="text-xs text-muted-foreground/50 font-light">
                No spam, ever. Unsubscribe anytime.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Instagram CTA */}
        <section className="py-12 sm:py-16 border-t border-accent/10">
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
                className="inline-flex items-center gap-3 text-foreground hover:text-accent transition-colors group min-h-[44px]"
                aria-label="Follow @princessmadefashion on Instagram"
              >
                <Instagram size={20} />
                <span className="text-base sm:text-lg font-light tracking-wide group-hover:tracking-wider transition-all">
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
