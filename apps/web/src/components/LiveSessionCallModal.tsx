import React, { useState, useEffect } from 'react';
import { 
  X, Mic, MicOff, Video, VideoOff, PhoneOff, BookOpen, 
  CheckSquare, FileText, Sparkles, MessageSquare, HandHeart, Users,
  ExternalLink
} from 'lucide-react';
import { DiscipleshipSession } from '../types';

interface LiveSessionCallModalProps {
  session: DiscipleshipSession | null;
  onClose: () => void;
  onCompleteSession: (sessionId: string, newNotes: string, actionItems: string[]) => void;
}

export const LiveSessionCallModal: React.FC<LiveSessionCallModalProps> = ({
  session,
  onClose,
  onCompleteSession
}) => {
  if (!session) return null;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(128); // seconds elapsed
  const [activeTab, setActiveTab] = useState<'NOTES' | 'SCRIPTURE' | 'ACTIONS'>('NOTES');
  const [notes, setNotes] = useState(session.meetingNotes);
  const [actionItems, setActionItems] = useState<string[]>(session.actionItems);
  const [newActionItem, setNewActionItem] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    setActionItems([...actionItems, newActionItem.trim()]);
    setNewActionItem('');
  };

  const handleEndCall = () => {
    onCompleteSession(session.id, notes, actionItems);
    onClose();
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
                Live Discipleship Session: {session.topic}
              </h3>
              <p className="text-xs text-stone-400">
                Connected with <strong className="text-amber-400">{session.mentorName}</strong> & <strong className="text-stone-300">{session.menteeName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-stone-800 text-amber-300 border border-stone-700">
              {formatTimer(callDuration)}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Grid: Call Video Streams (Left) + Collaborative Discipleship Panel (Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          
          {/* Left: Video Streams (7 cols) */}
          <div className="lg:col-span-7 p-4 bg-stone-950 flex flex-col justify-between gap-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              
              {/* Mentor Video Feed */}
              <div className="relative rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden flex items-center justify-center min-h-[220px]">
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-transparent to-stone-950/80 pointer-events-none" />
                <div className="text-center p-4 z-10">
                  <div className="w-20 h-20 mx-auto rounded-full bg-amber-700/40 border-2 border-amber-500/60 flex items-center justify-center text-2xl font-bold text-amber-200 mb-2">
                    T
                  </div>
                  <h4 className="text-sm font-bold text-white">{session.mentorName}</h4>
                  <p className="text-xs text-amber-400/90 font-medium">Senior Elder & Mentor</p>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded-md bg-stone-800/80 text-[10px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Audio Active
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 z-20 text-[11px] px-2 py-0.5 rounded bg-black/60 text-stone-300 backdrop-blur-sm">
                  Austin, TX (Remote)
                </div>
              </div>

              {/* Mentee Video Feed */}
              <div className="relative rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden flex items-center justify-center min-h-[220px]">
                {isVideoOn ? (
                  <div className="text-center p-4 z-10">
                    <div className="w-20 h-20 mx-auto rounded-full bg-stone-800 border-2 border-stone-700 flex items-center justify-center text-2xl font-bold text-stone-300 mb-2">
                      J
                    </div>
                    <h4 className="text-sm font-bold text-white">{session.menteeName}</h4>
                    <p className="text-xs text-stone-400">Young Believer (You)</p>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded-md bg-stone-800/80 text-[10px] text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Speaking
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-stone-500 mb-2">
                      <VideoOff className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-stone-500">Camera Paused</p>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 z-20 text-[11px] px-2 py-0.5 rounded bg-black/60 text-stone-300 backdrop-blur-sm">
                  Seattle, WA
                </div>
              </div>
            </div>

            {/* In-Call Controls Bar */}
            <div className="p-3 bg-stone-900/90 border border-stone-800 rounded-2xl flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition shadow-md ${
                  isMicOn ? 'bg-stone-800 text-stone-100 hover:bg-stone-700' : 'bg-rose-600 text-white'
                }`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition shadow-md ${
                  isVideoOn ? 'bg-stone-800 text-stone-100 hover:bg-stone-700' : 'bg-rose-600 text-white'
                }`}
                title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-md"
                title="Switch or Open in Google Meet"
              >
                <Video className="w-4 h-4" /> Google Meet <ExternalLink className="w-3 h-3" />
              </a>

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
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Real-time Discipleship Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={12}
                    className="flex-1 w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs leading-relaxed text-stone-200 focus:outline-none focus:border-amber-500 resize-none font-sans"
                    placeholder="Type key insights, mentor advice, and revelation from the Word..."
                  />
                  <p className="text-[11px] text-stone-500 italic">
                    All notes are encrypted and automatically synced to both of your profiles.
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
