import { motion } from 'framer-motion';
import { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Instagram, Mail, Clock, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { usePageMeta } from '@/lib/usePageMeta';
import { toast } from 'sonner';

export default function Contact() {
  usePageMeta({ title: 'Contact & FAQ', description: 'Get in touch with princess-made. FAQ about shipping, returns, custom orders and more.' });
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitted, setSubmitted] = useState(false);

  const { mutate: sendContact, isPending } = trpc.contact.send.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      toast.success('Message sent! We\'ll get back to you soon.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    sendContact({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim(), website });
  };

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

        {/* Contact Form */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 gradient-blush opacity-20" />
          <div className="absolute inset-0 texture-linen" />
          <div className="container relative max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <p className="font-script text-xl text-accent">Send a Message</p>
                <h2 className="text-4xl font-serif font-light">Contact Form</h2>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                    <CheckCircle2 size={28} className="text-accent" />
                  </div>
                  <h3 className="text-2xl font-serif font-light">Message Sent!</h3>
                  <p className="text-muted-foreground font-light max-w-md mx-auto">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-accent text-sm font-light underline underline-offset-4 hover:text-accent/80 transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot - hidden from real users */}
                  <div className="absolute" style={{ left: '-9999px', position: 'absolute' }} aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="input-elegant"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input-elegant"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-subject" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      placeholder="What's this about?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="input-elegant"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-message" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-light">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      placeholder="Tell us what's on your mind..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={6}
                      className="input-elegant resize-none"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isPending}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPending && <Spinner size={16} />}
                    {isPending ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              )}
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
