import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CartDrawer } from './CartDrawer';

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

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      {/* Top bar */}
      <div className="bg-accent/5 border-b border-accent/10 hidden md:block">
        <div className="container flex items-center justify-center h-8">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">
            Handmade with love — Free shipping on orders over A$50
          </p>
        </div>
      </div>

      <div className="container flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <Link href="/">
          <motion.a
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663031002008/Hy2VZfwLraitLwcA3hcpuJ/Princess(1)_e208d2f4.png"
              alt="Princess Made"
              className="h-10 w-auto"
            />
          </motion.a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <motion.a
                className={`text-[13px] font-light tracking-[0.15em] uppercase transition-colors cursor-pointer relative ${
                  isActive(link.href)
                    ? 'text-accent'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                  />
                )}
              </motion.a>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Favorites */}
          {isAuthenticated && (
            <Link href="/dashboard">
              <motion.a
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-accent/5 rounded-full transition-colors cursor-pointer"
              >
                <Heart size={18} className="text-foreground/70" />
              </motion.a>
            </Link>
          )}

          {/* Cart */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 hover:bg-accent/5 rounded-full transition-colors"
          >
            <ShoppingBag size={18} className="text-foreground/70" />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: [1.3, 1] }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-accent text-accent-foreground text-[10px] font-medium rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>

          {/* User Account */}
          {isAuthenticated ? (
            <Link href="/dashboard">
              <motion.a
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-accent/5 rounded-full transition-colors cursor-pointer"
              >
                <User size={18} className="text-foreground/70" />
              </motion.a>
            </Link>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLoginClick}
              className="hidden md:inline-flex px-5 py-2 text-[13px] font-light tracking-[0.1em] uppercase border border-accent/30 text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
              style={{ borderRadius: '2px' }}
            >
              Sign In
            </motion.button>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 hover:bg-accent/5 rounded-full transition-colors"
          >
            {isMenuOpen ? (
              <X size={20} className="text-foreground" />
            ) : (
              <Menu size={20} className="text-foreground" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-border/50 bg-background overflow-hidden"
          >
            <div className="container py-6 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.a
                    onClick={() => setIsMenuOpen(false)}
                    className={`block py-3 text-sm font-light tracking-[0.1em] uppercase transition-colors cursor-pointer ${
                      isActive(link.href)
                        ? 'text-accent'
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </motion.a>
                </Link>
              ))}

              <div className="pt-4 border-t border-border/30 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard">
                      <motion.a
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-3 text-sm font-light tracking-[0.1em] uppercase text-foreground/70 hover:text-foreground cursor-pointer"
                      >
                        My Account
                      </motion.a>
                    </Link>
                    <motion.button
                      onClick={() => { onLogoutClick?.(); setIsMenuOpen(false); }}
                      className="btn-outline w-full text-sm py-2.5"
                    >
                      Sign Out
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={() => { onLoginClick?.(); setIsMenuOpen(false); }}
                    className="btn-primary w-full text-sm py-2.5"
                  >
                    Sign In
                  </motion.button>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </motion.header>
  );
};
