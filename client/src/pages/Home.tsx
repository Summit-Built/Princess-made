import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
// Home page does NOT use PageTransition to avoid opacity:0 delaying LCP/FCP
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { ArrowRight, Scissors, Heart, Sparkles, Instagram, Check, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';

function useScrollReveal() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useCallback((node: HTMLDivElement | null) => { setEl(node); }, []);
  useEffect(() => {
    if (!el || isVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.02, rootMargin: '80px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, isVisible]);
  return { ref, isVisible };
}

export default function Home() {
  usePageMeta({ title: 'Princess Made', description: 'Handcrafted bags and accessories made with love in Australia. 100% handmade, one of a kind.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();
  // Prefetch products so Shop page loads instantly (also used for category images)
  const { data: products } = trpc.products.list.useQuery(undefined, { staleTime: 5 * 60 * 1000 });

  // Pick the first product image per category for the category card backgrounds
  const categoryImages: Record<string, string | undefined> = {};
  if (products) {
    for (const p of products) {
      if (p.imageUrl && !categoryImages[p.category]) {
        categoryImages[p.category] = p.imageUrl;
      }
    }
  }

  // Best sellers: show first 8 products with images
  const bestSellers = products?.filter(p => p.imageUrl).slice(0, 8) ?? [];

  // Hero product image — use the first available product image
  const heroProduct = products?.find(p => p.imageUrl);

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

  // Scroll reveal animations
  const revealBestSellers = useScrollReveal();
  const revealCollections = useScrollReveal();
  const revealStory = useScrollReveal();
  const revealTestimonials = useScrollReveal();
  const revealNewsletter = useScrollReveal();

  // Carousel scroll
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const amount = 320;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
      <div className="min-h-screen bg-background">
        <Header
          cartCount={cartItems}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => (window.location.href = '/login')}
          onLogoutClick={logout}
        />

        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden bg-cream">
          {/* Subtle hearts background */}
          <div className="absolute inset-0 hero-hearts opacity-30" aria-hidden="true" />
          <div className="absolute inset-0 texture-linen" />
          <div className="container relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[70vh] md:min-h-[calc(90vh-7rem)]">
              {/* Left: Text content */}
              <div className="flex flex-col justify-center py-12 sm:py-16 md:py-24 space-y-5 sm:space-y-6 z-10 order-2 md:order-1">
                <p className="font-script text-xl sm:text-2xl md:text-3xl text-accent">
                  Just a girl with a dream
                </p>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.05] tracking-tight">
                  Handcrafted
                  <br />
                  <span className="italic text-accent">with Love</span>
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-md">
                  100% handmade bags, lovingly crafted one stitch at a time.
                  Each piece is unique, just like you.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/shop" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-light tracking-[0.15em] uppercase text-sm hover:bg-accent/90 transition-all cursor-pointer min-h-[48px] rounded-full">
                    Shop Collection
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/about" className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-accent/30 text-foreground font-light tracking-[0.15em] uppercase text-sm hover:border-accent/60 transition-all cursor-pointer min-h-[48px] rounded-full">
                    Our Story
                  </Link>
                </div>
              </div>

              {/* Right: Product image */}
              <div className="relative flex items-center justify-center order-1 md:order-2 pt-8 md:pt-0">
                {heroProduct?.imageUrl ? (
                  <div className="relative w-full max-w-md md:max-w-lg aspect-[3/4] md:aspect-auto md:h-full">
                    <img
                      src={heroProduct.imageUrl}
                      alt={heroProduct.name}
                      className="w-full h-full object-cover object-center rounded-xl"
                    />
                    {/* Floating badge */}
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/90 backdrop-blur-sm px-4 py-2 border border-accent/20 rounded-lg">
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-light">Best Seller</p>
                      <p className="text-sm font-serif text-foreground">{heroProduct.name}</p>
                    </div>
                  </div>
                ) : (
                  /* Fallback: decorative pattern when no products loaded */
                  <div className="w-full h-64 md:h-full relative">
                    <div className="absolute inset-0 hero-hearts opacity-60" />
                    <div className="absolute inset-0 gradient-blush opacity-50" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Stats Trust Strip (Depop-style) ─── */}
        <section className="border-y border-accent/10 py-6 sm:py-8">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Scissors, stat: '100%', label: 'Handmade' },
                { icon: Heart, stat: '100+', label: 'Happy Customers' },
                { icon: Sparkles, stat: '1 of 1', label: 'Every Piece Unique' },
                { icon: Instagram, stat: 'A$50+', label: 'Free Shipping' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-accent/5 border border-accent/10">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-accent/10">
                    <item.icon size={16} className="text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-serif font-light text-foreground leading-tight">{item.stat}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-light tracking-wide">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Best Sellers Carousel ─── */}
        {bestSellers.length > 0 && (
          <section className="py-12 sm:py-16 md:py-20">
            <div ref={revealBestSellers.ref} className={`container transition-all duration-700 ease-out ${revealBestSellers.isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-3'}`}>
              <div className="flex items-end justify-between mb-8">
                <div className="space-y-2">
                  <p className="font-script text-lg text-accent">Shop Now</p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-light">
                    Best Sellers
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="w-10 h-10 flex items-center justify-center border border-accent/20 hover:border-accent/50 text-foreground/60 hover:text-foreground transition-all rounded-full"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="w-10 h-10 flex items-center justify-center border border-accent/20 hover:border-accent/50 text-foreground/60 hover:text-foreground transition-all rounded-full"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div
                ref={carouselRef}
                className={`flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory ${bestSellers.length <= 3 ? 'justify-center' : ''}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {bestSellers.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div className="flex-shrink-0 w-[280px] sm:w-[320px] group cursor-pointer snap-start">
                      <div className="relative aspect-[3/4] overflow-hidden mb-3 bg-cream border border-accent/10 hover:border-accent/20 transition-all rounded-xl">
                        <img
                          src={product.imageUrl!}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* New badge */}
                        <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] uppercase tracking-[0.15em] font-light px-2.5 py-1 rounded-full">
                          New
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-serif font-light text-foreground group-hover:text-accent transition-colors truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-light">
                          A${(product.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-8 sm:mt-10">
                <Link href="/shop" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] font-light text-accent hover:text-accent/80 transition-colors group min-h-[44px]">
                  View All Products
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ─── Shop by Price (Depop-style) ─── */}
        <section className="py-10 sm:py-14">
          <div className="container">
            <h2 className="text-2xl sm:text-3xl font-serif font-light mb-6">Shop by Price</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Under A$20', bg: 'from-[#fce8eb] to-[#f9d0d6]', href: '/shop?maxPrice=20' },
                { label: 'Under A$40', bg: 'from-[#f9d0d6] to-[#f4e3e1]', href: '/shop?maxPrice=40' },
                { label: 'Under A$60', bg: 'from-[#f4e3e1] to-[#e8d8d6]', href: '/shop?maxPrice=60' },
                { label: 'Under A$100', bg: 'from-[#e8d8d6] to-[#bbced6]', href: '/shop?maxPrice=100' },
              ].map((price, i) => (
                <Link key={i} href={price.href}>
                  <div className={`bg-gradient-to-br ${price.bg} rounded-2xl p-6 sm:p-8 cursor-pointer hover:scale-[1.02] transition-transform duration-200 border border-accent/5`}>
                    <p className="text-lg sm:text-xl md:text-2xl font-serif font-light text-foreground">{price.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured Collections ─── */}
        <section className="py-12 sm:py-20 md:py-28 bg-cream/50 relative">
          <div className="absolute inset-0 hero-hearts opacity-20" aria-hidden="true" />
          <div ref={revealCollections.ref} className={`container transition-all duration-700 ease-out ${revealCollections.isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-3'}`}>
            <div className="text-center mb-10 md:mb-14 space-y-3">
              <p className="font-script text-xl text-accent">Explore</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light">
                Our Collections
              </h2>
              <div className="flex items-center gap-4 max-w-xs mx-auto pt-2" aria-hidden="true">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/20" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {[
                {
                  title: 'Laptop Cases',
                  description: 'Quilted & faux fur protection for your tech',
                  href: '/shop?category=Laptop%20Cases',
                  categoryKey: 'Laptop Cases',
                  accent: 'from-[#fce8eb] to-[#f9d0d6]',
                },
                {
                  title: 'Pouches',
                  description: 'Beautiful pouches for every occasion',
                  href: '/shop?category=Pouches',
                  categoryKey: 'Pouches',
                  accent: 'from-[#f5eeeb] to-[#e8ddd8]',
                },
                {
                  title: 'Pencil Cases',
                  description: 'Soft & stylish cases for your stationery',
                  href: '/shop?category=Pencil%20Cases',
                  categoryKey: 'Pencil Cases',
                  accent: 'from-[#e8ddd8] to-[#d4c4be]',
                },
              ].map((category, index) => {
                const bgImage = categoryImages[category.categoryKey];
                return (
                <div key={index}>
                  <Link href={category.href}>
                    <div className="block cursor-pointer group hover:-translate-y-1 transition-transform duration-300">
                      <div className={`${!bgImage ? `bg-gradient-to-br ${category.accent}` : ''} text-center border border-accent/10 hover:border-accent/30 transition-all duration-500 relative overflow-hidden aspect-[3/4] sm:aspect-[2/3] md:aspect-[3/4] rounded-xl`} style={{ borderRadius: '2px' }}>
                        {/* Product image background */}
                        {bgImage && (
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                            style={{ backgroundImage: `url(${bgImage})` }}
                          />
                        )}
                        {/* Bottom-heavy gradient overlay for text readability */}
                        {bgImage ? (
                          <div className="absolute inset-0 bg-gradient-to-t from-[#3d2c2a]/80 via-[#3d2c2a]/25 to-transparent" />
                        ) : (
                          <div className="absolute inset-0 texture-linen opacity-50" />
                        )}
                        <div className="relative flex flex-col items-center justify-end h-full p-6 sm:p-8 md:p-10 pb-8 sm:pb-10 md:pb-12">
                          <h3 className={`text-2xl sm:text-3xl md:text-4xl font-serif font-light mb-2 ${bgImage ? 'text-white' : 'text-foreground'}`} style={bgImage ? { textShadow: '0 1px 8px rgba(0,0,0,0.3)' } : undefined}>
                            {category.title}
                          </h3>
                          <p className={`text-sm font-light tracking-wide mb-5 ${bgImage ? 'text-white/80' : 'text-muted-foreground'}`} style={bgImage ? { textShadow: '0 1px 4px rgba(0,0,0,0.3)' } : undefined}>
                            {category.description}
                          </p>
                          <span className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-light group-hover:gap-3 transition-all ${bgImage ? 'text-white/90' : 'text-accent'}`}>
                            Discover
                            <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Brand Story — 50/50 Split ─── */}
        <section className="py-12 sm:py-20 md:py-28">
          <div ref={revealStory.ref} className={`container transition-all duration-700 ease-out ${revealStory.isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-3'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
              {/* Left: Image */}
              <div className="relative">
                {products && products.length > 1 && products[1]?.imageUrl ? (
                  <div className="relative">
                    <img
                      src={products[1].imageUrl}
                      alt="Handcrafted with care"
                      className="w-full aspect-[4/5] object-cover rounded-xl"
                                           loading="lazy"
                    />
                    {/* Decorative accent */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/10 -z-10 hidden md:block" style={{ borderRadius: '2px' }} />
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-blush/30 -z-10 hidden md:block" style={{ borderRadius: '2px' }} />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/5] bg-gradient-to-br from-cream to-blush/30 flex items-center justify-center" style={{ borderRadius: '2px' }}>
                    <Heart size={48} className="text-accent/20" />
                  </div>
                )}
              </div>

              {/* Right: Text */}
              <div className="space-y-6 md:space-y-8">
                <p className="font-script text-xl text-accent">Our Promise</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light leading-tight">
                  Every Bag Tells <span className="italic">a Story</span>
                </h2>
                <p className="text-muted-foreground font-light leading-relaxed text-base sm:text-lg">
                  At Princess Made, we believe in the beauty of slow fashion. Each bag is handcrafted
                  from carefully selected materials, sewn with attention to every detail. No two pieces
                  are exactly alike — that's the magic of handmade.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                  {[
                    { icon: Scissors, title: 'Handcrafted', description: 'Every stitch placed with care' },
                    { icon: Heart, title: 'Made with Love', description: 'Passion in every piece' },
                    { icon: Sparkles, title: 'Unique', description: 'No two bags are the same' },
                  ].map((value, index) => (
                    <div key={index} className="space-y-2">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                        <value.icon size={18} className="text-accent" aria-hidden="true" />
                      </div>
                      <h3 className="text-base font-serif font-light">{value.title}</h3>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>

                <Link href="/about" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] font-light text-accent hover:text-accent/80 transition-colors group min-h-[44px] pt-2">
                  Read Our Story
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Customer Love ─── */}
        <section className="py-12 sm:py-20 md:py-28 bg-cream/30 border-y border-accent/10 relative overflow-hidden">
          <div className="absolute inset-0 hero-hearts opacity-15" aria-hidden="true" />
          <div ref={revealTestimonials.ref} className={`container transition-all duration-700 ease-out ${revealTestimonials.isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-3'}`}>
            <div className="text-center space-y-4 mb-10">
              <p className="font-script text-xl text-accent">Customer Love</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-light">
                What Our Customers Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
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
                <div
                  key={index}
                  className="p-6 md:p-8 bg-card border border-border/40 text-left space-y-4 relative rounded-xl"
                                 >
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Newsletter ─── */}
        <section className="py-12 sm:py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 gradient-rose-subtle" />
          <div className="absolute inset-0 hero-hearts opacity-15" aria-hidden="true" />
          <div className="absolute inset-0 texture-linen opacity-20" />

          <div ref={revealNewsletter.ref} className={`container max-w-xl mx-auto text-center relative transition-all duration-700 ease-out ${revealNewsletter.isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-3'}`}>
            <div
              className="space-y-6 sm:space-y-8 p-6 sm:p-10 md:p-12 bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl"
                         >
              <p className="font-script text-xl text-accent">Stay in Touch</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light">
                Join the Family
              </h2>
              <p className="text-muted-foreground font-light text-sm sm:text-base">
                Be the first to know about new drops, exclusive offers, and behind-the-scenes peeks.
              </p>
              {newsletterSubscribed ? (
                <div className="flex items-center justify-center gap-2 text-accent font-light py-4">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Check size={16} className="text-accent" />
                  </div>
                  <span>You're in! Thanks for subscribing.</span>
                </div>
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
                  <button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="btn-primary px-8 flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98]"
                  >
                    {subscribeMutation.isPending && <Spinner size={14} />}
                    Subscribe
                  </button>
                </form>
              )}
              <p className="text-xs text-muted-foreground/50 font-light">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Instagram CTA ─── */}
        <section className="py-10 sm:py-14 border-t border-accent/10">
          <div className="container text-center">
            <div className="space-y-4">
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
            </div>
          </div>
        </section>

        <Footer />
      </div>
  );
}
