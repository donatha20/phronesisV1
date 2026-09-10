import React, { useState } from 'react';
import { 
  Lock, Unlock, Shield, KeyRound, Plus, Heart, 
  CheckCircle2, Sparkles, Filter, ShieldAlert, Eye, EyeOff 
} from 'lucide-react';
import { PrayerRequest, UserProfile, LifeSphere, PrayerPrivacyLevel, SecuritySettings } from '../types';

interface PrayerVaultViewProps {
  prayers: PrayerRequest[];
  currentUser: UserProfile;
  security: SecuritySettings;
  onAddPrayer: (newPrayer: PrayerRequest) => void;
  onTogglePrayed: (id: string) => void;
  onMarkAnswered: (id: string, praiseReport: string) => void;
  onUnlockVault: (pin: string) => boolean;
}

export const PrayerVaultView: React.FC<PrayerVaultViewProps> = ({
  prayers,
  currentUser,
  security,
  onAddPrayer,
  onTogglePrayed,
  onMarkAnswered,
  onUnlockVault
}) => {
  const [isUnlocked, setIsUnlocked] = useState(!security.isVaultLocked);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [answeringPrayerId, setAnsweringPrayerId] = useState<string | null>(null);
  const [praiseText, setPraiseText] = useState('');

  // New Prayer Form
  const [title, setTitle] = useState('');
  const [prayerNeed, setPrayerNeed] = useState('');
  const [sphere, setSphere] = useState<LifeSphere>('PERSONAL_GROWTH');
  const [privacy, setPrivacy] = useState<PrayerPrivacyLevel>('PRIVATE_VAULT');
  const [tagsText, setTagsText] = useState('Prayer, Faith');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUnlockVault(pinInput) || pinInput === '1234') {
      setIsUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect PIN. Try 1234 (default sample PIN).');
    }
  };

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prayerNeed.trim()) return;

    const newReq: PrayerRequest = {
      id: `pray_${Date.now()}`,
      authorName: currentUser.name,
      authorId: currentUser.id,
      title: title.trim(),
      prayerNeed: prayerNeed.trim(),
      categorySphere: sphere,
      privacyLevel: privacy,
      isAnswered: false,
      createdAt: 'Today',
      intercessorsCount: 1,
      isPrayedByMe: true,
      isEncrypted: privacy !== 'COMMUNITY_INTERCESSORS',
      cipherHint: privacy === 'PRIVATE_VAULT' ? 'Encrypted in Biometric Vault' : 'Authorized Mentors Only',
      tags: tagsText.split(',').map(t => t.trim()).filter(Boolean)
    };

    onAddPrayer(newReq);
    setIsAddModalOpen(false);

    // Reset
    setTitle('');
    setPrayerNeed('');
  };

  const handleSavePraiseReport = (id: string) => {
    if (!praiseText.trim()) return;
    onMarkAnswered(id, praiseText.trim());
    setAnsweringPrayerId(null);
    setPraiseText('');
  };

  const filteredPrayers = prayers.filter(p => {
    if (privacyFilter === 'ALL') return true;
    return p.privacyLevel === privacyFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
              End-to-End Encrypted Vault
            </span>
            <span className="text-xs text-stone-500">Zero-Knowledge Private Prayer Journal</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900">
            Prayer Vault & Praise Reports
          </h1>
          <p className="text-xs text-stone-600">
            A secure spiritual sanctuary for intimate requests, intercessory burdens, and answered prayer testimonies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <button
              onClick={() => setIsUnlocked(false)}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-bold transition flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Lock Vault
            </button>
          ) : (
            <span className="text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
              🔒 Vault Locked
            </span>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Prayer Request
          </button>
        </div>
      </div>

      {/* Lock Gate if not unlocked */}
      {!isUnlocked ? (
        <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 border border-stone-800 text-center max-w-md mx-auto space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold font-serif-display text-white">Prayer Vault is Locked</h3>
            <p className="text-xs text-stone-400">
              Enter your 4-digit PIN or use Biometrics to decrypt your private journal entries.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              placeholder="Enter PIN (e.g. 1234)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-48 mx-auto text-center tracking-widest text-lg font-mono bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            />

            {pinError && <p className="text-xs text-rose-400 font-semibold">{pinError}</p>}

            <div className="flex gap-2 justify-center">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-md"
              >
                Unlock Vault
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUnlocked(true);
                  setPinError('');
                }}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Simulate TouchID / FaceID
              </button>
            </div>
          </form>

          <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-800">
            Protected by {security.encryptionAlgorithm}
          </div>
        </div>
      ) : (
        /* Unlocked Vault Feed */
        <div className="space-y-4">
          
          {/* Privacy Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'ALL', label: 'All Requests' },
              { id: 'PRIVATE_VAULT', label: '🔒 Private Secret Place' },
              { id: 'MENTOR_ONLY', label: '👥 Shared with Mentor' },
              { id: 'COMMUNITY_INTERCESSORS', label: '🕊️ Church Intercessors' }
            ].map((pf) => (
              <button
                key={pf.id}
                onClick={() => setPrivacyFilter(pf.id)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                  privacyFilter === pf.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>

          {/* Grid of Prayer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrayers.map((p) => (
              <div
                key={p.id}
                className={`rounded-3xl p-6 border shadow-sm space-y-4 flex flex-col justify-between transition ${
                  p.isAnswered
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                      {p.privacyLevel.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">{p.createdAt}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-serif-display text-stone-900">
                      {p.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {p.prayerNeed}
                    </p>
                  </div>

                  {/* Praise report if answered */}
                  {p.isAnswered && p.praiseReport && (
                    <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-xs space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Praise & Answered Testimony
                      </div>
                      <p className="text-stone-700 italic leading-relaxed">
                        "{p.praiseReport}"
                      </p>
                    </div>
                  )}

                  {/* Encryption / Cipher hint */}
                  <div className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                    <Shield className="w-3 h-3 text-amber-600" /> {p.cipherHint}
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onTogglePrayed(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      p.isPrayedByMe
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${p.isPrayedByMe ? 'fill-current text-rose-500' : ''}`} />
                    <span>{p.intercessorsCount} Prayed</span>
                  </button>

                  {!p.isAnswered ? (
                    <button
                      onClick={() => setAnsweringPrayerId(p.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Answered
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Answered
                    </span>
                  )}
                </div>

                {/* Answering Dialog inline */}
                {answeringPrayerId === p.id && (
                  <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-3 mt-2">
                    <h5 className="text-xs font-bold text-amber-400">Add Praise Report / Testimony</h5>
                    <textarea
                      rows={3}
                      placeholder="How did God answer this prayer? Share His faithfulness..."
                      value={praiseText}
                      onChange={(e) => setPraiseText(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setAnsweringPrayerId(null)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 text-xs text-stone-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSavePraiseReport(p.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold"
                      >
                        Save Praise Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Prayer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold font-serif-display text-stone-900">
                Log New Prayer Request
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrayer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Prayer Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Peace & Wisdom for Family Decision"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Confidentiality Tier</label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as PrayerPrivacyLevel)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="PRIVATE_VAULT">🔒 Private (Secret Place Only)</option>
                    <option value="MENTOR_ONLY">👥 Shared with Mentor (Elder Thomas)</option>
                    <option value="COMMUNITY_INTERCESSORS">🕊️ Church Intercessors Pool</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Sphere Focus</label>
                  <select
                    value={sphere}
                    onChange={(e) => setSphere(e.target.value as LifeSphere)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="PERSONAL_GROWTH">Personal Growth</option>
                    <option value="ACADEMIA_CAREER">Academia & Career</option>
                    <option value="RELATIONSHIPS">Relationships</option>
                    <option value="FINANCES">Finances</option>
                    <option value="PHYSICAL_WELLBEING">Physical Wellbeing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Prayer Details & Petitions</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Express your heart, scripture promises you are standing on, and specific requests..."
                  value={prayerNeed}
                  onChange={(e) => setPrayerNeed(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Faith, Wisdom, Healing"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Encrypt & Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
