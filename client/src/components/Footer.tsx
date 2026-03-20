import { useState } from 'react';
import { Link } from 'wouter';
import { Instagram, Sparkles, Mail, ExternalLink, Loader2, Check } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSubscribed, setFooterSubscribed] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setFooterSubscribed(true);
      setFooterEmail('');
      toast.success('Welcome to the Princess Made family!');
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.');
    },
  });

  return (
    <footer
      className="bg-foreground text-background/80 mt-0"
      role="contentinfo"
    >
      {/* Main Footer */}
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 space-y-5">
            <h3 className="font-script text-3xl text-blush">
              Princess Made
            </h3>
            <p className="text-sm text-background/50 font-light leading-relaxed max-w-sm">
              100% handmade bags, crafted with love and care.
              Each piece is a unique work of art, made just for you.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/princessmadefashion/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-background/15 text-background/50 hover:text-blush hover:border-blush/40 transition-all min-w-[44px] min-h-[44px]"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.depop.com/princess_made/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-background/15 text-background/50 hover:text-blush hover:border-blush/40 transition-all min-w-[44px] min-h-[44px]"
                aria-label="Shop on Depop"
              >
                <ExternalLink size={16} />
              </a>
              <a
                href="mailto:princessmadefashion@gmail.com"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-background/15 text-background/50 hover:text-blush hover:border-blush/40 transition-all min-w-[44px] min-h-[44px]"
                aria-label="Email us"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-5 font-light">Shop</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/shop?category=Laptop%20Cases', label: 'Laptop Cases' },
                { href: '/shop?category=Pouches', label: 'Pouches' },
                { href: '/shop?category=Accessories', label: 'Accessories' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-background/50 hover:text-blush transition-colors cursor-pointer font-light py-1 inline-block min-h-[44px] leading-[44px] md:min-h-0 md:leading-normal">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="md:col-span-2">
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-5 font-light">Help</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/contact', label: 'Contact Us' },
                { href: '/faq', label: 'FAQ' },
                { href: '/shipping', label: 'Shipping' },
                { href: '/returns', label: 'Returns' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-background/50 hover:text-blush transition-colors cursor-pointer font-light py-1 inline-block min-h-[44px] leading-[44px] md:min-h-0 md:leading-normal">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-5 font-light">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/about', label: 'Our Story' },
                { href: '/privacy', label: 'Privacy' },
                { href: '/terms', label: 'Terms' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-background/50 hover:text-blush transition-colors cursor-pointer font-light py-1 inline-block min-h-[44px] leading-[44px] md:min-h-0 md:leading-normal">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter in footer */}
          <div className="col-span-2 md:col-span-2">
            <h4 className="text-xs tracking-[0.2em] uppercase text-background/40 mb-5 font-light">Newsletter</h4>
            {footerSubscribed ? (
              <div className="flex items-center gap-2 text-blush text-sm font-light">
                <Check size={14} />
                <span>Subscribed!</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (footerEmail) subscribeMutation.mutate({ email: footerEmail });
                }}
                className="space-y-3"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-background/5 border border-background/15 text-background/80 placeholder:text-background/30 text-sm font-light focus:outline-none focus:border-blush/40 transition-all min-h-[44px]"
                  style={{ borderRadius: '2px' }}
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="w-full px-3 py-2.5 bg-blush/20 border border-blush/30 text-blush text-xs font-light tracking-[0.1em] uppercase hover:bg-blush/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                  style={{ borderRadius: '2px' }}
                >
                  {subscribeMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/30 font-light">
            <div className="flex items-center gap-2">
              <Sparkles size={12} aria-hidden="true" />
              <p>&copy; {currentYear} Princess Made. All rights reserved.</p>
            </div>
            <p className="tracking-wider uppercase">Handmade in Australia</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
