import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRoute, Link } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { MiniLoader } from '@/components/LoadingScreen';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Heart, ShoppingBag, Check, ChevronLeft, Share2, Shield, Scissors, Star } from 'lucide-react';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={`transition-colors ${(hovered || value) >= star ? 'fill-accent text-accent' : 'text-border'}`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ productId, productName }: { productId: string; productName: string }) {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: reviews = [] } = trpc.reviews.listByProduct.useQuery(productId);
  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setAuthorName(''); setRating(0); setComment('');
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a star rating'); return; }
    createReview.mutate({ productId, productName, authorName, rating, comment });
  };

  const avgRating = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
    : 0;

  return (
    <section className="py-16 md:py-20 border-t border-border/30">
      <div className="container max-w-3xl">
        <div className="space-y-10">
          {/* Header */}
          <div className="flex items-baseline justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-light">Customer Reviews</h2>
              {reviews.length > 0 && (
                <p className="text-sm text-muted-foreground font-light">
                  {avgRating} / 5 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Existing reviews */}
          {reviews.length > 0 && (
            <div className="space-y-5">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 border border-border/30 space-y-3" style={{ borderRadius: '2px' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={13} className={s <= review.rating ? 'fill-accent text-accent' : 'text-border'} />
                      ))}
                    </div>
                    <span className="text-sm font-serif font-light">{review.authorName}</span>
                    <span className="text-xs text-muted-foreground/50 font-light ml-auto">
                      {new Date(review.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Review form */}
          <div className="border border-border/30 p-6 space-y-5" style={{ borderRadius: '2px' }}>
            <h3 className="text-lg font-serif font-light">Write a Review</h3>

            {submitted ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-light py-2">
                <Check size={16} className="text-accent" />
                Thank you! Your review has been submitted and will appear once approved.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">Your Rating *</label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">Your Name *</label>
                  <input
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Sarah"
                    className="w-full px-4 py-3 border border-border/40 bg-background text-sm font-light focus:outline-none focus:border-accent transition-colors"
                    style={{ borderRadius: '2px' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">Review *</label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-3 border border-border/40 bg-background text-sm font-light focus:outline-none focus:border-accent transition-colors resize-none"
                    style={{ borderRadius: '2px' }}
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={createReview.isPending}
                  className="btn-primary px-8 py-3 text-sm disabled:opacity-60"
                >
                  {createReview.isPending ? 'Submitting…' : 'Submit Review'}
                </motion.button>
                <p className="text-[11px] text-muted-foreground/50 font-light">Reviews are moderated before publishing.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const productId = params?.id ?? undefined;

  const cartItems = useCartStore((state) => state.getTotalItems());
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated, logout } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const { data: product, isLoading } = trpc.products.getById.useQuery(productId || '', {
    enabled: !!productId,
  });

  usePageMeta({
    title: product?.name || 'Product',
    description: product?.description || 'Handmade with love by princess-made',
  });

  const utils = trpc.useUtils();

  const { data: isFav } = trpc.favorites.isFavorited.useQuery(productId || '', {
    enabled: !!isAuthenticated && !!productId,
  });

  // Fetch related products (same category)
  const { data: relatedProducts } = trpc.products.list.useQuery(
    { category: product?.category },
    { enabled: !!product?.category }
  );

  const toggleFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      utils.favorites.isFavorited.invalidate();
      utils.favorites.list.invalidate();
      toast.success('Added to favorites');
    },
  });
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.isFavorited.invalidate();
      utils.favorites.list.invalidate();
      toast.success('Removed from favorites');
    },
  });

  const handleAddToCart = () => {
    if (!product) return;

    if (hasVariants && !selectedVariant) {
      toast.error('Please select a style before adding to cart');
      return;
    }

    const cartId = selectedVariant ? `${product.id}-${selectedVariant}` : product.id;
    const cartName = selectedVariant ? `${product.name} – ${selectedVariant}` : product.name;

    addItem({
      productId: cartId,
      stripePriceId: product.stripePriceId || '',
      quantity,
      price: activePrice,
      name: cartName,
      imageUrl: product.imageUrl || undefined,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    toast.success(`${cartName} added to cart`);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast('Sign in to save favorites', {
        action: {
          label: 'Sign In',
          onClick: () => { window.location.href = '/login'; },
        },
      });
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
            <Link href="/shop" className="inline-flex items-center gap-2 text-accent font-light hover:text-accent/80 transition-colors cursor-pointer text-sm">
              <ChevronLeft size={16} />
              Back to Collection
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const variantEntries = Object.entries(product.variants ?? {});
  const hasVariants = variantEntries.length > 0;
  const activePrice = (hasVariants && selectedVariant != null)
    ? (product.variants[selectedVariant] ?? product.price)
    : product.price;
  const priceInDollars = (activePrice / 100).toFixed(2);
  const productImages = product.images && product.images.length > 0
    ? product.images
    : product.imageUrl ? [product.imageUrl] : [];

  // Filter related products to exclude current product, limit to 4
  const filteredRelated = relatedProducts
    ?.filter(p => p.id !== productId)
    .slice(0, 4) || [];

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
              <Link href="/shop" className="hover:text-foreground transition-colors cursor-pointer">Shop</Link>
              <span>/</span>
              {product.category && (
                <>
                  <Link href={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors cursor-pointer">{product.category}</Link>
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
                      A${priceInDollars}
                    </span>
                    <span className="text-xs text-muted-foreground/50 font-light">AUD</span>
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

                {/* Variant Selector */}
                {hasVariants && (
                  <div className="space-y-3 pb-6 border-b border-border/30">
                    <label className="text-[10px] font-light uppercase tracking-[0.25em] text-muted-foreground/60">
                      Style
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variantEntries.map(([name, price]) => (
                        <motion.button
                          key={name}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedVariant(name)}
                          className={`px-4 py-2 text-xs font-light border transition-all ${
                            selectedVariant === name
                              ? 'border-accent bg-accent/10 text-foreground'
                              : 'border-border/40 text-muted-foreground hover:border-accent/50'
                          }`}
                          style={{ borderRadius: '2px' }}
                        >
                          {name}
                          {price !== product.price && (
                            <span className="ml-1.5 text-muted-foreground/60">
                              A${(price / 100).toFixed(2)}
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
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
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard');
                    }}
                    className="btn-outline w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <Share2 size={16} />
                    Share
                  </motion.button>
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-1 gap-4 pt-6 border-t border-border/30">
                  {[
                    { icon: Shield, title: 'Secure Checkout', desc: 'SSL encrypted payment' },
                    { icon: Scissors, title: 'Handmade Quality', desc: 'Crafted with care in Australia' },
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

        {/* Reviews */}
        <ReviewsSection productId={productId} productName={product.name} />

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <section className="py-16 md:py-20 border-t border-border/30">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12 space-y-3"
              >
                <p className="font-script text-xl text-accent">You May Also Like</p>
                <h2 className="text-3xl font-serif font-light">Related Products</h2>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {filteredRelated.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard
                      product={p}
                      onAddToCart={() => {
                        addItem({
                          productId: p.id,
                          stripePriceId: p.stripePriceId || '',
                          quantity: 1,
                          price: p.price,
                          name: p.name,
                          imageUrl: p.imageUrl || undefined,
                        });
                        toast.success(`${p.name} added to cart`);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}
