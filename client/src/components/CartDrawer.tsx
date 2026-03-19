import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useCartStore } from '@/stores/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const totalPrice = getTotalPrice();
  const totalPriceInDollars = (totalPrice / 100).toFixed(2);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 flex flex-col shadow-2xl border-l border-border/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-accent" />
                <h2 className="text-xl font-serif font-light">Your Cart</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-accent/5 rounded-full transition-colors"
              >
                <X size={20} className="text-foreground/60" />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4"
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-cream border border-border/30">
                    <ShoppingBag size={24} className="text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-foreground font-serif font-light text-lg">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground/60 mt-1 font-light">
                      Discover our handcrafted collection
                    </p>
                  </div>
                  <Link href="/shop">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      onClick={onClose}
                      className="btn-primary text-sm cursor-pointer"
                    >
                      Browse Collection
                    </motion.a>
                  </Link>
                </motion.div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 p-4 border border-border/30 bg-card"
                    style={{ borderRadius: '2px' }}
                  >
                    {/* Image */}
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover flex-shrink-0"
                        style={{ borderRadius: '2px' }}
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-light text-sm line-clamp-2 leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-sm text-accent mt-1 font-light">
                        ${(item.price / 100).toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-0 mt-3 border border-border/30 w-fit" style={{ borderRadius: '2px' }}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                          }
                          className="px-2.5 py-1 text-sm hover:bg-cream transition-colors"
                        >
                          −
                        </motion.button>
                        <span className="px-3 py-1 text-sm text-center font-light border-x border-border/30">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1 text-sm hover:bg-cream transition-colors"
                        >
                          +
                        </motion.button>
                      </div>
                    </div>

                    {/* Remove */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 self-start hover:bg-destructive/5 transition-colors text-muted-foreground/40 hover:text-destructive"
                      style={{ borderRadius: '2px' }}
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/50 p-6 space-y-5">
                {/* Subtotal */}
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-light text-muted-foreground uppercase tracking-[0.1em]">Subtotal</span>
                  <span className="text-2xl font-serif font-light text-accent">
                    ${totalPriceInDollars}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground/50 font-light flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Shipping calculated at checkout
                </p>

                {/* Checkout */}
                <Link href="/checkout">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="btn-primary w-full text-center block cursor-pointer py-4"
                  >
                    Proceed to Checkout
                  </motion.a>
                </Link>

                {/* Continue Shopping */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="btn-outline w-full"
                >
                  Continue Shopping
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
