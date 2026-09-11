import React, { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  UserProfile, PodcastEpisode, ResourceItem, SecuritySettings
} from './types';
import {
  initialMentors, initialMentees, initialPodcasts, initialResources, initialSecurity
} from './data/sampleData';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { DailyDevotionsView } from './views/DailyDevotionsView';
import { SpheresGoalsView } from './views/SpheresGoalsView';
import { PodcastMediaHubView } from './views/PodcastMediaHubView';
import { DiscipleshipSessionsView } from './views/DiscipleshipSessionsView';
import { PrayerVaultView } from './views/PrayerVaultView';
import { MentorMatchingView } from './views/MentorMatchingView';
import { ResourceLibraryView } from './views/ResourceLibraryView';
import { GoogleDriveView } from './views/GoogleDriveView';
import { GoogleCalendarMeetView } from './views/GoogleCalendarMeetView';
import { SecuritySettingsView } from './views/SecuritySettingsView';

import { AudioVoicePlayer } from './components/AudioVoicePlayer';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { SpiritualAssistantModal } from './components/SpiritualAssistantModal';
import { LiveSessionCallModal } from './components/LiveSessionCallModal';

import { useAuth } from './auth/AuthContext';
import { AuthScreen } from './auth/AuthScreen';
import { CallbackScreen } from './auth/CallbackScreen';
import { apiUserToProfile } from './auth/adapt';

import {
  useGoals, useGoalMutations,
  useDevotions, useDevotionComments, useDevotionMutations,
  usePrayers, useVaultStatus, usePrayerMutations,
  useSessions, useSessionMutations,
  useMyMentorship,
} from './api/hooks';

const FullScreenLoader: React.FC = () => (
  <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400">
    <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
  </div>
);

export const App: React.FC = () => {
  const auth = useAuth();

  // Lightweight routing: the Google redirect returns to /auth/callback.
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')) {
    return <CallbackScreen />;
  }
  if (!auth.ready) return <FullScreenLoader />;
  if (auth.status !== 'authenticated' || !auth.user) return <AuthScreen />;

  return <AuthedApp />;
};

