import React, { useState } from 'react';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from './AuthContext';
import { apiErrorMessage } from '../lib/api';
import { googleErrorMessage } from './authMessages';

type Mode = 'login' | 'register';

const GoogleGlyph = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.67 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
    />
  </svg>
);

export const AuthScreen: React.FC = () => {
  const { login, register, loginWithGoogle } = useAuth();

  const initialGoogleError =
    typeof window !== 'undefined'
      ? googleErrorMessage(new URLSearchParams(window.location.search).get('error'))
      : null;

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(initialGoogleError);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({ email: email.trim(), password, firstName, lastName });
      }
      // AuthProvider flips to authenticated; App re-renders.
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md">
            <span className="font-serif-display font-black text-xl italic">Φ</span>
          </div>
          <div>
            <div className="text-lg font-bold font-serif-display text-stone-900 tracking-wide">
              PHRONESIS
            </div>
            <p className="text-[11px] text-stone-500">Cross-Generational Discipleship</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-stone-900 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-stone-500 mb-6">
            {mode === 'login'
              ? 'Sign in to continue your discipleship journey.'
              : 'Join as a young believer. Mentors are added by an administrator.'}
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 whitespace-pre-line"
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2.5 border border-stone-300 rounded-xl py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            <GoogleGlyph />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-stone-200 flex-1" />
            <span className="text-[11px] uppercase tracking-wider text-stone-400">or</span>
            <div className="h-px bg-stone-200 flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name">
                  <input
                    className={inputCls}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </Field>
                <Field label="Last name">
                  <input
                    className={inputCls}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </Field>
              </div>
            )}

            <Field label="Email">
              <input
                type="email"
                required
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                required
                minLength={mode === 'register' ? 10 : undefined}
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-stone-500 mt-6 text-center">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              className="font-semibold text-amber-700 hover:underline"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const inputCls =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-stone-600 mb-1">{label}</span>
    {children}
  </label>
);
