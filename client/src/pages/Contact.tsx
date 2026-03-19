import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { Instagram, Mail, Clock, Sparkles, MessageCircle } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';

export default function Contact() {
  usePageMeta({ title: 'Contact & FAQ', description: 'Get in touch with Princess Made. FAQ about shipping, returns, custom orders and more.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
              <p className="font-script text-xl text-accent">Get in Touch</p>
              <h1 className="text-4xl md:text-6xl font-serif font-light">Contact Us</h1>
              <p className="text-muted-foreground font-light max-w-lg mx-auto">
                We'd love to hear from you — whether it's a question, custom order, or just to say hi!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Instagram DM */}
              <motion.a
                variants={itemVariants}
                href="https://www.instagram.com/princessmadefashion/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4 }}
                className="block border border-border/30 p-8 space-y-4 hover:border-accent/30 transition-all group"
                style={{ borderRadius: '2px' }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
                  <Instagram size={20} className="text-accent" />
                </div>
                <h3 className="text-xl font-serif font-light">Instagram DM</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  The fastest way to reach us! Send us a DM on Instagram and we'll get back to you ASAP.
                </p>
                <p className="text-accent text-sm font-light">@princessmadefashion</p>
              </motion.a>

              {/* Email */}
              <motion.a
                variants={itemVariants}
                href="mailto:princessmadefashion@gmail.com"
                whileHover={{ y: -4 }}
                className="block border border-border/30 p-8 space-y-4 hover:border-accent/30 transition-all group"
                style={{ borderRadius: '2px' }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
                  <Mail size={20} className="text-accent" />
                </div>
                <h3 className="text-xl font-serif font-light">Email</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  For detailed enquiries, custom orders, or wholesale questions.
                </p>
                <p className="text-accent text-sm font-light">princessmadefashion@gmail.com</p>
              </motion.a>

              {/* Custom Orders */}
              <motion.div
                variants={itemVariants}
                className="border border-border/30 p-8 space-y-4"
                style={{ borderRadius: '2px' }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                  <MessageCircle size={20} className="text-accent" />
                </div>
                <h3 className="text-xl font-serif font-light">Custom Orders</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Have something specific in mind? We love bringing your ideas to life!
                  Send us a message with what you're looking for and we'll work together to create
                  something special.
                </p>
              </motion.div>

              {/* Response Time */}
              <motion.div
                variants={itemVariants}
                className="border border-border/30 p-8 space-y-4"
                style={{ borderRadius: '2px' }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                  <Clock size={20} className="text-accent" />
                </div>
                <h3 className="text-xl font-serif font-light">Response Time</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  We typically respond within 24 hours. Since everything is handmade by one person,
                  please be patient during busy periods — we promise we'll get back to you!
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 gradient-warm" />
          <div className="absolute inset-0 texture-linen" />
          <div className="container relative max-w-2xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <motion.p variants={itemVariants} className="font-script text-xl text-accent">
                  Common Questions
                </motion.p>
                <motion.h2 variants={itemVariants} className="text-4xl font-serif font-light">
                  FAQ
                </motion.h2>
              </div>

              <div className="space-y-6">
                {[
                  {
                    q: 'How long does shipping take?',
                    a: 'Orders are typically shipped within 3-5 business days. Since each item is handmade, please allow extra time during busy periods. Australian shipping usually takes 3-7 business days.',
                  },
                  {
                    q: 'Are the products machine washable?',
                    a: 'Yes! All our pouches and cases are machine washable. We recommend using a gentle cycle with cold water and a laundry bag for best results.',
                  },
                  {
                    q: 'Can I request a custom colour or size?',
                    a: 'Absolutely! We love custom orders. Send us a DM on Instagram or email us with your idea and we\'ll let you know what\'s possible.',
                  },
                  {
                    q: 'Do you ship internationally?',
                    a: 'Currently we ship within Australia. International shipping may be available on request — reach out and we\'ll see what we can do!',
                  },
                  {
                    q: 'What is your return policy?',
                    a: 'Since each item is handmade and unique, we don\'t accept returns unless the item arrives damaged. If there\'s an issue with your order, please contact us and we\'ll sort it out.',
                  },
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="pb-6 border-b border-border/20 last:border-0"
                  >
                    <h3 className="font-serif font-light text-lg mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
