import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearch } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { KeyRound, Mail, Check } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function ResetPassword() {
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, logout } = useAuth();

  const searchString = useSearch();
  const token = new URLSearchParams(searchString).get('token');

  // Request mode state
  const [email, setEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  // Reset mode state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetComplete, setResetComplete] = useState(false);
  const [error, setError] = useState('');

  const requestReset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setRequestSent(true);
      setError('');
    },
    onError: () => {
      // Show same message regardless to avoid email enumeration
      setRequestSent(true);
    },
  });

  const resetPassword = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setResetComplete(true);
      setError('');
    },
    onError: (err) => {
      setError(err.message || 'Something went wrong. Please try again.');
    },
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    requestReset.mutate({ email });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    resetPassword.mutate({ token: token!, newPassword: password });
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
                <KeyRound size={20} className="text-accent mx-auto" />
                <h1 className="text-3xl font-serif font-light">
                  {token ? 'New Password' : 'Reset Password'}
                </h1>
                <p className="text-sm text-muted-foreground font-light">
                  {token
                    ? 'Choose a new password for your account'
                    : "Enter your email and we'll send you a reset link"}
                </p>
              </div>

              {/* Request Mode */}
              {!token && !requestSent && (
                <form onSubmit={handleRequestSubmit} className="space-y-5">
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

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={requestReset.isPending}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {requestReset.isPending ? (
                      <Spinner size={16} />
                    ) : (
                      <Mail size={16} />
                    )}
                    {requestReset.isPending ? 'Sending...' : 'Send Reset Link'}
                  </motion.button>
                </form>
              )}

              {/* Request Sent Confirmation */}
              {!token && requestSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6"
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center border border-sage/20">
                      <Check size={28} className="text-sage" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    If an account exists with that email, a reset link has been sent.
                  </p>
                  <p className="text-xs text-muted-foreground/50 font-light">
                    Please check your inbox and spam folder.
                  </p>
                </motion.div>
              )}

              {/* Reset Mode */}
              {token && !resetComplete && (
                <form onSubmit={handleResetSubmit} className="space-y-5">
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
                      New Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-elegant"
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-light">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="input-elegant"
                      placeholder="Repeat your password"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={resetPassword.isPending}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resetPassword.isPending ? (
                      <Spinner size={16} />
                    ) : (
                      <KeyRound size={16} />
                    )}
                    {resetPassword.isPending ? 'Updating...' : 'Set New Password'}
                  </motion.button>
                </form>
              )}

              {/* Reset Complete */}
              {token && resetComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6"
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center border border-sage/20">
                      <Check size={28} className="text-sage" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-script text-xl text-accent">All set!</p>
                    <p className="text-sm text-muted-foreground font-light">
                      Your password has been updated successfully.
                    </p>
                  </div>
                  <Link href="/login" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 cursor-pointer">
                    Sign In
                  </Link>
                </motion.div>
              )}

              {/* Footer Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-light">
                  Remember your password?{' '}
                  <Link href="/login" className="text-accent hover:text-accent/80 transition-colors">
                    Sign in
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
