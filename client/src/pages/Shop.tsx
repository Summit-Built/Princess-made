import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearch } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { MiniLoader } from '@/components/LoadingScreen';
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

  const { data: favorites } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const toggleFavoriteMutation = trpc.favorites.add.useMutation();
  const removeFavoriteMutation = trpc.favorites.remove.useMutation();

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
      window.location.href = '/login';
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
        <section className="relative py-16 md:py-24 overflow-hidden">
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
              <h1 className="text-4xl md:text-6xl font-serif font-light text-foreground">
                Our Collection
              </h1>
              <p className="text-muted-foreground font-light max-w-lg mx-auto">
                Each piece lovingly handcrafted, designed to be as unique as you are
              </p>
              <div className="max-w-md mx-auto relative pt-2">
                <Search size={16} className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-elegant pl-11 w-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="border-b border-border/50 sticky top-16 md:top-[calc(2rem+4rem+1px)] z-30 bg-background/95 backdrop-blur-md">
          <div className="container">
            <div className="flex items-center justify-between py-4">
              {/* Desktop Categories */}
              <div className="hidden md:flex items-center gap-1">
                {categories.map((cat) => {
                  const isActive = (cat === 'All' && !selectedCategory) || selectedCategory === cat;
                  return (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(cat === 'All' ? undefined : cat)}
                      className={`px-4 py-2 text-xs tracking-[0.15em] uppercase font-light transition-all ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-cream'
                      }`}
                      style={{ borderRadius: '2px' }}
                    >
                      {cat}
                    </motion.button>
                  );
                })}
              </div>

              {/* Mobile Filter Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 border border-border/40 text-xs tracking-[0.15em] uppercase font-light"
                style={{ borderRadius: '2px' }}
              >
                <Filter size={14} />
                Filters
              </motion.button>

              {/* Sort + Count */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground/60 font-light hidden sm:block">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-light bg-transparent border border-border/40 px-3 py-2 text-muted-foreground focus:outline-none focus:border-accent/40"
                  style={{ borderRadius: '2px' }}
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
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border/50 bg-cream/50"
          >
            <div className="container py-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs tracking-[0.2em] uppercase font-light text-muted-foreground">Category</h4>
                <motion.button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-accent/5"
                  style={{ borderRadius: '2px' }}
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
                      className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase font-light transition-all ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-card border border-border/40 text-muted-foreground'
                      }`}
                      style={{ borderRadius: '2px' }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        <section className="py-12 md:py-16">
          <div className="container">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <MiniLoader />
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
                  Try a different category or check back soon
                </p>
                {selectedCategory && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedCategory(undefined)}
                    className="btn-outline text-sm px-6 py-2"
                  >
                    View All Products
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
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
        {sortedProducts.length > 0 && (
          <section className="py-16 md:py-20 relative overflow-hidden">
            <div className="absolute inset-0 gradient-warm" />
            <div className="absolute inset-0 texture-linen" />
            <div className="container relative text-center space-y-6">
              <p className="font-script text-xl text-accent">Something Special?</p>
              <h2 className="text-2xl md:text-3xl font-serif font-light">
                Custom Orders Welcome
              </h2>
              <p className="text-muted-foreground font-light max-w-md mx-auto">
                Have something specific in mind? We love bringing your ideas to life.
              </p>
              <motion.a
                whileHover={{ scale: 1.02 }}
                href="mailto:princessmadefashion@gmail.com"
                className="btn-primary inline-block"
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
