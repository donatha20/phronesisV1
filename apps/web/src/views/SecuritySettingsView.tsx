import React, { useState } from 'react';
import { 
  Shield, KeyRound, Smartphone, Lock, CheckCircle2, 
  RefreshCw, AlertCircle, Sparkles, Database, Fingerprint 
} from 'lucide-react';
import { SecuritySettings, UserProfile } from '../types';

interface SecuritySettingsViewProps {
  security: SecuritySettings;
  currentUser: UserProfile;
  onUpdateSecurity: (newSettings: SecuritySettings) => void;
}

export const SecuritySettingsView: React.FC<SecuritySettingsViewProps> = ({
  security,
  currentUser,
  onUpdateSecurity
}) => {
  const [pin, setPin] = useState(security.pinCode);
  const [biometrics, setBiometrics] = useState(security.biometricsEnabled);
  const [twoFa, setTwoFa] = useState(security.twoFactorEnabled);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSecurity({
      ...security,
      pinCode: pin,
      biometricsEnabled: biometrics,
      twoFactorEnabled: twoFa
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
            Cryptographic Vault Security
          </span>
          <span className="text-xs text-stone-500">Zero-Knowledge Encrypted Architecture</span>
        </div>
        <h1 className="text-2xl font-bold font-serif-display text-stone-900">
          Security Settings & Private Key Management
        </h1>
        <p className="text-xs text-stone-600">
          All intimate prayer entries, mentor session notes, and confessions are encrypted locally using AES-256-GCM.
        </p>
      </div>

      {isSavedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Security settings updated and cryptographic key re-derived!</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* PIN Setting */}
          <div className="space-y-2 pb-6 border-b border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" /> Prayer Vault PIN Code
                </label>
                <p className="text-xs text-stone-500">
                  4-digit PIN required to unlock and view encrypted prayer journals.
                </p>
              </div>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-28 text-center font-mono text-base font-bold bg-stone-50 border border-stone-200 rounded-xl py-2 text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Biometrics Toggle */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            <div>
              <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-amber-600" /> Biometric Authentication (Touch ID / Face ID)
              </div>
              <p className="text-xs text-stone-500">
                Unlock your spiritual journal with device hardware biometrics.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBiometrics(!biometrics)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                biometrics ? 'bg-amber-600' : 'bg-stone-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                  biometrics ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* 2FA Toggle */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            <div>
              <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-600" /> Two-Factor Mentorship Verification (2FA)
              </div>
              <p className="text-xs text-stone-500">
                Requires device confirmation before joining live mentoring call sessions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTwoFa(!twoFa)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                twoFa ? 'bg-amber-600' : 'bg-stone-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                  twoFa ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Key details */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Cryptographic Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Algorithm:</span>
                <span className="font-mono text-stone-200">{security.encryptionAlgorithm}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Last Cloud Encrypted Backup:</span>
                <span className="font-mono text-stone-200">{security.lastBackupDate}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
            >
              Save Security Configuration
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
