import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRoute, Link } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MiniLoader } from '@/components/LoadingScreen';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Heart, ShoppingBag, Check, ChevronLeft, Share2, Truck, Shield, RotateCcw, Scissors } from 'lucide-react';

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const productId = params?.id ?? undefined;

  const cartItems = useCartStore((state) => state.getTotalItems());
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated, logout } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading } = trpc.products.getById.useQuery(productId || '', {
    enabled: !!productId,
  });

  const { data: isFav } = trpc.favorites.isFavorited.useQuery(productId || '', {
    enabled: isAuthenticated && !!productId,
  });

  const toggleFavoriteMutation = trpc.favorites.add.useMutation();
  const removeFavoriteMutation = trpc.favorites.remove.useMutation();

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      stripePriceId: product.stripePriceId || '',
      quantity,
      price: product.price,
      name: product.name,
      imageUrl: product.imageUrl || undefined,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!productId) return;

    if (isFav) {
      removeFavoriteMutation.mutate(productId);
    } else {
      toggleFavoriteMutation.mutate(productId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <MiniLoader />
      </div>
    );
  }

  if (!product || !productId) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header
            cartCount={cartItems}
            isAuthenticated={isAuthenticated}
            onLoginClick={() => (window.location.href = '/login')}
            onLogoutClick={logout}
          />
          <div className="container py-24 text-center space-y-4">
            <h1 className="text-2xl font-serif font-light">Product Not Found</h1>
            <Link href="/shop">
              <motion.a className="inline-flex items-center gap-2 text-accent font-light hover:text-accent/80 transition-colors cursor-pointer text-sm">
                <ChevronLeft size={16} />
                Back to Collection
              </motion.a>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const priceInDollars = (product.price / 100).toFixed(2);
  const productImages = [product.imageUrl, product.imageUrl, product.imageUrl].filter(Boolean);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header
          cartCount={cartItems}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => (window.location.href = '/login')}
          onLogoutClick={logout}
        />

        {/* Breadcrumb */}
        <div className="border-b border-border/30">
          <div className="container py-4">
            <div className="flex items-center gap-2 text-xs font-light text-muted-foreground/60">
              <Link href="/shop">
                <a className="hover:text-foreground transition-colors cursor-pointer">Shop</a>
              </Link>
              <span>/</span>
              {product.category && (
                <>
                  <Link href={`/shop?category=${product.category}`}>
                    <a className="hover:text-foreground transition-colors cursor-pointer">{product.category}</a>
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground/80">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Product Section */}
        <section className="py-12 md:py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16"
            >
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative overflow-hidden aspect-[3/4] bg-cream"
                  style={{ borderRadius: '2px' }}
                >
                  {productImages[selectedImageIndex] ? (
                    <motion.img
                      key={selectedImageIndex}
                      src={productImages[selectedImageIndex] || ''}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <span className="font-light">No Image</span>
                    </div>
                  )}

                  {/* Favorite Button */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleFavorite}
                    className="absolute top-4 right-4 p-3 bg-card/90 backdrop-blur-sm hover:bg-card transition-all shadow-sm"
                    style={{ borderRadius: '2px' }}
                  >
                    <Heart
                      size={20}
                      className={`transition-all ${
                        isFav ? 'fill-accent text-accent' : 'text-foreground/40 hover:text-accent'
                      }`}
                    />
                  </motion.button>

                  {/* Limited Badge */}
                  {product.category === 'Limited Edition' && (
                    <div
                      className="absolute top-4 left-4 px-4 py-1.5 bg-foreground/80 backdrop-blur-sm text-[10px] font-light tracking-[0.2em] text-background uppercase"
                      style={{ borderRadius: '2px' }}
                    >
                      Limited Edition
                    </div>
                  )}
                </motion.div>

                {/* Thumbnails */}
                {productImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {productImages.map((img, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square overflow-hidden border transition-all ${
                          selectedImageIndex === index
                            ? 'border-accent'
                            : 'border-border/30 hover:border-accent/40'
                        }`}
                        style={{ borderRadius: '2px' }}
                      >
                        <img
                          src={img || ''}
                          alt={`${product.name || 'Product'} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-8 lg:py-4"
              >
                {/* Header */}
                <div className="space-y-4">
                  {product.category && product.category !== 'Limited Edition' && (
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                      {product.category}
                    </p>
                  )}
                  <h1 className="text-3xl md:text-4xl font-serif font-light leading-tight text-foreground">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-serif font-light text-accent">
                      ${priceInDollars}
                    </span>
                  </div>
                </div>

                {/* Handmade badge */}
                <div className="badge-handmade">
                  <Scissors size={12} />
                  100% Handmade
                </div>

                {/* Description */}
                {product.description && (
                  <div className="space-y-3 pb-6 border-b border-border/30">
                    <p className="text-muted-foreground font-light leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Quantity + Add to Cart */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-light uppercase tracking-[0.25em] text-muted-foreground/60">
                      Quantity
                    </label>
                    <div className="flex items-center border border-border/40 w-fit" style={{ borderRadius: '2px' }}>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 font-light hover:bg-cream transition-colors"
                      >
                        −
                      </motion.button>
                      <span className="px-6 py-3 font-light text-center min-w-[3rem] border-x border-border/40">
                        {quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-3 font-light hover:bg-cream transition-colors"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleAddToCart}
                    className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
                  >
                    {addedToCart ? (
                      <>
                        <Check size={18} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Add to Cart
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    className="btn-outline w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <Share2 size={16} />
                    Share
                  </motion.button>
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-1 gap-4 pt-6 border-t border-border/30">
                  {[
                    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
                    { icon: Shield, title: 'Secure Checkout', desc: 'SSL encrypted payment' },
                    { icon: RotateCcw, title: 'Easy Returns', desc: '30-day guarantee' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-cream border border-border/20">
                        <item.icon size={16} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-light">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground/60 font-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
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
