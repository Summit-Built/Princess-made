import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2, Sparkles } from 'lucide-react';

export default function Login() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

        <section className="py-20 md:py-32 relative">
          <div className="absolute inset-0 gradient-rose-subtle" />
          <div className="container max-w-sm mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-3">
                <Sparkles size={20} className="text-accent mx-auto" />
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
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-elegant"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-elegant"
                    placeholder="Enter your password"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </form>

              {/* Footer */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-light">
                  Don't have an account?{' '}
                  <Link href="/register">
                    <a className="text-accent hover:text-accent/80 transition-colors">
                      Create one
                    </a>
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
