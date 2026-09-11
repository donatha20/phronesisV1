import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { UserProfile, DiscipleshipSession, PodcastEpisode } from './types';
import { initialMentees } from './data/sampleData';
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
  useEpisodes, useEpisodeMutations,
  useResources, useResourceMutations,
  useMentorsDirectory, useMentorshipMutations, useUpdateMyProfile,
  useMySecuritySettings, useSecurityMutations,
} from './api/hooks';
import { episodeToCreateInput, resourceToCreateInput } from './api/adapters';

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
  const currentUser = useMemo(() => apiUserToProfile(apiUser), [apiUser]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('DASHBOARD');

  // The Google Workspace connect/disconnect broker redirects back to `/`
  // with `google_connected=1` or `google_error=<code>` — land on the Drive
  // tab so the result is visible, then scrub the query string.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('google_connected') || params.has('google_error')) {
      setActiveTab('GOOGLE_DRIVE');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // ---- API-backed domains --------------------------------------------
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

  const episodesQuery = useEpisodes();
  const episodeMutations = useEpisodeMutations();
  const podcasts = episodesQuery.data ?? [];

  const resourcesQuery = useResources();
  const resourceMutations = useResourceMutations();
  const resources = resourcesQuery.data ?? [];

  const mentorsQuery = useMentorsDirectory();
  const mentors = mentorsQuery.data ?? [];
  const mentees = initialMentees; // no safe/authorized backend directory for mentees yet
  const mentorshipMutations = useMentorshipMutations();
  const updateMyProfile = useUpdateMyProfile();

  const securityQuery = useMySecuritySettings();
  const securityMutations = useSecurityMutations();

  // Modals & Floating Players
  const [activeAudio, setActiveAudio] = useState<{ title: string; speaker: string; duration: number; url?: string } | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<PodcastEpisode | null>(null);
  const [activeLiveCallSession, setActiveLiveCallSession] = useState<DiscipleshipSession | null>(null);
  const [isSpiritualAssistantOpen, setIsSpiritualAssistantOpen] = useState(false);

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
            onAddNewPodcast={(np) => episodeMutations.create.mutate(episodeToCreateInput(np))}
            onToggleSave={(id) => {
              const p = podcasts.find(x => x.id === id);
              episodeMutations.toggleSave.mutate({ id, saved: p?.isSaved ?? false });
            }}
            onToggleLike={(id) => {
              const p = podcasts.find(x => x.id === id);
              episodeMutations.toggleLike.mutate({ id, liked: p?.isLiked ?? false });
            }}
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
            onEditMyBio={(input) => {
              updateMyProfile.mutate(
                {
                  title: input.title,
                  location: input.location,
                  years_in_faith: input.yearsInFaith,
                  church_community: input.churchCommunity,
                  bio: input.bio,
                  full_biography: input.fullBiography,
                  ministry_journey: input.ministryJourney,
                  mentorship_philosophy: input.mentorshipPhilosophy,
                  availability_schedule: input.availabilitySchedule,
                  favorite_scripture: input.favoriteScripture,
                },
                { onSuccess: () => auth.refresh() },
              );
            }}
            onApplyToMentor={(input) => mentorshipMutations.apply.mutate({
              mentorId: input.mentorId,
              sphere: input.sphere,
              introduction: input.introduction,
              growthDesire: input.growthDesire,
              meetingFrequency: input.meetingFrequency,
            })}
          />
        )}

        {activeTab === 'RESOURCES' && (
          <ResourceLibraryView
            resources={resources}
            currentUser={currentUser}
            enrolledResourceIds={resources.filter(r => r.isEnrolled).map(r => r.id)}
            onToggleBookmark={(id) => {
              const r = resources.find(x => x.id === id);
              resourceMutations.toggleBookmark.mutate({ id, bookmarked: r?.isBookmarked ?? false });
            }}
            onAddNewResource={(res) => resourceMutations.create.mutate(resourceToCreateInput(res), {
              onSuccess: (dto) => resourceMutations.enroll.mutate(dto.id),
            })}
            onEnrollResource={(id) => resourceMutations.enroll.mutate(id)}
          />
        )}

        {activeTab === 'GOOGLE_DRIVE' && (
          <GoogleDriveView
            currentUser={currentUser}
            sessions={sessions}
            goals={goals}
            prayers={prayers}
            onImportResourceToLibrary={(res) => {
              resourceMutations.create.mutate(resourceToCreateInput(res));
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
            currentUser={currentUser}
            twoFactorEnabled={securityQuery.data?.two_factor_enabled ?? false}
            lastVaultUnlockAt={securityQuery.data?.last_vault_unlock_at ?? null}
            lastPasswordChangeAt={securityQuery.data?.last_password_change_at ?? null}
            onToggleTwoFactor={(enabled) => securityMutations.updateTwoFactor.mutate(enabled)}
            onChangePassword={async (oldPassword, newPassword) => {
              await securityMutations.changePassword.mutateAsync({ oldPassword, newPassword });
            }}
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
        onToggleLike={(id) => {
          const p = podcasts.find(x => x.id === id);
          episodeMutations.toggleLike.mutate({ id, liked: p?.isLiked ?? false });
        }}
        onToggleSave={(id) => {
          const p = podcasts.find(x => x.id === id);
          episodeMutations.toggleSave.mutate({ id, saved: p?.isSaved ?? false });
        }}
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
