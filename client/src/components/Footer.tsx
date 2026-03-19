import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Instagram, Sparkles } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-foreground text-background/80 mt-0"
    >
      {/* Main Footer */}
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 space-y-5"
          >
            <h3 className="font-script text-3xl text-blush">
              Princess Made
            </h3>
            <p className="text-sm text-background/50 font-light leading-relaxed max-w-sm">
              100% handmade bags, crafted with love and care.
              Each piece is a unique work of art, made just for you.
            </p>
            <a
              href="https://www.instagram.com/princessmadefashion/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-background/50 hover:text-blush transition-colors"
            >
              <Instagram size={16} />
              @princessmadefashion
            </a>
          </motion.div>

          {/* Shop */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-5 font-light">Shop</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/shop?category=Laptop%20Cases', label: 'Laptop Cases' },
                { href: '/shop?category=Pouches', label: 'Pouches' },
                { href: '/shop?category=Accessories', label: 'Accessories' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a className="text-background/50 hover:text-blush transition-colors cursor-pointer font-light">
                      {item.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Help */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2"
          >
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-5 font-light">Help</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/contact', label: 'Contact Us' },
                { href: '/faq', label: 'FAQ' },
                { href: '/shipping', label: 'Shipping' },
                { href: '/returns', label: 'Returns' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a className="text-background/50 hover:text-blush transition-colors cursor-pointer font-light">
                      {item.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2"
          >
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-5 font-light">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/about', label: 'Our Story' },
                { href: '/privacy', label: 'Privacy' },
                { href: '/terms', label: 'Terms' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a className="text-background/50 hover:text-blush transition-colors cursor-pointer font-light">
                      {item.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter mini */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-2"
          >
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-5 font-light">Connect</h4>
            <div className="space-y-3">
              <a
                href="https://www.depop.com/princess_made/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-background/50 hover:text-blush transition-colors font-light"
              >
                Depop
              </a>
              <a
                href="https://www.instagram.com/princessmadefashion/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-background/50 hover:text-blush transition-colors font-light"
              >
                Instagram
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/30 font-light"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={12} />
              <p>&copy; {currentYear} Princess Made. All rights reserved.</p>
            </div>
            <p className="tracking-wider uppercase">Handmade in Australia</p>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};
