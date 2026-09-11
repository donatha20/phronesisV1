import React, { useState } from 'react';
import {
  X, PhoneOff, BookOpen, CheckSquare, FileText, Sparkles, HandHeart,
  ExternalLink, Video, Loader2, AlertCircle
} from 'lucide-react';
import { DiscipleshipSession } from '../types';
import { ApiError } from '../lib/api';

interface LiveSessionCallModalProps {
  session: DiscipleshipSession | null;
  onClose: () => void;
  onCompleteSession: (sessionId: string, newNotes: string, actionItems: string[]) => void;
  onGenerateMeetLink: (sessionId: string) => Promise<void>;
  isGeneratingMeetLink: boolean;
}

export const LiveSessionCallModal: React.FC<LiveSessionCallModalProps> = ({
  session,
  onClose,
  onCompleteSession,
  onGenerateMeetLink,
  isGeneratingMeetLink
}) => {
  const [activeTab, setActiveTab] = useState<'NOTES' | 'SCRIPTURE' | 'ACTIONS'>('NOTES');
  const [notes, setNotes] = useState(session?.meetingNotes ?? '');
  const [actionItems, setActionItems] = useState<string[]>(session?.actionItems ?? []);
  const [newActionItem, setNewActionItem] = useState('');
  const [meetLinkError, setMeetLinkError] = useState<string | null>(null);

  if (!session) return null;

  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    setActionItems([...actionItems, newActionItem.trim()]);
    setNewActionItem('');
  };

  const handleEndCall = () => {
    onCompleteSession(session.id, notes, actionItems);
    onClose();
  };

  const handleGenerateMeetLink = async () => {
    setMeetLinkError(null);
    try {
      await onGenerateMeetLink(session.id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setMeetLinkError('Connect your Google account from the Google Drive tab first to generate a Meet link.');
      } else {
        setMeetLinkError('Could not generate a Google Meet link. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden text-stone-100 shadow-2xl">

        {/* Top Header Bar */}
        <div className="px-6 py-3.5 border-b border-stone-800 bg-stone-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Discipleship Session: {session.topic}
              </h3>
              <p className="text-xs text-stone-400">
                Between <strong className="text-amber-400">{session.mentorName}</strong> & <strong className="text-stone-300">{session.menteeName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Grid: Meet Link Panel (Left) + Collaborative Discipleship Panel (Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">

          {/* Left: Join / Generate Meet Link (7 cols) */}
          <div className="lg:col-span-7 p-4 bg-stone-950 flex flex-col justify-center items-center gap-5 overflow-y-auto text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Video className="w-9 h-9 text-emerald-400" />
            </div>

            {session.meetingLink ? (
              <>
                <div>
                  <h4 className="text-sm font-bold text-white">Ready to join</h4>
                  <p className="text-xs text-stone-400 max-w-sm">
                    This session has a real Google Meet link. In-app video isn't available yet —
                    join through Google Meet in a new tab.
                  </p>
                </div>
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-950/30"
                >
                  <Video className="w-4 h-4" /> Join Google Meet <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            ) : (
              <>
                <div>
                  <h4 className="text-sm font-bold text-white">No meeting link yet</h4>
                  <p className="text-xs text-stone-400 max-w-sm">
                    Generate a real Google Meet link for this session using your connected Google
                    Workspace account.
                  </p>
                </div>
                <button
                  onClick={handleGenerateMeetLink}
                  disabled={isGeneratingMeetLink}
                  className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-amber-950/30"
                >
                  {isGeneratingMeetLink ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  Generate Google Meet Link
                </button>
                {meetLinkError && (
                  <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/50 rounded-xl px-3 py-2 max-w-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{meetLinkError}</span>
                  </div>
                )}
              </>
            )}

            <div className="pt-4">
              <button
                onClick={handleEndCall}
                className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-rose-950/40"
              >
                <PhoneOff className="w-4 h-4" /> End & Save Discipleship Notes
              </button>
            </div>
          </div>

          {/* Right: Collaborative Study Pad & Action Checklist (5 cols) */}
          <div className="lg:col-span-5 bg-stone-900 border-l border-stone-800 flex flex-col">

            {/* Tab navigation */}
            <div className="flex border-b border-stone-800 bg-stone-950/40 text-xs">
              <button
                onClick={() => setActiveTab('NOTES')}
                className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'NOTES'
                    ? 'text-amber-400 border-b-2 border-amber-500 bg-stone-900'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Shared Notes
              </button>
              <button
                onClick={() => setActiveTab('SCRIPTURE')}
                className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'SCRIPTURE'
                    ? 'text-amber-400 border-b-2 border-amber-500 bg-stone-900'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Scripture Anchor
              </button>
              <button
                onClick={() => setActiveTab('ACTIONS')}
                className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'ACTIONS'
                    ? 'text-amber-400 border-b-2 border-amber-500 bg-stone-900'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Action Items ({actionItems.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {activeTab === 'NOTES' && (
                <div className="h-full flex flex-col space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Discipleship Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={12}
                    className="flex-1 w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs leading-relaxed text-stone-200 focus:outline-none focus:border-amber-500 resize-none font-sans"
                    placeholder="Type key insights, mentor advice, and revelation from the Word..."
                  />
                  <p className="text-[11px] text-stone-500 italic">
                    Saved to this session when you end the call.
                  </p>
                </div>
              )}

              {activeTab === 'SCRIPTURE' && (
                <div className="space-y-4">
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Session Scripture Reference</span>
                    <p className="text-sm font-serif-display text-amber-200 italic leading-relaxed">
                      "{session.scriptureText}"
                    </p>
                  </div>

                  <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/60 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                      <HandHeart className="w-3.5 h-3.5 text-amber-400" /> Post-Session Mentor Prayer
                    </h5>
                    <p className="text-xs text-stone-300 leading-relaxed italic">
                      "{session.postSessionPrayer}"
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'ACTIONS' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex items-start gap-2.5 text-xs text-stone-200"
                      >
                        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="flex-1 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add agreed next step..."
                      value={newActionItem}
                      onChange={(e) => setNewActionItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddActionItem()}
                      className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleAddActionItem}
                      className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-3 bg-stone-950/80 border-t border-stone-800 text-center text-[11px] text-stone-400">
              Session Focus: <strong className="text-amber-400">{session.sphereFocus}</strong> • 1-on-1 Discipleship
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
