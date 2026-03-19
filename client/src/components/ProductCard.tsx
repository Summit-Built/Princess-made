import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      className="group h-full"
    >
      <div className="h-full flex flex-col bg-card border border-border/60 hover:border-accent/30 transition-all duration-500 overflow-hidden" style={{ borderRadius: '2px' }}>
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[3/4]">
          {product.imageUrl ? (
            <Link href={`/product/${product.id}`}>
              <a className="block w-full h-full cursor-pointer">
                <motion.img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </a>
            </Link>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream">
              <span className="text-sm text-muted-foreground/40 font-light">No Image</span>
            </div>
          )}

          {/* Quick actions overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-foreground/10 backdrop-blur-[2px] flex items-end justify-center pb-6 gap-3 transition-opacity"
          >
            <Link href={`/product/${product.id}`}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-card/95 backdrop-blur-sm hover:bg-card transition-all shadow-sm cursor-pointer"
                style={{ borderRadius: '2px' }}
                title="View Details"
              >
                <Eye size={18} className="text-foreground" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddToCart}
              disabled={isLoading}
              className="p-3 bg-accent/95 backdrop-blur-sm hover:bg-accent transition-all shadow-sm disabled:opacity-50"
              style={{ borderRadius: '2px' }}
              title="Add to Cart"
            >
              <ShoppingBag size={18} className="text-accent-foreground" />
            </motion.button>
          </motion.div>

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleFavorite}
            className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur-sm hover:bg-card transition-all shadow-sm z-10"
            style={{ borderRadius: '2px' }}
          >
            <Heart
              size={16}
              className={`transition-all ${
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
            >
              Limited
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5 space-y-2">
          {/* Category */}
          {product.category && product.category !== 'Limited Edition' && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">
              {product.category}
            </p>
          )}

          {/* Product Name */}
          <Link href={`/product/${product.id}`}>
            <a className="cursor-pointer">
              <h3 className="font-serif text-base font-light leading-snug text-foreground group-hover:text-accent transition-colors line-clamp-2">
                {product.name}
              </h3>
            </a>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price */}
          <div className="pt-3 border-t border-border/40 flex items-baseline justify-between">
            <span className="text-lg font-serif font-light text-accent">
              A${priceInDollars}
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 font-light">
              Handmade
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