const AuthedApp: React.FC = () => {
  const auth = useAuth();
  const apiUser = auth.user!;

  // Bridge the authenticated identity onto the legacy UserProfile shape the
  // remaining (not-yet-migrated) views still expect.
  const bridgedUser = useMemo(
    () =>
      apiUserToProfile(
        apiUser,
        apiUser.role === 'mentor' ? initialMentors[0] : initialMentees[0],
      ),
    [apiUser],
  );

  const [mentors, setMentors] = useState<UserProfile[]>(initialMentors);
  const [mentees, setMentees] = useState<UserProfile[]>(initialMentees);
  const [currentUserOverride, setCurrentUserOverride] = useState<UserProfile | null>(null);
  const currentUser = currentUserOverride ?? bridgedUser;

  const [activeTab, setActiveTab] = useState<ActiveTab>('DASHBOARD');

  // ---- API-backed domains (goals, devotions, prayers, sessions) ----------
  const goalsQuery = useGoals();
  const goalMutations = useGoalMutations();
  const goals = goalsQuery.data ?? [];

  const devotionsQuery = useDevotions();
  const devotionMutations = useDevotionMutations();
  const devotions = devotionsQuery.data ?? [];
  const [selectedDevotionId, setSelectedDevotionId] = useState<string | null>(null);
  const commentsQuery = useDevotionComments(selectedDevotionId);
  const comments = commentsQuery.data ?? [];

  const prayersQuery = usePrayers();
  const vaultStatusQuery = useVaultStatus();
  const prayerMutations = usePrayerMutations();
  const prayers = prayersQuery.data ?? [];

  const sessionsQuery = useSessions();
  const sessionMutations = useSessionMutations();
  const sessions = sessionsQuery.data ?? [];
  const myMentorshipQuery = useMyMentorship();
  const pairedMentor = myMentorshipQuery.data
    ? apiUser.role === 'mentor'
      ? { id: myMentorshipQuery.data.mentee, name: myMentorshipQuery.data.mentee_name }
      : { id: myMentorshipQuery.data.mentor, name: myMentorshipQuery.data.mentor_name }
    : null;

  // ---- Domains still seeded from sample data (migrate in a later pass) ---
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>(initialPodcasts);
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [security, setSecurity] = useState<SecuritySettings>(initialSecurity);
  const [enrolledResourceIds, setEnrolledResourceIds] = useState<string[]>(['res_1', 'res_2']);

  // Modals & Floating Players
  const [activeAudio, setActiveAudio] = useState<{ title: string; speaker: string; duration: number; url?: string } | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<PodcastEpisode | null>(null);
  const [activeLiveCallSession, setActiveLiveCallSession] = useState<import('./types').DiscipleshipSession | null>(null);
  const [isSpiritualAssistantOpen, setIsSpiritualAssistantOpen] = useState(false);

  // Handlers (sample-data domains) ------------------------------------
  const handleAddNewUser = (newUser: UserProfile) => {
    if (newUser.role === 'MENTOR_ELDER') {
      setMentors([newUser, ...mentors]);
    } else {
      setMentees([newUser, ...mentees]);
    }
  };

  const handleUpdateUserProfile = (updatedUser: UserProfile) => {
    if (updatedUser.role === 'MENTOR_ELDER') {
      setMentors(mentors.map(m => m.id === updatedUser.id ? updatedUser : m));
    } else {
      setMentees(mentees.map(m => m.id === updatedUser.id ? updatedUser : m));
    }
    if (currentUser.id === updatedUser.id) {
      setCurrentUserOverride(updatedUser);
    }
  };

  const handleAddNewResource = (newRes: ResourceItem) => {
    setResources([newRes, ...resources]);
  };

  const handleEnrollResource = (resourceId: string) => {
    if (!enrolledResourceIds.includes(resourceId)) {
      setEnrolledResourceIds([...enrolledResourceIds, resourceId]);
      setResources(prev => prev.map(r => {
        if (r.id === resourceId) {
          return { ...r, enrolledUsersCount: (r.enrolledUsersCount || 10) + 1 };
        }
        return r;
      }));
    }
  };

  const handlePairMentorAndMentee = (
    mentor: UserProfile,
    mentee: UserProfile,
    application: any
  ) => {
    // Sample-data profile bookkeeping only. The real pairing (which also
    // creates the first discipleship session) happens server-side via
    // POST /api/mentorship-applications/{id}/accept/ — see apps/mentorship.
    const updatedMentee: UserProfile = {
      ...mentee,
      assignedMentorId: mentor.id,
      assignedMentorName: mentor.name,
      pairedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    const updatedMentor: UserProfile = {
      ...mentor,
      activeMenteesCount: (mentor.activeMenteesCount || 0) + 1
    };

    setMentors(mentors.map(m => m.id === mentor.id ? updatedMentor : m));
    setMentees(mentees.map(m => m.id === mentee.id ? updatedMentee : m));
    if (currentUser.id === mentee.id) {
      setCurrentUserOverride(updatedMentee);
    }
  };

  const handlePlayAudioPodcast = (pod: PodcastEpisode) => {
    setActiveAudio({
      title: pod.title,
      speaker: pod.speaker,
      duration: pod.durationSeconds,
      url: 'https://actions.google.com/sounds/v1/ambiences/gentle_stream.ogg'
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between font-sans">

      {/* Top Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={auth.logout}
        onOpenAssistant={() => setIsSpiritualAssistantOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {activeTab === 'DASHBOARD' && (
          <DashboardView
            currentUser={currentUser}
            devotions={devotions}
            goals={goals}
            sessions={sessions}
            podcasts={podcasts}
            prayers={prayers}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenSessionCall={(s) => setActiveLiveCallSession(s)}
            onOpenVideoModal={(p) => setActiveVideoModal(p)}
            onPlayAudioDevotion={(dev) => setActiveAudio({
              title: dev.title, speaker: dev.authorName,
              duration: dev.audioDurationSeconds, url: dev.audioVoiceNoteUrl,
            })}
          />
        )}

        {activeTab === 'DEVOTIONS' && (
          <DailyDevotionsView
            devotions={devotions}
            currentUser={currentUser}
            comments={comments}
            onSelectDevotion={setSelectedDevotionId}
            onPlayAudio={(dev) => setActiveAudio({
              title: dev.title, speaker: dev.authorName,
              duration: dev.audioDurationSeconds, url: dev.audioVoiceNoteUrl,
            })}
            onCreateDevotion={(input) => devotionMutations.create.mutate(input)}
            onAddComment={(devotionId, text) => devotionMutations.addComment.mutate({ devotionId, text })}
            onToggleLike={(id, liked) => devotionMutations.toggleLike.mutate({ id, liked })}
          />
        )}

        {activeTab === 'SPHERES' && (
          <SpheresGoalsView
            goals={goals}
            currentUser={currentUser}
            onToggleMilestone={(goalId, milestoneId, isCompleted) =>
              goalMutations.toggleMilestone.mutate({ goalId, milestoneId, isCompleted })
            }
            onCreateGoal={(input) => goalMutations.create.mutate(input)}
          />
        )}

        {activeTab === 'PODCASTS' && (
          <PodcastMediaHubView
            podcasts={podcasts}
            onOpenVideoModal={(p) => setActiveVideoModal(p)}
            onPlayAudioPodcast={handlePlayAudioPodcast}
            onAddNewPodcast={(np) => setPodcasts([np, ...podcasts])}
            onToggleSave={(id) => setPodcasts(podcasts.map(p => p.id === id ? { ...p, isSaved: !p.isSaved } : p))}
            onToggleLike={(id) => setPodcasts(podcasts.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 } : p))}
          />
        )}

        {activeTab === 'SESSIONS' && (
          <DiscipleshipSessionsView
            sessions={sessions}
            currentUser={currentUser}
            pairedMentor={pairedMentor}
            onOpenSessionCall={(s) => setActiveLiveCallSession(s)}
            onScheduleSession={(input) => sessionMutations.create.mutate({
              menteeId: apiUser.role === 'mentor' ? input.mentorId : apiUser.id,
              mentorId: apiUser.role === 'mentor' ? apiUser.id : input.mentorId,
              scheduledAt: input.scheduledAt,
              durationMinutes: 45,
              sphereFocus: input.sphereFocus,
              topic: input.topic,
              scriptureText: input.scriptureText,
              platform: input.platform,
              meetingNotes: input.meetingNotes,
            })}
          />
        )}

        {activeTab === 'PRAYER_VAULT' && (
          <PrayerVaultView
            prayers={prayers}
            currentUser={currentUser}
            vaultUnlocked={vaultStatusQuery.data?.unlocked ?? false}
            onAddPrayer={(input) => prayerMutations.create.mutate(input)}
            onTogglePrayed={(id) => {
              const p = prayers.find(x => x.id === id);
              prayerMutations.intercede.mutate({ id, praying: p?.isPrayedByMe ?? false });
            }}
            onMarkAnswered={(id, praiseReport) => prayerMutations.markAnswered.mutate({ id, praiseReport })}
            onUnlockVault={async (password) => {
              try {
                await prayerMutations.unlockVault.mutateAsync(password);
                return true;
              } catch {
                return false;
              }
            }}
          />
        )}

        {activeTab === 'MENTORS' && (
          <MentorMatchingView
            mentors={mentors}
            mentees={mentees}
            currentUser={currentUser}
            onSelectMentorForBooking={() => {
              setActiveTab('SESSIONS');
            }}
            onUpdateUserProfile={handleUpdateUserProfile}
            onAddNewUser={handleAddNewUser}
            onPairMentorAndMentee={handlePairMentorAndMentee}
          />
        )}

        {activeTab === 'RESOURCES' && (
          <ResourceLibraryView
            resources={resources}
            currentUser={currentUser}
            enrolledResourceIds={enrolledResourceIds}
            onToggleBookmark={(id) => setResources(resources.map(r => r.id === id ? { ...r, isBookmarked: !r.isBookmarked } : r))}
            onAddNewResource={handleAddNewResource}
            onEnrollResource={handleEnrollResource}
          />
        )}

        {activeTab === 'GOOGLE_DRIVE' && (
          <GoogleDriveView
            currentUser={currentUser}
            sessions={sessions}
            goals={goals}
            prayers={prayers}
            onImportResourceToLibrary={(res) => {
              handleAddNewResource(res);
              setActiveTab('RESOURCES');
            }}
          />
        )}

        {activeTab === 'GOOGLE_CALENDAR' && (
          <GoogleCalendarMeetView
            currentUser={currentUser}
            sessions={sessions}
            onSchedulePlatformSession={() => {
              // Google Calendar/Meet sync moves server-side in migration phase P5;
              // this surface is dormant until then (see services/googleAuth.ts).
            }}
          />
        )}

        {activeTab === 'SECURITY' && (
          <SecuritySettingsView
            security={security}
            currentUser={currentUser}
            onUpdateSecurity={(ns) => setSecurity(ns)}
          />
        )}
      </main>

      {/* Persistent Audio Voice Reflection Player Bar */}
      {activeAudio && (
        <div className="sticky bottom-4 z-40 max-w-4xl w-[94%] mx-auto shadow-2xl">
          <AudioVoicePlayer
            title={activeAudio.title}
            speaker={activeAudio.speaker}
            durationSeconds={activeAudio.duration}
            audioUrl={activeAudio.url}
          />
        </div>
      )}

      {/* Modals */}
      <VideoPlayerModal
        episode={activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
        onToggleLike={(id) => setPodcasts(podcasts.map(p => p.id === id ? { ...p, isLiked: !p.isLiked } : p))}
        onToggleSave={(id) => setPodcasts(podcasts.map(p => p.id === id ? { ...p, isSaved: !p.isSaved } : p))}
      />

      <LiveSessionCallModal
        session={activeLiveCallSession}
        onClose={() => setActiveLiveCallSession(null)}
        onCompleteSession={(sessionId, notes, actionItems) =>
          sessionMutations.complete.mutate({ id: sessionId, notes, actionItems })
        }
      />

      <SpiritualAssistantModal
        isOpen={isSpiritualAssistantOpen}
        onClose={() => setIsSpiritualAssistantOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-display font-bold text-stone-900">Phronesis Mentorship</span>
            <span>• Cross-Generational Kingdom Formation</span>
          </div>
          <p className="text-[11px] text-stone-400">
            "Lavished on us with all wisdom and understanding (phronēsis)" — Ephesians 1:8
          </p>
        </div>
      </footer>
    </div>
  );
};
