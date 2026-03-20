import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sparkles, Eye, EyeOff, Scissors, Heart, ShoppingBag } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { usePageMeta } from '@/lib/usePageMeta';

export default function Login() {
  usePageMeta({ title: 'Sign In', description: 'Sign in to your Princess Made account.' });
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [['auth', 'me']] });
      navigate('/');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        <section className="py-12 md:py-20 relative">
          <div className="absolute inset-0 gradient-rose-subtle" />

          {/* Desktop: side-by-side layout */}
          <div className="container relative max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 md:border md:border-border/40 md:bg-card" style={{ borderRadius: '2px' }}>

              {/* Brand messaging panel - desktop only */}
              <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-accent/5 to-accent/10 border-r border-border/30 relative overflow-hidden">
                <div className="absolute inset-0 texture-linen opacity-40" />
                <div className="relative space-y-8">
                  <div className="space-y-3">
                    <p className="font-script text-2xl text-accent">Welcome back</p>
                    <h2 className="text-3xl font-serif font-light leading-snug">
                      Your handmade
                      <br />
                      <span className="italic text-accent">favourites</span> await
                    </h2>
                  </div>

                  <div className="space-y-5 pt-4">
                    {[
                      { icon: Heart, text: 'Save your favourite pieces' },
                      { icon: ShoppingBag, text: 'Track your orders easily' },
                      { icon: Scissors, text: 'Be first to see new drops' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground font-light">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <item.icon size={14} className="text-accent" />
                        </div>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form panel */}
              <div className="p-6 md:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8 max-w-sm mx-auto md:max-w-none"
                >
                  {/* Header */}
                  <div className="text-center space-y-3">
                    <Sparkles size={20} className="text-accent mx-auto" aria-hidden="true" />
                    <h1 className="text-3xl font-serif font-light">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground font-light">
                      Sign in to your Princess Made account
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-destructive/5 border border-destructive/15 text-sm text-destructive text-center font-light"
                        style={{ borderRadius: '2px' }}
                        role="alert"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="space-y-1.5">
                      <label htmlFor="login-email" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input-elegant"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="login-password" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="input-elegant pr-12"
                          placeholder="Enter your password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading && <Spinner size={16} />}
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                  </form>

                  {/* Links */}
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground font-light">
                      Don't have an account?{' '}
                      <Link href="/register" className="text-accent hover:text-accent/80 transition-colors">
                        Create one
                      </Link>
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border/60" />
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-light">or</span>
                      <div className="flex-1 h-px bg-border/60" />
                    </div>

                    <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground font-light hover:text-accent transition-colors">
                      <ShoppingBag size={14} />
                      Continue as guest
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
