import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { Sparkles } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqSections = [
  {
    title: 'Products',
    questions: [
      {
        q: 'What materials do you use?',
        a: 'Our products are made from a range of high-quality fabrics including quilted cotton, faux fur, and linen blends. Each material is carefully selected for durability, softness and style. We source our fabrics from trusted Australian and international suppliers.',
      },
      {
        q: 'Are all items truly handmade?',
        a: 'Yes! Every single item is 100% handmade by hand. Each piece is individually cut, sewn and finished with care. Because they are handmade, slight variations between items are normal and part of what makes each piece unique.',
      },
      {
        q: 'How do I care for my product?',
        a: 'Most of our quilted items are machine washable on a gentle cycle with cold water. Faux fur items should be spot-cleaned or hand-washed gently. Always air dry — do not tumble dry. Specific care instructions are included with each product where applicable.',
      },
      {
        q: 'What sizes are your laptop cases?',
        a: 'Our standard laptop cases measure approximately 35cm x 27cm, designed to fit most 13-14 inch laptops. If you need a different size, feel free to contact us about a custom order.',
      },
    ],
  },
  {
    title: 'Orders & Payment',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe, our secure payment processor. Your card details are handled directly by Stripe and never stored on our servers.',
      },
      {
        q: 'Can I modify or cancel my order?',
        a: 'If your order has not yet been dispatched, you can cancel it from your account dashboard or by contacting us as soon as possible. Once an order has been shipped, it cannot be cancelled. Modifications to orders (e.g. changing an item) are not possible once the order is placed.',
      },
      {
        q: 'Do I need an account to place an order?',
        a: 'No — you can check out as a guest. However, creating an account lets you track your orders, save your favourite items, manage shipping addresses, and check out faster next time.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order has been shipped, you will receive an email with tracking information. You can also view your order status by logging into your account and visiting the Orders section of your dashboard.',
      },
    ],
  },
  {
    title: 'Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Orders are typically dispatched within 3–5 business days. Standard domestic delivery via Australia Post takes an additional 3–7 business days. During busy periods, please allow a little extra time as each item is handmade to order.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'International shipping may be available on request. Please contact us with your location and we will provide a shipping quote and estimated delivery timeframe.',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'Due to the handmade nature of our products, we do not accept returns for change of mind. If your item arrives damaged or is significantly different from what was described, please contact us within 7 days of delivery with photos and we will work with you to resolve the issue.',
      },
      {
        q: 'Can I exchange an item?',
        a: 'We do not offer direct exchanges. If your item is faulty or damaged, please contact us and we will arrange a replacement or refund at our discretion.',
      },
      {
        q: 'Are custom orders refundable?',
        a: 'Custom orders are non-refundable and cannot be returned unless the item arrives faulty or damaged. Please confirm all details carefully before placing a custom order.',
      },
    ],
  },
  {
    title: 'Custom Orders',
    questions: [
      {
        q: 'Do you accept custom orders?',
        a: 'Absolutely! We love bringing your ideas to life. Whether you want a specific fabric, colour, or size — get in touch via our Contact page or Instagram DMs and we will work out the details together.',
      },
      {
        q: 'How long do custom orders take?',
        a: 'Custom orders typically take 1–2 weeks to complete, depending on the complexity of the design and current order volume. We will give you an estimated timeframe when you place your order.',
      },
      {
        q: 'Is there an extra cost for custom orders?',
        a: 'Pricing depends on the materials and complexity involved. We will provide a quote before you commit so there are no surprises.',
      },
    ],
  },
];

export default function FAQ() {
  usePageMeta({ title: 'FAQ', description: 'Frequently asked questions about princess-made products, orders, shipping and returns.' });
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
              <p className="font-script text-xl text-accent">Got Questions?</p>
              <h1 className="text-4xl md:text-6xl font-serif font-light">Frequently Asked Questions</h1>
              <p className="text-muted-foreground font-light max-w-lg mx-auto">
                Everything you need to know about our handmade products and how we work.
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
              {faqSections.map((section) => (
                <motion.div key={section.title} variants={itemVariants} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-accent flex-shrink-0" />
                    <h2 className="text-2xl font-serif font-light">{section.title}</h2>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {section.questions.map((item, i) => (
                      <AccordionItem
                        key={i}
                        value={`${section.title}-${i}`}
                        className="border border-border/30 px-6"
                        style={{ borderRadius: '2px' }}
                      >
                        <AccordionTrigger className="text-left font-light hover:no-underline py-5">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-5">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ))}

              {/* Still have questions */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <h2 className="text-2xl font-serif font-light">Still Have Questions?</h2>
                </div>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We are always happy to help! Reach out and we will get back to you as soon as we can.
                </p>
                <div className="border border-border/30 p-6 space-y-2" style={{ borderRadius: '2px' }}>
                  <p className="font-serif font-light">princess-made</p>
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
