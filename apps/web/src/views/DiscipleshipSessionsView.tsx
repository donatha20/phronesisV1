import React, { useState } from 'react';
import {
  Video, Clock, BookOpen, Plus, CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { DiscipleshipSession, UserProfile, LifeSphere, SessionPlatform } from '../types';

export interface CreateSessionInput {
  mentorId: string;
  mentorName: string;
  topic: string;
  sphereFocus: string;
  scriptureText: string;
  platform: string;
  scheduledAt: string; // ISO
  meetingNotes: string;
}

interface DiscipleshipSessionsViewProps {
  sessions: DiscipleshipSession[];
  currentUser: UserProfile;
  pairedMentor: { id: string; name: string } | null;
  onOpenSessionCall: (session: DiscipleshipSession) => void;
  onScheduleSession: (input: CreateSessionInput) => void;
}

export const DiscipleshipSessionsView: React.FC<DiscipleshipSessionsViewProps> = ({
  sessions,
  currentUser,
  pairedMentor,
  onOpenSessionCall,
  onScheduleSession
}) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Form State
  const [topic, setTopic] = useState('');
  const [sphereFocus, setSphereFocus] = useState<LifeSphere>('PERSONAL_GROWTH');
  const [platform, setPlatform] = useState<SessionPlatform>('GOOGLE_MEET');
  const [dateTimeLocal, setDateTimeLocal] = useState('');
  const [scriptureText, setScriptureText] = useState('Romans 12:1-2 - Living Sacrifices');
  const [initialNotes, setInitialNotes] = useState('');

  const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS');
  const pastSessions = sessions.filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED');

  const displayedSessions = activeTab === 'UPCOMING' ? upcomingSessions : pastSessions;

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !pairedMentor || !dateTimeLocal) return;

    onScheduleSession({
      mentorId: pairedMentor.id,
      mentorName: pairedMentor.name,
      topic: topic.trim(),
      sphereFocus,
      scriptureText: scriptureText.trim() || 'Proverbs 3:5-6',
      platform,
      scheduledAt: new Date(dateTimeLocal).toISOString(),
      meetingNotes: initialNotes.trim() || 'Agenda: 1. Opening prayer. 2. Sphere goals check-in. 3. Scripture meditation.',
    });
    setIsScheduleModalOpen(false);

    // Reset
    setTopic('');
    setInitialNotes('');
    setDateTimeLocal('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
              Discipleship Mentorship
            </span>
            <span className="text-xs text-stone-500">1-on-1 Elder & Mentee Sessions</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-display text-stone-900">
            Scheduled Sessions & Live Call Room
          </h1>
          <p className="text-xs text-stone-600">
            Structured biblical discipleship appointments with synchronized Scripture study, real-time shared notes, and prayer.
          </p>
        </div>

        {pairedMentor ? (
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Book Discipleship Call
          </button>
        ) : (
          <span className="text-xs text-stone-500 bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5">
            You need an active mentor pairing to schedule a session.
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'UPCOMING'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          Upcoming Appointments ({upcomingSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('PAST')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'PAST'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          Past Sessions & Notes ({pastSessions.length})
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedSessions.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  {s.sphereFocus.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                  {s.scheduledTime}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif-display text-stone-900">
                  {s.topic}
                </h3>
                <p className="text-xs text-stone-600">
                  Mentor: <strong className="text-stone-800">{s.mentorName}</strong> • Mentee: <strong className="text-stone-800">{s.menteeName}</strong>
                </p>
              </div>

              {/* Scripture Anchor */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Scripture Anchor:
                </span>
                <p className="font-serif-display italic text-stone-700">{s.scriptureText}</p>
              </div>

              {/* Action items preview */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Agreed Next Steps:</span>
                <ul className="space-y-1 text-stone-700">
                  {s.actionItems.map((ai, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>{ai}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
              <div className="text-xs text-stone-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {s.durationMinutes} min appointment
              </div>

              {s.status === 'SCHEDULED' ? (
                <button
                  onClick={() => onOpenSessionCall(s)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
                >
                  <Video className="w-4 h-4" /> Enter Live Video Call
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Completed & Encrypted
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold font-serif-display text-stone-900">
                Schedule Discipleship Session
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Session Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Romans 8: Mind of the Spirit in the Workplace"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Senior Mentor</label>
                  <div className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-700">
                    {pairedMentor?.name ?? '—'}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Sphere Focus</label>
                  <select
                    value={sphereFocus}
                    onChange={(e) => setSphereFocus(e.target.value as LifeSphere)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Session Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as SessionPlatform)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  >
                    <option value="GOOGLE_MEET">Google Meet Video Room</option>
                    <option value="IN_APP_VIDEO">Phronesis HD In-App Video</option>
                    <option value="AUDIO_ROOM">Sacred Voice Audio Room</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTimeLocal}
                    onChange={(e) => setDateTimeLocal(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {platform === 'GOOGLE_MEET' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2 text-stone-500 text-xs">
                  <CalendarDays className="w-4 h-4 text-stone-400" />
                  <span>Google Calendar & Meet sync is being migrated to the backend and will return shortly.</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Scripture Focus</label>
                <input
                  type="text"
                  value={scriptureText}
                  onChange={(e) => setScriptureText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Initial Agenda & Questions</label>
                <textarea
                  rows={3}
                  placeholder="What specific questions or prayer items do you want to address with your mentor?"
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Confirm Discipleship Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
