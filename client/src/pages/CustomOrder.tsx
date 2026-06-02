import { useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';
import { Check, Scissors } from 'lucide-react';

// ─── Shared field components ───────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-[0.18em] text-foreground/70 font-light">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground/50 font-light -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 text-xs font-light border transition-all ${
            value === opt
              ? 'bg-accent text-accent-foreground border-accent'
              : 'border-border/40 text-muted-foreground hover:border-accent/40 hover:text-foreground'
          }`}
          style={{ borderRadius: '2px' }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-4 pb-4 border-b border-accent/10 mb-6">
      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-serif text-accent">{num}</span>
      </div>
      <h2 className="text-lg font-serif font-light">{title}</h2>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function CustomOrder() {
  usePageMeta({ title: 'Custom Order', description: 'Request a custom handmade piece from princess-made.' });
  const cartItems = useCartStore(s => s.getTotalItems());
  const { isAuthenticated, logout } = useAuth();

  const [submitted, setSubmitted] = useState(false);

  // ── Form state ──
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState('Email');

  const [productType, setProductType] = useState('');
  const [productTypeOther, setProductTypeOther] = useState('');
  const [description, setDescription] = useState('');

  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const [outerFabric, setOuterFabric] = useState('');
  const [liningFabric, setLiningFabric] = useState('');

  const [laceStyle, setLaceStyle] = useState('No Lace');

  const [zipperColour, setZipperColour] = useState('');
  const [zipperColourOther, setZipperColourOther] = useState('');
  const [zipperCharm, setZipperCharm] = useState('');
  const [hardwareColour, setHardwareColour] = useState('');

  const [wantsMonogram, setWantsMonogram] = useState('No');
  const [monogramName, setMonogramName] = useState('');
  const [fontChoice, setFontChoice] = useState('');
  const [threadColour, setThreadColour] = useState('');

  const [budget, setBudget] = useState('');
  const [neededByDate, setNeededByDate] = useState('');
  const [isGift, setIsGift] = useState('No');

  const [additionalNotes, setAdditionalNotes] = useState('');

  const [terms, setTerms] = useState([false, false, false, false, false]);

  const submitMutation = trpc.customOrder.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(`Something went wrong: ${err.message}`),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!fullName || !email || !phone || !productType || !description || !zipperColour) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (productType === 'Other' && !productTypeOther) {
      toast.error('Please describe the product type');
      return;
    }
    if (!terms.every(Boolean)) {
      toast.error('Please agree to all terms before submitting');
      return;
    }

    submitMutation.mutate({
      fullName, email, phone, contactMethod,
      productType: productType === 'Other' ? 'Other' : productType,
      productTypeOther,
      description,
      length, width, height,
      outerFabric, liningFabric,
      laceStyle,
      zipperColour,
      zipperColourOther,
      zipperCharm,
      hardwareColour,
      wantsMonogram,
      monogramName,
      fontChoice,
      threadColour,
      budget,
      neededByDate,
      isGift,
      additionalNotes,
    });
  };

  const toggleTerm = (i: number) =>
    setTerms(prev => prev.map((v, idx) => idx === i ? !v : v));

  if (submitted) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header cartCount={cartItems} isAuthenticated={isAuthenticated} onLogoutClick={logout} />
          <section className="py-24 md:py-32">
            <div className="container max-w-lg mx-auto text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                <Check size={28} className="text-accent" />
              </div>
              <h1 className="text-3xl font-serif font-light">Request Received!</h1>
              <p className="text-muted-foreground font-light leading-relaxed">
                Thank you for your custom order request. I'll review your details and be in touch within 1–2 business days with a quote.
              </p>
              <p className="text-sm text-muted-foreground/60 font-light">
                In the meantime, feel free to email any inspiration photos to{' '}
                <a href="mailto:princessmadefashion@gmail.com" className="text-accent underline">
                  princessmadefashion@gmail.com
                </a>
              </p>
              <motion.a
                whileHover={{ scale: 1.02 }}
                href="/shop"
                className="btn-primary inline-flex items-center justify-center min-h-[48px] mt-4"
              >
                Back to Shop
              </motion.a>
            </div>
          </section>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header cartCount={cartItems} isAuthenticated={isAuthenticated} onLogoutClick={logout} />

        {/* Hero */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 gradient-rose-subtle" />
          <div className="absolute inset-0 texture-linen opacity-50" />
          <div className="container relative text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Scissors size={16} className="text-accent" />
              <p className="font-script text-xl text-accent">Made Just for You</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light">Custom Order Request</h1>
            <p className="text-muted-foreground font-light max-w-md mx-auto text-sm sm:text-base">
              Fill in as much detail as you can and I'll get back to you with a quote within 1–2 business days.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="py-10 md:py-14">
          <div className="container max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-10">

              {/* ── 1. Customer Information ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={1} title="Customer Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Full Name" required>
                    <input className="input-elegant w-full" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
                  </Field>
                  <Field label="Email Address" required>
                    <input type="email" className="input-elegant w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                  </Field>
                  <Field label="Phone Number" required>
                    <input type="tel" className="input-elegant w-full" value={phone} onChange={e => setPhone(e.target.value)} placeholder="04XX XXX XXX" />
                  </Field>
                  <Field label="Preferred Contact Method">
                    <RadioGroup name="contact" options={['Email', 'SMS']} value={contactMethod} onChange={setContactMethod} />
                  </Field>
                </div>
              </div>

              {/* ── 2. What Would You Like Made? ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={2} title="What Would You Like Made?" />
                <Field label="Product Type" required>
                  <RadioGroup
                    name="productType"
                    options={['Makeup Pouch', 'Pencil Case', 'Laptop Case', 'Tote Bag', 'Glasses Pouch', 'Kindle Case', 'Other']}
                    value={productType}
                    onChange={setProductType}
                  />
                </Field>
                {productType === 'Other' && (
                  <Field label="Please describe" required>
                    <input className="input-elegant w-full" value={productTypeOther} onChange={e => setProductTypeOther(e.target.value)} placeholder="Describe the item you'd like" />
                  </Field>
                )}
                <Field label="Describe Your Custom Order" required>
                  <textarea
                    className="input-elegant w-full min-h-[120px] resize-y"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Tell me everything! Colours, style, what it's for, any specific requirements..."
                  />
                </Field>
              </div>

              {/* ── 3. Sizing ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={3} title="Sizing" />
                <p className="text-xs text-muted-foreground/60 font-light -mt-2">Leave blank if you'd like the standard size or aren't sure.</p>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Length (cm)">
                    <input type="number" className="input-elegant w-full" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 25" min="0" />
                  </Field>
                  <Field label="Width (cm)">
                    <input type="number" className="input-elegant w-full" value={width} onChange={e => setWidth(e.target.value)} placeholder="e.g. 15" min="0" />
                  </Field>
                  <Field label="Height / Depth (cm)">
                    <input type="number" className="input-elegant w-full" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 5" min="0" />
                  </Field>
                </div>
              </div>

              {/* ── 4. Fabric Selection ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={4} title="Fabric Selection" />
                <p className="text-xs text-muted-foreground/60 font-light -mt-2">
                  Describe the fabric you'd like — colour, texture, pattern, or send inspiration photos to{' '}
                  <a href="mailto:princessmadefashion@gmail.com" className="text-accent underline">princessmadefashion@gmail.com</a>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Outer Fabric">
                    <input className="input-elegant w-full" value={outerFabric} onChange={e => setOuterFabric(e.target.value)} placeholder="e.g. Pink faux fur, floral quilted cotton..." />
                  </Field>
                  <Field label="Lining Fabric">
                    <input className="input-elegant w-full" value={liningFabric} onChange={e => setLiningFabric(e.target.value)} placeholder="e.g. White satin, pink cotton..." />
                  </Field>
                </div>
              </div>

              {/* ── 5. Lace Trim ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={5} title="Lace Trim" />
                <Field label="Choose Lace Style">
                  <RadioGroup
                    name="lace"
                    options={['No Lace', 'Lace Option 1', 'Lace Option 2', 'Lace Option 3']}
                    value={laceStyle}
                    onChange={setLaceStyle}
                  />
                </Field>
              </div>

              {/* ── 6. Hardware & Details ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={6} title="Hardware & Details" />
                <Field label="Zipper Colour" required>
                  <RadioGroup
                    name="zipper"
                    options={['No Zipper', 'White', 'Pink', 'Black', 'Other']}
                    value={zipperColour}
                    onChange={setZipperColour}
                  />
                </Field>
                {zipperColour === 'Other' && (
                  <Field label="Describe zipper colour">
                    <input className="input-elegant w-full" value={zipperColourOther} onChange={e => setZipperColourOther(e.target.value)} placeholder="e.g. Champagne, rose gold..." />
                  </Field>
                )}
                <Field label="Zipper Charm" hint="Describe any charm preference, or leave blank for none">
                  <input className="input-elegant w-full" value={zipperCharm} onChange={e => setZipperCharm(e.target.value)} placeholder="e.g. Pearl charm, bow, leave blank for none" />
                </Field>
                <Field label="Hardware Colour (Optional)">
                  <RadioGroup
                    name="hardware"
                    options={['Gold', 'Silver', 'No preference']}
                    value={hardwareColour || 'No preference'}
                    onChange={v => setHardwareColour(v === 'No preference' ? '' : v)}
                  />
                </Field>
              </div>

              {/* ── 7. Personalisation ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={7} title="Personalisation (Optional)" />
                <Field label="Would you like a monogram?">
                  <RadioGroup name="monogram" options={['No', 'Yes']} value={wantsMonogram} onChange={setWantsMonogram} />
                </Field>
                {wantsMonogram === 'Yes' && (
                  <div className="space-y-5 pl-4 border-l-2 border-accent/20">
                    <Field label="Name / Word to embroider">
                      <input className="input-elegant w-full" value={monogramName} onChange={e => setMonogramName(e.target.value)} placeholder="e.g. Jess, Mum, BFF..." />
                    </Field>
                    <Field label="Font Choice" hint="Describe your preferred font style, or email inspiration photos">
                      <input className="input-elegant w-full" value={fontChoice} onChange={e => setFontChoice(e.target.value)} placeholder="e.g. Script/cursive, block letters, floral..." />
                    </Field>
                    <Field label="Thread Colour" hint="Describe the colour you'd like for the embroidery">
                      <input className="input-elegant w-full" value={threadColour} onChange={e => setThreadColour(e.target.value)} placeholder="e.g. White, dusty pink, gold..." />
                    </Field>
                  </div>
                )}
              </div>

              {/* ── 8. Inspiration ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-4" style={{ borderRadius: '2px' }}>
                <SectionHeader num={8} title="Inspiration" />
                <div className="bg-accent/5 border border-accent/15 p-4 text-sm font-light text-muted-foreground" style={{ borderRadius: '2px' }}>
                  <p>📎 Please email any inspiration photos, fabric samples, or reference images to:</p>
                  <a href="mailto:princessmadefashion@gmail.com" className="text-accent font-light underline mt-1 block">
                    princessmadefashion@gmail.com
                  </a>
                  <p className="mt-2 text-xs text-muted-foreground/60">Include your name in the subject line so I can match it to your request.</p>
                </div>
              </div>

              {/* ── 9. Budget & Timeline ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={9} title="Budget & Timeline" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Budget in mind?" hint="Optional — helps me suggest the best options">
                    <input className="input-elegant w-full" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. Around A$40, flexible..." />
                  </Field>
                  <Field label="Needed by date?">
                    <input type="date" className="input-elegant w-full" value={neededByDate} onChange={e => setNeededByDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </Field>
                </div>
                <Field label="Is this a gift?">
                  <RadioGroup name="gift" options={['No', 'Yes']} value={isGift} onChange={setIsGift} />
                </Field>
              </div>

              {/* ── 10. Additional Notes ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={10} title="Anything Else?" />
                <Field label="Additional notes">
                  <textarea
                    className="input-elegant w-full min-h-[100px] resize-y"
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    placeholder="Anything else you'd like me to know about your custom order?"
                  />
                </Field>
              </div>

              {/* ── 11. Terms & Agreement ── */}
              <div className="border border-border/30 bg-card p-6 sm:p-8 space-y-5" style={{ borderRadius: '2px' }}>
                <SectionHeader num={11} title="Terms & Agreement" />
                <p className="text-xs text-muted-foreground/60 font-light -mt-2">Please read and agree to the following before submitting.</p>
                <div className="space-y-3">
                  {[
                    'I understand custom orders are handmade and may have slight variations.',
                    'I understand colours may vary slightly between screens and real life.',
                    'I understand custom orders are final sale and cannot be returned unless faulty.',
                    'I understand production times may vary depending on workload and material availability.',
                    'I understand a quote will be provided before work begins.',
                  ].map((text, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-3 cursor-pointer group"
                      onClick={() => toggleTerm(i)}
                    >
                      <div className={`mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center transition-colors ${
                        terms[i] ? 'bg-accent border-accent' : 'border-border/50 group-hover:border-accent/40'
                      }`} style={{ borderRadius: '2px' }}>
                        {terms[i] && <Check size={10} className="text-accent-foreground" />}
                      </div>
                      <span className="text-sm font-light text-muted-foreground leading-relaxed">{text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Submit ── */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={submitMutation.isPending}
                className="btn-primary w-full py-4 text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitMutation.isPending ? (
                  <span className="font-light">Sending your request…</span>
                ) : (
                  <span className="font-light">Submit Custom Order Request</span>
                )}
              </motion.button>

              <p className="text-center text-xs text-muted-foreground/50 font-light">
                By submitting you agree to be contacted about your custom order request.
              </p>
            </form>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
