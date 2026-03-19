import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Link } from 'wouter';

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
  stripePriceId: string;
  images: string[];
}

interface ProductCardProps {
  product: StripeProduct;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  isFavorited?: boolean;
  isLoading?: boolean;
}

export const ProductCard = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorited = false,
  isLoading = false,
}: ProductCardProps) => {
  const priceInDollars = (product.price / 100).toFixed(2);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (justAdded || isLoading) return;
    onAddToCart?.();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      className="group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full flex flex-col bg-card border border-border/60 hover:border-accent/30 transition-all duration-500 overflow-hidden" style={{ borderRadius: '2px' }}>
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[3/4]">
          {product.imageUrl ? (
            <Link href={`/product/${product.id}`}>
              <a className="block w-full h-full cursor-pointer" aria-label={`View ${product.name}`}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                  loading="lazy"
                />
              </a>
            </Link>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream">
              <span className="text-sm text-muted-foreground/40 font-light">No Image</span>
            </div>
          )}

          {/* Quick actions overlay - visible on hover (desktop) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-foreground/10 backdrop-blur-[2px] hidden md:flex items-end justify-center pb-6 gap-3"
              >
                <Link href={`/product/${product.id}`}>
                  <motion.a
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="p-3 bg-card/95 backdrop-blur-sm hover:bg-card transition-all shadow-sm cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ borderRadius: '2px' }}
                    aria-label={`View ${product.name} details`}
                  >
                    <Eye size={18} className="text-foreground" />
                  </motion.a>
                </Link>
                <motion.button
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  onClick={handleAddToCart}
                  disabled={isLoading || justAdded}
                  className="p-3 bg-accent/95 backdrop-blur-sm hover:bg-accent transition-all shadow-sm disabled:opacity-70 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  style={{ borderRadius: '2px' }}
                  aria-label={justAdded ? 'Added to cart' : `Add ${product.name} to cart`}
                >
                  <AnimatePresence mode="wait">
                    {justAdded ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check size={18} className="text-accent-foreground" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="bag"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <ShoppingBag size={18} className="text-accent-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile: Quick add to cart button - always visible at bottom */}
          <div className="md:hidden absolute bottom-0 left-0 right-0">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={isLoading || justAdded}
              className="w-full py-2.5 bg-accent/90 backdrop-blur-sm text-accent-foreground text-xs font-light tracking-[0.1em] uppercase flex items-center justify-center gap-2 disabled:opacity-70 min-h-[44px]"
              aria-label={justAdded ? 'Added to cart' : `Add ${product.name} to cart`}
            >
              {justAdded ? (
                <>
                  <Check size={14} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  Quick Add
                </>
              )}
            </motion.button>
          </div>

          {/* Favorite Button - always visible */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 p-2.5 bg-card/90 backdrop-blur-sm hover:bg-card transition-all shadow-sm z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ borderRadius: '2px' }}
            aria-label={isFavorited ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
            aria-pressed={isFavorited}
          >
            <Heart
              size={16}
              className={`transition-all duration-200 ${
                isFavorited
                  ? 'fill-accent text-accent'
                  : 'text-foreground/40 hover:text-accent'
              }`}
            />
          </motion.button>

          {/* Category / Limited Badge */}
          {product.category === 'Limited Edition' && (
            <div
              className="absolute top-3 left-3 px-3 py-1 bg-foreground/80 backdrop-blur-sm text-[10px] font-light tracking-[0.2em] text-background uppercase shadow-sm"
              style={{ borderRadius: '2px' }}
              aria-label="Limited edition"
            >
              Limited
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 md:p-5 space-y-2">
          {/* Category */}
          {product.category && product.category !== 'Limited Edition' && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">
              {product.category}
            </p>
          )}

          {/* Product Name */}
          <Link href={`/product/${product.id}`}>
            <a className="cursor-pointer">
              <h3 className="font-serif text-sm md:text-base font-light leading-snug text-foreground group-hover:text-accent transition-colors line-clamp-2">
                {product.name}
              </h3>
            </a>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price */}
          <div className="pt-3 border-t border-border/40 flex items-baseline justify-between">
            <span className="text-base md:text-lg font-serif font-light text-accent">
              A${priceInDollars}
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 font-light hidden sm:inline">
              Handmade
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* Skeleton version for loading state */
export const ProductCardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="p-4 md:p-5 space-y-3">
        <div className="skeleton-text-sm w-16" style={{ animationDelay: '0.1s' }} />
        <div className="skeleton-text w-3/4" style={{ animationDelay: '0.2s' }} />
        <div className="skeleton-text w-1/2" style={{ animationDelay: '0.3s' }} />
        <div className="pt-3 border-t border-border/20">
          <div className="skeleton-text w-20" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};
