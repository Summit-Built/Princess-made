import { ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { CartDrawer } from './CartDrawer';

const promoMessages = [
  'Handmade with love — Free shipping on orders over A$50',
  'New arrivals just dropped — Shop now',
  'Each piece is one of a kind ✨',
];

function PromoBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % promoMessages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-accent/5 border-b border-accent/10 hidden md:block">
      <div className="container flex items-center justify-center h-9 relative overflow-hidden">
        {promoMessages.map((msg, i) => (
          <p
            key={i}
            className={`absolute text-[11px] sm:text-sm tracking-[0.2em] uppercase text-muted-foreground font-light transition-opacity duration-500 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export const Header = ({
  cartCount = 0,
  isAuthenticated = false,
  onLoginClick,
  onLogoutClick,
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [location] = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50"
      role="banner"
    >
      {/* Top bar — rotating messages */}
      <PromoBar />

      <div className="container flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <Link href="/" aria-label="Princess Made - Home">
          <div className="flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform">
            <img
              src="/princess-made-logo.png"
              alt="Princess Made"
              width={160}
              height={50}
              className="h-8 md:h-10 w-auto"
              style={{ filter: 'invert(0.35) sepia(1) saturate(2.5) hue-rotate(330deg) brightness(0.75)' }}
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[13px] font-light tracking-[0.15em] uppercase transition-colors cursor-pointer relative py-1 ${
                isActive(link.href)
                  ? 'text-accent'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
              {isActive(link.href) && (
                <div className="absolute -bottom-1 left-0 right-0 h-px bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Favorites */}
          {isAuthenticated && (
            <Link href="/dashboard" aria-label="My favorites">
              <div className="p-2.5 hover:bg-accent/5 rounded-full transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-[1.08] active:scale-95 transition-transform">
                <Heart size={18} className="text-foreground/70" />
              </div>
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 hover:bg-accent/5 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-[1.08] active:scale-95"
            aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} item${cartCount !== 1 ? 's' : ''}` : ', empty'}`}
          >
            <ShoppingBag size={18} className="text-foreground/70" />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-accent-foreground text-[10px] font-medium rounded-full flex items-center justify-center pointer-events-none animate-[scale-in_0.2s_ease-out]"
                aria-hidden="true"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* User Account */}
          {isAuthenticated ? (
            <Link href="/dashboard" aria-label="My account">
              <div className="p-2.5 hover:bg-accent/5 rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-[1.08] active:scale-95">
                <User size={18} className="text-foreground/70" />
              </div>
            </Link>
          ) : (
            <button
              onClick={onLoginClick}
              className="hidden md:inline-flex px-5 py-2 text-[13px] font-light tracking-[0.1em] uppercase border border-accent/30 text-foreground hover:bg-accent hover:text-accent-foreground transition-all min-h-[44px] items-center active:scale-[0.98]"
              style={{ borderRadius: '2px' }}
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 hover:bg-accent/5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={20} className="text-foreground" />
            ) : (
              <Menu size={20} className="text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 top-16 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <nav
            className="md:hidden absolute left-0 right-0 top-full border-t border-border/50 bg-background shadow-lg z-50"
            aria-label="Mobile navigation"
          >
            <div className="container py-6 space-y-1">
              {/* Promo bar for mobile */}
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60 font-light text-center pb-4 border-b border-border/30 mb-2">
                Free shipping on orders over A$50
              </p>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between py-3.5 text-sm font-light tracking-[0.1em] uppercase transition-colors cursor-pointer min-h-[44px] ${
                    isActive(link.href)
                      ? 'text-accent'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
                  )}
                </Link>
              ))}

              <div className="pt-4 border-t border-border/30 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-3.5 text-sm font-light tracking-[0.1em] uppercase text-foreground/70 hover:text-foreground cursor-pointer min-h-[44px]"
                    >
                      <User size={16} />
                      My Account
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-3.5 text-sm font-light tracking-[0.1em] uppercase text-foreground/70 hover:text-foreground cursor-pointer min-h-[44px]"
                    >
                      <Heart size={16} />
                      My Favorites
                    </Link>
                    <button
                      onClick={() => { onLogoutClick?.(); setIsMenuOpen(false); }}
                      className="btn-outline w-full text-sm py-2.5 mt-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => { onLoginClick?.(); setIsMenuOpen(false); }}
                      className="btn-primary w-full text-sm py-3"
                    >
                      Sign In
                    </button>
                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-center text-sm text-muted-foreground font-light hover:text-accent transition-colors cursor-pointer py-2 min-h-[44px] leading-[44px]"
                    >
                      Create an account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};
