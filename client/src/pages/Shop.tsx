import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Filter, X, Sparkles, Search } from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';

export default function Shop() {
  usePageMeta({ title: 'Shop', description: 'Browse our collection of handmade bags, laptop cases, pouches and accessories.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated, logout } = useAuth();

  const searchString = useSearch();
  const urlCategory = new URLSearchParams(searchString).get('category') || undefined;
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(urlCategory);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'newest'>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading } = trpc.products.list.useQuery({
    category: selectedCategory,
    search: searchQuery || undefined,
  });

  const utils = trpc.useUtils();

  const { data: favorites } = trpc.favorites.list.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const toggleFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      utils.favorites.isFavorited.invalidate();
      toast.success('Added to favorites');
    },
  });
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      utils.favorites.isFavorited.invalidate();
      toast.success('Removed from favorites');
    },
  });

  const favoriteProductIds = new Set(favorites?.map((f) => f.productId) || []);

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      stripePriceId: product.stripePriceId || '',
      quantity: 1,
      price: product.price,
      name: product.name,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleFavorite = (productId: string) => {
    if (!isAuthenticated) {
      toast('Sign in to save favorites', {
        action: {
          label: 'Sign In',
          onClick: () => { window.location.href = '/login'; },
        },
      });
      return;
    }

    if (favoriteProductIds.has(productId)) {
      removeFavoriteMutation.mutate(productId);
    } else {
      toggleFavoriteMutation.mutate(productId);
    }
  };

  const sortedProducts = products ? [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  }) : [];

  const categories = ['All', 'Laptop Cases', 'Pouches', 'Pencil Cases', 'Accessories'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
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

        {/* Page Header */}
        <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 gradient-blush opacity-30" />
          <div className="absolute inset-0 texture-linen" />
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <p className="font-script text-xl text-accent">Discover</p>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-light text-foreground">
                Our Collection
              </h1>
              <p className="text-muted-foreground font-light max-w-lg mx-auto text-sm sm:text-base">
                Each piece lovingly handcrafted, designed to be as unique as you are
              </p>
              <div className="max-w-md mx-auto relative pt-2">
                <Search size={16} className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-muted-foreground/40" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-elegant pl-11 w-full"
                  aria-label="Search products"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="border-b border-border/50 sticky top-16 md:top-[calc(2rem+4rem+1px)] z-30 bg-background/95 backdrop-blur-md">
          <div className="container">
            <div className="flex items-center justify-between py-3 md:py-4">
              {/* Desktop Categories */}
              <nav className="hidden md:flex items-center gap-1" aria-label="Product categories">
                {categories.map((cat) => {
                  const isActive = (cat === 'All' && !selectedCategory) || selectedCategory === cat;
                  return (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(cat === 'All' ? undefined : cat)}
                      className={`px-4 py-2 text-xs tracking-[0.15em] uppercase font-light transition-all min-h-[36px] ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-cream'
                      }`}
                      style={{ borderRadius: '2px' }}
                      aria-pressed={isActive}
                    >
                      {cat}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Mobile Filter Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 border border-border/40 text-xs tracking-[0.15em] uppercase font-light min-h-[44px]"
                style={{ borderRadius: '2px' }}
                aria-expanded={showMobileFilters}
                aria-label="Toggle filters"
              >
                <Filter size={14} />
                Filters
                {selectedCategory && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
                )}
              </motion.button>

              {/* Sort + Count */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground/60 font-light hidden sm:block">
                  {isLoading ? '...' : `${sortedProducts.length} ${sortedProducts.length === 1 ? 'item' : 'items'}`}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-light bg-transparent border border-border/40 px-3 py-2 text-muted-foreground focus:outline-none focus:border-accent/40 min-h-[44px]"
                  style={{ borderRadius: '2px' }}
                  aria-label="Sort products"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Filters Panel */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-b border-border/50 bg-cream/50 overflow-hidden"
            >
              <div className="container py-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs tracking-[0.2em] uppercase font-light text-muted-foreground">Category</h4>
                  <motion.button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-accent/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ borderRadius: '2px' }}
                    aria-label="Close filters"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isActive = (cat === 'All' && !selectedCategory) || selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat === 'All' ? undefined : cat); setShowMobileFilters(false); }}
                        className={`px-4 py-2.5 text-xs tracking-[0.1em] uppercase font-light transition-all min-h-[44px] ${
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-card border border-border/40 text-muted-foreground'
                        }`}
                        style={{ borderRadius: '2px' }}
                        aria-pressed={isActive}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container">
            {isLoading ? (
              /* Skeleton loading grid */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCardSkeleton />
                  </motion.div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 space-y-4"
              >
                <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-cream border border-border/30">
                  <Sparkles size={24} className="text-muted-foreground/30" />
                </div>
                <p className="text-lg font-serif font-light">No products found</p>
                <p className="text-muted-foreground text-sm font-light">
                  {searchQuery ? 'Try a different search term' : 'Try a different category or check back soon'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {searchQuery && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSearchQuery('')}
                      className="btn-outline text-sm px-6 py-2"
                    >
                      Clear Search
                    </motion.button>
                  )}
                  {selectedCategory && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedCategory(undefined)}
                      className="btn-outline text-sm px-6 py-2"
                    >
                      View All Products
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
              >
                {sortedProducts.map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                      onToggleFavorite={() => handleToggleFavorite(product.id)}
                      isFavorited={favoriteProductIds.has(product.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Custom Order CTA */}
        {!isLoading && sortedProducts.length > 0 && (
          <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
            <div className="absolute inset-0 gradient-warm" />
            <div className="absolute inset-0 texture-linen" />
            <div className="container relative text-center space-y-6">
              <p className="font-script text-xl text-accent">Something Special?</p>
              <h2 className="text-2xl md:text-3xl font-serif font-light">
                Custom Orders Welcome
              </h2>
              <p className="text-muted-foreground font-light max-w-md mx-auto text-sm sm:text-base">
                Have something specific in mind? We love bringing your ideas to life.
              </p>
              <motion.a
                whileHover={{ scale: 1.02 }}
                href="mailto:princessmadefashion@gmail.com"
                className="btn-primary inline-flex items-center justify-center min-h-[48px]"
              >
                Get in Touch
              </motion.a>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}
