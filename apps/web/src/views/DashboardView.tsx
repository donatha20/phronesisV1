import React from 'react';
import { 
  BookOpen, Video, Target, Lock, Radio, Sparkles, 
  ArrowRight, Flame, CheckCircle2, Clock, Calendar, Heart, Shield
} from 'lucide-react';
import {
  UserProfile, DailyDevotion, GoalItem,
  DiscipleshipSession, PodcastEpisode, PrayerRequest, LifeSphere
} from '../types';
import { ActiveTab } from '../components/Header';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface DashboardViewProps {
  currentUser: UserProfile;
  devotions: DailyDevotion[];
  goals: GoalItem[];
  sessions: DiscipleshipSession[];
  podcasts: PodcastEpisode[];
  prayers: PrayerRequest[];
  pairedMentor: { id: string; name: string } | null;
  onNavigate: (tab: ActiveTab) => void;
  onOpenSessionCall: (session: DiscipleshipSession) => void;
  onOpenVideoModal: (episode: PodcastEpisode) => void;
  onPlayAudioDevotion: (devotion: DailyDevotion) => void;
}

const SPHERE_RADAR_LABELS: Record<LifeSphere, string> = {
  PERSONAL_GROWTH: 'Personal Growth',
  ACADEMIA_CAREER: 'Career & Tech',
  RELATIONSHIPS: 'Relationships',
  FINANCES: 'Finances',
  PHYSICAL_WELLBEING: 'Wellbeing',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  devotions,
  goals,
  sessions,
  podcasts,
  prayers,
  pairedMentor,
  onNavigate,
  onOpenSessionCall,
  onOpenVideoModal,
  onPlayAudioDevotion
}) => {
  const todayDevotion = devotions[0];
  const upcomingSession = sessions.find(s => s.status === 'SCHEDULED');
  const activePrayers = prayers.filter(p => !p.isAnswered);
  const answeredPrayers = prayers.filter(p => p.isAnswered);

  // 5 Spheres Radar Data — average progress of the user's own goals per sphere
  // (0 for spheres with no goals yet, rather than a fabricated baseline).
  const sphereRadarData = (Object.keys(SPHERE_RADAR_LABELS) as LifeSphere[]).map((sphere) => {
    const sphereGoals = goals.filter((g) => g.sphere === sphere);
    const score = sphereGoals.length
      ? Math.round(sphereGoals.reduce((sum, g) => sum + g.progressPercent, 0) / sphereGoals.length)
      : 0;
    return { sphere: SPHERE_RADAR_LABELS[sphere], score };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-6 sm:p-8 text-stone-100 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cross-Generational Mentorship in Action</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-serif-display text-white tracking-tight">
              Welcome back, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-stone-300 text-sm leading-relaxed">
              "{currentUser.favoriteScripture}" • Guided in the grace and practical wisdom (Phronesis) of Christ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('DEVOTIONS')}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-md shadow-amber-950/40 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" /> Read Today's Phronesis
            </button>
            <button
              onClick={() => onNavigate('SPHERES')}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-bold transition"
            >
              5 Spheres Goals
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Today's Phronesis + Next Discipleship Call */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Today's Featured Phronesis Devotion */}
          {todayDevotion && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                    Today's Phronesis
                  </span>
                  <span className="text-xs text-stone-500 font-medium">{todayDevotion.date}</span>
                </div>
                <button
                  onClick={() => onNavigate('DEVOTIONS')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                >
                  Full Devotional <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900 leading-snug">
                  {todayDevotion.title}
                </h2>
                <p className="text-xs text-stone-600">
                  Authored by <strong className="text-stone-800">{todayDevotion.authorName}</strong> ({todayDevotion.authorTitle})
                </p>
              </div>

              {/* Scripture quote card */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                <p className="text-sm font-serif-display italic text-stone-800 leading-relaxed">
                  {todayDevotion.scriptureText}
                </p>
              </div>

              <p className="text-sm text-stone-700 leading-relaxed line-clamp-3">
                {todayDevotion.reflectionBody}
              </p>

              {/* Action bar for devotion */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                <button
                  onClick={() => onPlayAudioDevotion(todayDevotion)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Listen to Elder Voice Note ({Math.floor(todayDevotion.audioDurationSeconds / 60)} min)</span>
                </button>
                <div className="text-xs text-stone-500 flex items-center gap-3">
                  <span>{todayDevotion.likesCount} amen likes</span>
                  <span>•</span>
                  <span>{todayDevotion.comments.length} elder & youth comments</span>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Discipleship Session */}
          {upcomingSession && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <Video className="w-4 h-4 text-amber-600" />
                  <span>Upcoming Discipleship Call</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold font-mono">
                  {upcomingSession.scheduledTime}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif-display text-stone-900">
                  {upcomingSession.topic}
                </h3>
                <p className="text-xs text-stone-600">
                  1-on-1 Mentorship with <strong className="text-stone-800">{upcomingSession.mentorName}</strong>
                </p>
              </div>

              <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-700 border border-stone-200">
                <strong className="text-stone-900">Study Focus:</strong> {upcomingSession.scriptureText}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-stone-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Duration: {upcomingSession.durationMinutes} minutes
                </div>
                <button
                  id="launch-live-call-btn"
                  onClick={() => onOpenSessionCall(upcomingSession)}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
                >
                  <Video className="w-4 h-4" /> Launch In-App Video Call
                </button>
              </div>
            </div>
          )}

          {/* Recent Media Hub Highlights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif-display text-stone-900">
                Featured Podcasts & Video Masterclasses
              </h3>
              <button
                onClick={() => onNavigate('PODCASTS')}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                View Hub <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {podcasts.slice(0, 2).map((pod) => (
                <div
                  key={pod.id}
                  onClick={() => onOpenVideoModal(pod)}
                  className="group bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:border-amber-400 hover:shadow-md transition cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-semibold text-amber-800 uppercase tracking-wider">{pod.mediaType}</span>
                    <span>{pod.durationString}</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition line-clamp-2">
                    {pod.title}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {pod.description}
                  </p>
                  <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100 flex items-center justify-between">
                    <span>{pod.speaker}</span>
                    <span className="font-bold text-amber-700 group-hover:translate-x-0.5 transition">Listen →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): 5 Spheres Radar + Prayer Journal + Action Items */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 5 Spheres Radar Progress */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Target className="w-4 h-4 text-amber-600" />
                <span>5 Spheres Balance</span>
              </div>
              <button
                onClick={() => onNavigate('SPHERES')}
                className="text-xs font-bold text-amber-800 hover:text-amber-900"
              >
                Details
              </button>
            </div>

            <div className="h-56 w-full -my-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={sphereRadarData}>
                  <PolarGrid stroke="#e7e5e4" />
                  <PolarAngleAxis dataKey="sphere" tick={{ fill: '#78716c', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#e7e5e4" />
                  <Radar name="Joshua" dataKey="score" stroke="#c58145" fill="#c58145" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              {goals.slice(0, 3).map((g) => (
                <div key={g.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 truncate">{g.title}</span>
                    <span className="font-mono font-bold text-amber-800">{g.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${g.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Prayer Requests & Vault */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Prayer Vault</span>
              </div>
              <button
                onClick={() => onNavigate('PRAYER_VAULT')}
                className="text-xs font-bold text-amber-800 hover:text-amber-900"
              >
                Vault →
              </button>
            </div>

            <div className="space-y-3">
              {activePrayers.slice(0, 2).map((p) => (
                <div key={p.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {p.privacyLevel === 'PRIVATE_VAULT' ? 'Encrypted' : 'Mentor Shared'}
                    </span>
                    <span className="text-[10px] text-stone-500">{p.intercessorsCount} praying</span>
                  </div>
                  <h5 className="text-xs font-bold text-stone-900">{p.title}</h5>
                  <p className="text-xs text-stone-600 line-clamp-2">{p.prayerNeed}</p>
                </div>
              ))}

              {answeredPrayers.length > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Answered Prayer Praise Report</span>
                  </div>
                  <p className="text-xs text-emerald-800 line-clamp-2">
                    {answeredPrayers[0].praiseReport || answeredPrayers[0].title}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Discipleship Mentor Card */}
          <div className="bg-stone-900 rounded-3xl p-6 border border-stone-800 text-stone-100 space-y-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {currentUser.role === 'MENTOR_ELDER' ? 'Your Discipleship Pairing' : 'Assigned Senior Mentor'}
            </div>
            {pairedMentor ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-500/50 flex items-center justify-center font-bold text-lg text-amber-300 shrink-0">
                  {pairedMentor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{pairedMentor.name}</h4>
                  <p className="text-xs text-stone-400">
                    {currentUser.role === 'MENTOR_ELDER' ? 'Paired mentee' : 'Paired mentor'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400">
                {currentUser.role === 'MENTOR_ELDER'
                  ? 'You have no active mentee pairing yet.'
                  : 'You have not been paired with a mentor yet — browse the directory to apply.'}
              </p>
            )}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => onNavigate('SESSIONS')}
                disabled={!pairedMentor}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition text-center"
              >
                Schedule Session
              </button>
              <button
                onClick={() => onNavigate('MENTORS')}
                className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-bold transition"
              >
                All Mentors
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
