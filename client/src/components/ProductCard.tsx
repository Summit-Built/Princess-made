import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Check } from 'lucide-react';
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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [localFavorited, setLocalFavorited] = useState(isFavorited);
  const onImgLoad = useCallback(() => setImgLoaded(true), []);

  // Sync when server state catches up
  useEffect(() => {
    setLocalFavorited(isFavorited);
  }, [isFavorited]);

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
    setLocalFavorited(!localFavorited);
    onToggleFavorite?.();
  };

  return (
    <Link href={`/product/${product.id}`} className="block h-full cursor-pointer" aria-label={`View ${product.name}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
        className="group h-full"
      >
        <div className="h-full flex flex-col bg-card border border-border/60 hover:border-accent/30 transition-all duration-500 overflow-hidden" style={{ borderRadius: '2px' }}>
          {/* Image Container */}
          <div className="relative overflow-hidden aspect-[3/4]">
            {product.imageUrl ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 bg-cream animate-skeleton" />
                )}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={533}
                  onLoad={onImgLoad}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cream">
                <span className="text-sm text-muted-foreground/40 font-light">No Image</span>
              </div>
            )}

            {/* Desktop: Add to cart button on hover */}
            <div className="absolute bottom-0 left-0 right-0 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleAddToCart}
                disabled={isLoading || justAdded}
                className="w-full py-3 bg-accent/95 text-accent-foreground text-xs font-light tracking-[0.12em] uppercase flex items-center justify-center gap-2 hover:bg-accent transition-colors disabled:opacity-70 min-h-[44px] cursor-pointer"
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
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Mobile: Quick add to cart button - always visible at bottom */}
            <div className="md:hidden absolute bottom-0 left-0 right-0">
              <button
                onClick={handleAddToCart}
                disabled={isLoading || justAdded}
                className="w-full py-2.5 bg-accent/90 text-accent-foreground text-xs font-light tracking-[0.1em] uppercase flex items-center justify-center gap-2 disabled:opacity-70 min-h-[44px] cursor-pointer"
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
              </button>
            </div>

            {/* Favorite Button - always visible, instant visual response */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-3 right-3 p-2.5 bg-card/90 backdrop-blur-sm hover:bg-card transition-all shadow-sm z-10 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 cursor-pointer"
              style={{ borderRadius: '2px' }}
              aria-label={localFavorited ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
              aria-pressed={localFavorited}
            >
              <Heart
                size={16}
                className={`transition-all duration-150 ${
                  localFavorited
                    ? 'fill-accent text-accent scale-110'
                    : 'text-foreground/40 hover:text-accent'
                }`}
              />
            </button>

            {/* Category / Limited Badge */}
            {product.category === 'Limited Edition' && (
              <div
                className="absolute top-3 left-3 px-3 py-1 bg-foreground/80 backdrop-blur-sm text-[10px] font-light tracking-[0.2em] text-background uppercase shadow-sm"
                style={{ borderRadius: '2px' }}
                role="img" aria-label="Limited edition"
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
            <h3 className="font-serif text-sm md:text-base font-light leading-snug text-foreground group-hover:text-accent transition-colors line-clamp-2">
              {product.name}
            </h3>

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
    </Link>
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
