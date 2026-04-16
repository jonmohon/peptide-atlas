'use client';

import { useState } from 'react';
import { signIn, signUp, confirmSignUp } from 'aws-amplify/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

type AuthStep = 'signIn' | 'signUp' | 'confirm';

export function SignInModal({ open, onClose }: SignInModalProps) {
  const [step, setStep] = useState<AuthStep>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmCode('');
    setError('');
    setStep('signIn');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn({ username: email, password });
      if (result.isSignedIn) {
        resetForm();
        onClose();
        window.location.reload();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      if (message.includes('User does not exist')) {
        setError('No account found. Sign up below.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      });
      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setStep('confirm');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: confirmCode });
      // Auto sign in after confirmation
      await signIn({ username: email, password });
      resetForm();
      onClose();
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { signInWithRedirect } = await import('aws-amplify/auth');
    await signInWithRedirect({ provider: 'Google' });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => { resetForm(); onClose(); }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="glass-bright w-full max-w-sm rounded-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button
                onClick={() => { resetForm(); onClose(); }}
                className="absolute top-4 right-4 text-text-secondary hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {step === 'signIn' && 'Sign in to PeptideAtlas'}
                  {step === 'signUp' && 'Create your account'}
                  {step === 'confirm' && 'Verify your email'}
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  {step === 'confirm'
                    ? `We sent a code to ${email}`
                    : 'Save your stacks, protocols, and unlock premium tools'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {error}
                </div>
              )}

              {step === 'confirm' ? (
                <form onSubmit={handleConfirm} className="space-y-3">
                  <input
                    type="text"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                    placeholder="Enter confirmation code"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 text-center tracking-widest"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all text-sm font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </form>
              ) : (
                <>
                  {/* Google Sign In */}
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/[0.1] hover:bg-white/[0.12] transition-colors text-sm font-medium text-foreground"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-white/[0.08]" />
                    <span className="text-xs text-text-secondary">or</span>
                    <div className="flex-1 h-px bg-white/[0.08]" />
                  </div>

                  {/* Email/Password Form */}
                  <form onSubmit={step === 'signIn' ? handleSignIn : handleSignUp} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20"
                      required
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20"
                      required
                      minLength={8}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all text-sm font-semibold disabled:opacity-50"
                    >
                      {loading
                        ? (step === 'signIn' ? 'Signing in...' : 'Creating account...')
                        : (step === 'signIn' ? 'Sign In' : 'Create Account')}
                    </button>
                  </form>

                  {/* Toggle sign in / sign up */}
                  <p className="text-xs text-text-secondary text-center mt-4">
                    {step === 'signIn' ? (
                      <>
                        No account?{' '}
                        <button onClick={() => { setStep('signUp'); setError(''); }} className="text-neon-cyan hover:underline">
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button onClick={() => { setStep('signIn'); setError(''); }} className="text-neon-cyan hover:underline">
                          Sign in
                        </button>
                      </>
                    )}
                  </p>

                  <p className="text-xs text-text-secondary text-center mt-3">
                    By signing in, you agree to our{' '}
                    <a href="/terms" className="text-neon-cyan hover:underline">Terms</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-neon-cyan hover:underline">Privacy Policy</a>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
