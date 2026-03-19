import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { Sparkles } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';

export default function Privacy() {
  usePageMeta({ title: 'Privacy Policy', description: 'Princess Made privacy policy — how we collect, use and protect your personal information.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header
          cartCount={cartItems}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => (window.location.href = '/login')}
          onLogoutClick={logout}
        />

        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 gradient-blush opacity-30" />
          <div className="absolute inset-0 texture-linen" />
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <p className="font-script text-xl text-accent">Your Privacy Matters</p>
              <h1 className="text-4xl md:text-6xl font-serif font-light">Privacy Policy</h1>
              <p className="text-muted-foreground font-light max-w-lg mx-auto">
                How we collect, use and protect your personal information.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <div className="container max-w-3xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              {/* Last Updated */}
              <motion.p variants={itemVariants} className="text-sm text-muted-foreground font-light">
                Last updated: March 2026
              </motion.p>

              {/* Introduction */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-2xl font-serif font-light">Introduction</h2>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Princess Made ("we", "us", or "our") is committed to protecting your personal information
                  and your right to privacy. This Privacy Policy explains how we collect, use, disclose and
                  safeguard your information when you visit our website and make purchases from us. We comply
                  with the Australian Privacy Principles (APPs) contained in the Privacy Act 1988 (Cth).
                </p>
              </motion.div>

              {/* Information We Collect */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Information We Collect</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We collect personal information that you voluntarily provide to us when you place an order,
                  create an account, or contact us. This includes:
                </p>
                <ul className="space-y-2 ml-4">
                  {[
                    'Name and contact details (email address, phone number)',
                    'Shipping and billing address',
                    'Account login credentials (email and password, securely hashed)',
                    'Order history and preferences',
                    'Payment information — processed securely through Stripe; we do not store your card details',
                    'Communications you send to us (emails, messages)',
                  ].map((item, i) => (
                    <li key={i} className="text-muted-foreground font-light leading-relaxed flex items-start gap-2">
                      <span className="text-accent mt-1.5 text-xs">&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* How We Use Your Information */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">How We Use Your Information</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="space-y-2 ml-4">
                  {[
                    'Processing and fulfilling your orders',
                    'Sending order confirmations, shipping updates and delivery notifications',
                    'Communicating with you about your orders or enquiries',
                    'Managing your account and providing customer support',
                    'Improving our website, products and services',
                    'Complying with legal obligations',
                  ].map((item, i) => (
                    <li key={i} className="text-muted-foreground font-light leading-relaxed flex items-start gap-2">
                      <span className="text-accent mt-1.5 text-xs">&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Third-Party Services */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Third-Party Services</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We use trusted third-party services to operate our business. These providers only have access
                  to the information necessary to perform their functions and are obligated to protect your data:
                </p>
                <div className="space-y-4 pt-2">
                  {[
                    {
                      name: 'Stripe',
                      purpose: 'Payment processing. Your payment details are handled directly by Stripe and are never stored on our servers. Stripe is PCI-DSS compliant.',
                    },
                    {
                      name: 'Resend',
                      purpose: 'Transactional emails including order confirmations, shipping notifications and password resets.',
                    },
                    {
                      name: 'Australia Post (AusPost)',
                      purpose: 'Order shipping and delivery. We share your name and shipping address with AusPost to fulfil deliveries.',
                    },
                  ].map((service, i) => (
                    <div key={i} className="pb-4 border-b border-border/20 last:border-0 last:pb-0">
                      <p className="font-serif font-light">{service.name}</p>
                      <p className="text-sm text-muted-foreground font-light mt-1 leading-relaxed">{service.purpose}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Cookies */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Cookies</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We use essential cookies and local storage to keep you signed in, maintain your shopping cart
                  and ensure the website functions properly. We do not use third-party tracking or advertising
                  cookies. By using our website, you consent to the use of these essential cookies.
                </p>
              </motion.div>

              {/* Data Retention */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Data Retention</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We retain your personal information for as long as your account is active or as needed to
                  provide you with our services. Order records are kept for a minimum period as required by
                  Australian tax and consumer law. If you request account deletion, we will remove your
                  personal data within 30 days, except where we are legally required to retain it.
                </p>
              </motion.div>

              {/* Your Rights */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Your Rights</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Under the Australian Privacy Principles, you have the right to:
                </p>
                <ul className="space-y-2 ml-4">
                  {[
                    'Access the personal information we hold about you',
                    'Request correction of inaccurate or outdated information',
                    'Request deletion of your personal data',
                    'Withdraw consent for marketing communications at any time',
                    'Lodge a complaint with the Office of the Australian Information Commissioner (OAIC) if you believe your privacy has been breached',
                  ].map((item, i) => (
                    <li key={i} className="text-muted-foreground font-light leading-relaxed flex items-start gap-2">
                      <span className="text-accent mt-1.5 text-xs">&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground font-light leading-relaxed">
                  To exercise any of these rights, please contact us using the details below.
                </p>
              </motion.div>

              {/* Data Security */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Data Security</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We take reasonable steps to protect your personal information from misuse, interference, loss,
                  unauthorised access, modification and disclosure. All data is transmitted over HTTPS and
                  passwords are securely hashed. However, no method of transmission over the Internet is 100%
                  secure, and we cannot guarantee absolute security.
                </p>
              </motion.div>

              {/* Changes to This Policy */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Changes to This Policy</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We may update this Privacy Policy from time to time. Any changes will be posted on this page
                  with an updated revision date. We encourage you to review this policy periodically.
                </p>
              </motion.div>

              {/* Contact */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Contact Us</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  If you have any questions about this Privacy Policy or wish to make a privacy-related request,
                  please contact us at:
                </p>
                <div className="border border-border/30 p-6 space-y-2" style={{ borderRadius: '2px' }}>
                  <p className="font-serif font-light">Princess Made</p>
                  <p className="text-sm text-muted-foreground font-light">
                    Email:{' '}
                    <a href="mailto:princessmadefashion@gmail.com" className="text-accent hover:underline">
                      princessmadefashion@gmail.com
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground font-light">
                    Instagram:{' '}
                    <a
                      href="https://www.instagram.com/princessmadefashion/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      @princessmadefashion
                    </a>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
