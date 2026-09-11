import React, { useState } from 'react';
import {
  Shield, Smartphone, CheckCircle2, Loader2, Clock, KeyRound
} from 'lucide-react';
import { UserProfile } from '../types';
import { apiErrorMessage } from '../lib/api';

interface SecuritySettingsViewProps {
  currentUser: UserProfile;
  twoFactorEnabled: boolean;
  lastVaultUnlockAt: string | null;
  lastPasswordChangeAt: string | null;
  onToggleTwoFactor: (enabled: boolean) => void;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export const SecuritySettingsView: React.FC<SecuritySettingsViewProps> = ({
  currentUser,
  twoFactorEnabled,
  lastVaultUnlockAt,
  lastPasswordChangeAt,
  onToggleTwoFactor,
  onChangePassword
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await onChangePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 3000);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Never';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
            Account Security
          </span>
          <span className="text-xs text-stone-500">{currentUser.email}</span>
        </div>
        <h1 className="text-2xl font-bold font-serif-display text-stone-900">
          Security Settings
        </h1>
        <p className="text-xs text-stone-600">
          Private prayer entries are protected by access control and audit logging, not client-side
          encryption — viewing one always requires re-entering your password.
        </p>
      </div>

      {isSavedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Password updated.</span>
        </div>
      )}

      {/* Change password */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <KeyRound className="w-4 h-4 text-amber-600" /> Change Password
        </div>

        {error && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Current password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">New password</label>
              <input
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Confirm new password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Two-factor preference */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-600" /> Two-Factor Preference
            </div>
            <p className="text-xs text-stone-500 max-w-md">
              Stored as a preference on your account. Enforcement (e.g. an email or authenticator
              challenge at login) is not yet implemented.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleTwoFactor(!twoFactorEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              twoFactorEnabled ? 'bg-amber-600' : 'bg-stone-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                twoFactorEnabled ? 'left-6' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Account activity */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Shield className="w-4 h-4" /> Account Activity
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-stone-400 block text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" /> Last prayer vault unlock:</span>
            <span className="font-mono text-stone-200">{formatDate(lastVaultUnlockAt)}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" /> Last password change:</span>
            <span className="font-mono text-stone-200">{formatDate(lastPasswordChangeAt)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
