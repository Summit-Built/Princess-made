import { X, ShoppingBag, Trash2, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useCartStore } from '@/stores/cartStore';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

  // Animate in after mount for CSS transition
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 flex flex-col shadow-2xl border-l border-border/30 transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-accent" />
            <h2 className="text-xl font-serif font-light">Your Cart</h2>
            {items.length > 0 && (
              <span className="text-xs text-muted-foreground/60 font-light">
                ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/5 rounded-full transition-colors hover:scale-[1.08] active:scale-95"
          >
            <X size={20} className="text-foreground/60" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-cream border border-border/30">
                <ShoppingBag size={28} className="text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <p className="text-foreground font-serif font-light text-lg">Your cart is empty</p>
                <p className="text-sm text-muted-foreground/60 font-light max-w-[240px]">
                  Discover our handcrafted collection of unique, made-with-love pieces
                </p>
              </div>
              <Link href="/shop" onClick={onClose} className="btn-primary text-sm cursor-pointer inline-flex items-center gap-2">
                <Sparkles size={14} />
                Start Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4 border border-border/30 bg-card"
                style={{ borderRadius: '2px' }}
              >
                {/* Image */}
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                    style={{ borderRadius: '2px' }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 flex-shrink-0 bg-cream flex items-center justify-center"
                    style={{ borderRadius: '2px' }}
                  >
                    <ShoppingBag size={20} className="text-muted-foreground/20" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-light text-sm line-clamp-2 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-sm text-accent mt-1 font-light">
                    A${(item.price / 100).toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-0 mt-3 border border-border/30 w-fit" style={{ borderRadius: '2px' }}>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                      }
                      className="px-2.5 py-1 text-sm hover:bg-cream transition-colors active:scale-95"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm text-center font-light border-x border-border/30 min-w-[36px]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2.5 py-1 text-sm hover:bg-cream transition-colors active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-1.5 self-start hover:bg-destructive/5 transition-colors text-muted-foreground/40 hover:text-destructive hover:scale-110 active:scale-95"
                  style={{ borderRadius: '2px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/50 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-baseline justify-between pt-2">
              <span className="text-sm font-light text-muted-foreground uppercase tracking-[0.1em]">Subtotal</span>
              <span className="text-2xl font-serif font-light text-accent">
                A${totalPriceInDollars}
              </span>
            </div>

            <p className="text-xs text-muted-foreground/50 font-light flex items-center gap-1.5">
              <Sparkles size={12} />
              Shipping calculated at checkout
            </p>

            {/* Checkout */}
            <Link href="/checkout" onClick={onClose} className="btn-primary w-full text-center block cursor-pointer py-4">
              Proceed to Checkout
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="btn-outline w-full active:scale-[0.98]"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
