import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { apiUserToProfile } from '../auth/adapt';
import type { ApiUser } from '../auth/types';
import type {
  GoalDTO, DevotionDTO, DevotionCommentDTO, PrayerDTO, SessionDTO, MentorshipDTO,
  EpisodeDTO, ResourceDTO, Paginated,
} from './dto';
import {
  toGoal, toDevotion, toDevotionComment, toPrayer, toSession, toEpisode, toResource,
} from './adapters';
import type { CreateEpisodeInput, CreateResourceInput } from './adapters';
import {
  SPHERE_TO_API, GOAL_STATUS_TO_API, PRAYER_PRIVACY_TO_API, SESSION_PLATFORM_TO_API,
  MEDIA_TYPE_TO_API, RESOURCE_TYPE_TO_API, ACCESS_TIER_TO_API,
} from './enums';
import { uploadFileDirect, DirectUploadNotSupported } from './directUpload';

const list = <T>(path: string) => apiFetch<Paginated<T>>(path).then((r) => r.results ?? (r as unknown as T[]));

export const qk = {
  goals: ['goals'] as const,
  devotions: ['devotions'] as const,
  devotionComments: (id: string) => ['devotion-comments', id] as const,
  prayers: ['prayers'] as const,
  vaultStatus: ['vault-status'] as const,
  sessions: ['sessions'] as const,
  mentorships: ['mentorships'] as const,
  episodes: ['episodes'] as const,
  resources: ['resources'] as const,
  mentors: ['mentors'] as const,
  security: ['security'] as const,
};

/** The current user's single active mentorship, if any (works for either role). */
export function useMyMentorship() {
  return useQuery({
    queryKey: qk.mentorships,
    queryFn: () => list<MentorshipDTO>('/api/mentorships/'),
    select: (rows) => rows.find((m) => m.is_active) ?? null,
  });
}

// ---- Goals -------------------------------------------------------------
export function useGoals() {
  return useQuery({
    queryKey: qk.goals,
    queryFn: () => list<GoalDTO>('/api/goals/').then((rows) => rows.map(toGoal)),
  });
}

export function useGoalMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.goals });

  const create = useMutation({
    mutationFn: (input: {
      title: string; description: string; sphere: string; scriptureAnchor: string;
      targetDate?: string; checkInFrequency?: string; milestones: string[];
    }) =>
      apiFetch<GoalDTO>('/api/goals/', {
        method: 'POST',
        json: {
          title: input.title,
          description: input.description,
          sphere: SPHERE_TO_API[input.sphere] ?? 'personal_growth',
          scripture_anchor: input.scriptureAnchor,
          target_date: input.targetDate || null,
          check_in_frequency: input.checkInFrequency ?? '',
          milestones: input.milestones.map((title) => ({ title })),
        },
      }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const body = { ...patch };
      if (typeof body.status === 'string') body.status = GOAL_STATUS_TO_API[body.status] ?? body.status;
      return apiFetch<GoalDTO>(`/api/goals/${id}/`, { method: 'PATCH', json: body });
    },
    onSuccess: invalidate,
  });

  const toggleMilestone = useMutation({
    mutationFn: ({ goalId, milestoneId, isCompleted }: { goalId: string; milestoneId: string; isCompleted: boolean }) =>
      apiFetch<GoalDTO>(`/api/goals/${goalId}/milestones/${milestoneId}/`, {
        method: 'PATCH',
        json: { is_completed: isCompleted, completed_date: isCompleted ? new Date().toISOString().slice(0, 10) : null },
      }),
    onSuccess: invalidate,
  });

  return { create, update, toggleMilestone };
}

// ---- Devotions -------------------------------------------------------
export function useDevotions() {
  return useQuery({
    queryKey: qk.devotions,
    queryFn: () => list<DevotionDTO>('/api/devotions/').then((rows) => rows.map((d) => toDevotion(d))),
  });
}

export function useDevotionComments(devotionId: string | null) {
  return useQuery({
    queryKey: qk.devotionComments(devotionId ?? ''),
    enabled: !!devotionId,
    queryFn: () =>
      list<DevotionCommentDTO>(`/api/devotions/${devotionId}/comments/`).then((rows) =>
        rows.map(toDevotionComment),
      ),
  });
}

export function useDevotionMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (input: {
      title: string; scriptureReference: string; scriptureText: string; reflectionBody: string;
      prayerPoint: string; practicalActionStep: string; sphere: string;
    }) =>
      apiFetch<DevotionDTO>('/api/devotions/', {
        method: 'POST',
        json: {
          title: input.title,
          date: new Date().toISOString().slice(0, 10),
          category_sphere: SPHERE_TO_API[input.sphere] ?? 'personal_growth',
          scripture_reference: input.scriptureReference,
          scripture_text: input.scriptureText,
          reflection_body: input.reflectionBody,
          prayer_point: input.prayerPoint,
          practical_action_step: input.practicalActionStep,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.devotions }),
  });

  const toggleLike = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      apiFetch(`/api/devotions/${id}/like/`, { method: liked ? 'DELETE' : 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.devotions }),
  });

  const addComment = useMutation({
    mutationFn: ({ devotionId, text }: { devotionId: string; text: string }) =>
      apiFetch<DevotionCommentDTO>(`/api/devotions/${devotionId}/comments/`, {
        method: 'POST',
        json: { text },
      }),
    onSuccess: (_data, { devotionId }) => {
      qc.invalidateQueries({ queryKey: qk.devotionComments(devotionId) });
      qc.invalidateQueries({ queryKey: qk.devotions });
    },
  });

  return { create, toggleLike, addComment };
}

// ---- Prayers -------------------------------------------------------
export function usePrayers() {
  return useQuery({
    queryKey: qk.prayers,
    queryFn: () => list<PrayerDTO>('/api/prayers/').then((rows) => rows.map(toPrayer)),
  });
}

export function useVaultStatus() {
  return useQuery({
    queryKey: qk.vaultStatus,
    queryFn: () => apiFetch<{ unlocked: boolean }>('/api/prayers/vault/status/'),
  });
}

export function usePrayerMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.prayers });

  const create = useMutation({
    mutationFn: (input: {
      title: string; prayerNeed: string; sphere: string; privacy: string; tags: string[];
    }) =>
      apiFetch<PrayerDTO>('/api/prayers/', {
        method: 'POST',
        json: {
          title: input.title,
          prayer_need: input.prayerNeed,
          category_sphere: SPHERE_TO_API[input.sphere] ?? 'personal_growth',
          privacy_level: PRAYER_PRIVACY_TO_API[input.privacy] ?? 'private_vault',
          tags: input.tags,
        },
      }),
    onSuccess: invalidate,
  });

  const intercede = useMutation({
    mutationFn: ({ id, praying }: { id: string; praying: boolean }) =>
      apiFetch(`/api/prayers/${id}/intercede/`, { method: praying ? 'DELETE' : 'POST' }),
    onSuccess: invalidate,
  });

  const markAnswered = useMutation({
    mutationFn: ({ id, praiseReport }: { id: string; praiseReport: string }) =>
      apiFetch(`/api/prayers/${id}/answer/`, { method: 'POST', json: { praise_report: praiseReport } }),
    onSuccess: invalidate,
  });

  const unlockVault = useMutation({
    mutationFn: (password: string) =>
      apiFetch('/api/prayers/vault/unlock/', { method: 'POST', json: { password } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.vaultStatus });
      qc.invalidateQueries({ queryKey: qk.prayers });
    },
  });

  return { create, intercede, markAnswered, unlockVault };
}

// ---- Sessions -----------------------------------------------------
export function useSessions() {
  return useQuery({
    queryKey: qk.sessions,
    queryFn: () => list<SessionDTO>('/api/sessions/').then((rows) => rows.map(toSession)),
  });
}

export function useSessionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.sessions });

  const create = useMutation({
    mutationFn: (input: {
      menteeId: string; mentorId: string; scheduledAt: string; durationMinutes: number;
      sphereFocus: string; topic: string; scriptureText: string; platform: string; meetingNotes: string;
    }) =>
      apiFetch<SessionDTO>('/api/sessions/', {
        method: 'POST',
        json: {
          mentee: input.menteeId,
          mentor: input.mentorId,
          scheduled_at: input.scheduledAt,
          duration_minutes: input.durationMinutes,
          sphere_focus: SPHERE_TO_API[input.sphereFocus] ?? 'personal_growth',
          topic: input.topic,
          scripture_text: input.scriptureText,
          platform: SESSION_PLATFORM_TO_API[input.platform] ?? 'google_meet',
          meeting_notes: input.meetingNotes,
        },
      }),
    onSuccess: invalidate,
  });

  const complete = useMutation({
    mutationFn: ({ id, notes, actionItems }: { id: string; notes: string; actionItems: string[] }) =>
      apiFetch(`/api/sessions/${id}/complete/`, {
        method: 'POST',
        json: { meeting_notes: notes, action_items: actionItems },
      }),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/sessions/${id}/cancel/`, { method: 'POST' }),
    onSuccess: invalidate,
  });

  return { create, complete, cancel };
}

// ---- Media / episodes -------------------------------------------------
export function useEpisodes() {
  return useQuery({
    queryKey: qk.episodes,
    queryFn: () => list<EpisodeDTO>('/api/episodes/').then((rows) => rows.map(toEpisode)),
  });
}

export function useEpisodeMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.episodes });

  const create = useMutation({
    mutationFn: async (input: CreateEpisodeInput) => {
      const fields = {
        title: input.title,
        series: input.series,
        speaker: input.speaker,
        speaker_role: input.speakerRole,
        media_type: MEDIA_TYPE_TO_API[input.mediaType] ?? 'audio',
        duration_seconds: input.durationSeconds,
        sphere: SPHERE_TO_API[input.sphere] ?? 'personal_growth',
        description: input.description,
        key_scriptures: input.keyScriptures,
        key_takeaways: input.keyTakeaways,
        video_embed_url: input.videoEmbedUrl ?? '',
        cover_image_theme: input.coverImageTheme ?? '',
      };

      if (input.file) {
        try {
          const media_file_key = await uploadFileDirect(input.file, '/api/episodes/presign-upload/');
          return apiFetch<EpisodeDTO>('/api/episodes/', {
            method: 'POST',
            json: { ...fields, media_file_key },
          });
        } catch (err) {
          if (!(err instanceof DirectUploadNotSupported)) throw err;
          const form = new FormData();
          Object.entries(fields).forEach(([key, value]) =>
            form.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value)),
          );
          form.append('media_file', input.file);
          return apiFetch<EpisodeDTO>('/api/episodes/', { method: 'POST', rawBody: form });
        }
      }

      return apiFetch<EpisodeDTO>('/api/episodes/', { method: 'POST', json: fields });
    },
    onSuccess: invalidate,
  });

  const toggleLike = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      apiFetch(`/api/episodes/${id}/like/`, { method: liked ? 'DELETE' : 'POST' }),
    onSuccess: invalidate,
  });

  const toggleSave = useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      apiFetch(`/api/episodes/${id}/save/`, { method: saved ? 'DELETE' : 'POST' }),
    onSuccess: invalidate,
  });

  return { create, toggleLike, toggleSave };
}

// ---- Resources -----------------------------------------------------
export function useResources() {
  return useQuery({
    queryKey: qk.resources,
    queryFn: () => list<ResourceDTO>('/api/resources/').then((rows) => rows.map(toResource)),
  });
}

export function useResourceMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.resources });

  const create = useMutation({
    mutationFn: async (input: CreateResourceInput) => {
      const fields = {
        title: input.title,
        author: input.author,
        type: RESOURCE_TYPE_TO_API[input.type] ?? 'pdf_guide',
        sphere: SPHERE_TO_API[input.sphere] ?? 'personal_growth',
        description: input.description,
        read_time: input.readTime,
        access_tier: ACCESS_TIER_TO_API[input.accessTier] ?? 'open_public',
        syllabus_chapters: input.syllabusChapters,
        key_scripture_anchors: input.keyScriptureAnchors,
      };

      if (input.file) {
        try {
          const file_key = await uploadFileDirect(input.file, '/api/resources/presign-upload/');
          return apiFetch<ResourceDTO>('/api/resources/', {
            method: 'POST',
            json: { ...fields, file_key },
          });
        } catch (err) {
          if (!(err instanceof DirectUploadNotSupported)) throw err;
          const form = new FormData();
          Object.entries(fields).forEach(([key, value]) =>
            form.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value)),
          );
          form.append('file', input.file);
          return apiFetch<ResourceDTO>('/api/resources/', { method: 'POST', rawBody: form });
        }
      }

      return apiFetch<ResourceDTO>('/api/resources/', { method: 'POST', json: fields });
    },
    onSuccess: invalidate,
  });

  const toggleBookmark = useMutation({
    mutationFn: ({ id, bookmarked }: { id: string; bookmarked: boolean }) =>
      apiFetch(`/api/resources/${id}/bookmark/`, { method: bookmarked ? 'DELETE' : 'POST' }),
    onSuccess: invalidate,
  });

  const enroll = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/resources/${id}/enroll/`, { method: 'POST' }),
    onSuccess: invalidate,
  });

  return { create, toggleBookmark, enroll };
}

// ---- Mentor directory + applications -----------------------------------
export function useMentorsDirectory() {
  return useQuery({
    queryKey: qk.mentors,
    queryFn: () => list<ApiUser>('/api/mentors/').then((rows) => rows.map((u) => apiUserToProfile(u))),
  });
}

export function useMentorshipMutations() {
  const qc = useQueryClient();

  const apply = useMutation({
    mutationFn: (input: {
      mentorId: string; sphere: string; introduction: string; growthDesire: string; meetingFrequency: string;
    }) =>
      apiFetch('/api/mentorship-applications/', {
        method: 'POST',
        json: {
          mentor: input.mentorId,
          chosen_sphere: SPHERE_TO_API[input.sphere] ?? 'personal_growth',
          personal_introduction: input.introduction,
          growth_desire: input.growthDesire,
          meeting_frequency: input.meetingFrequency,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.mentorships }),
  });

  return { apply };
}

/** PATCH the caller's own profile (`/api/auth/user/`). Callers should follow a
 * successful mutation with `auth.refresh()` to resync AuthContext's copy. */
export function useUpdateMyProfile() {
  return useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      apiFetch('/api/auth/user/', { method: 'PATCH', json: patch }),
  });
}

// ---- Security settings -------------------------------------------------
export interface SecuritySettingsDTO {
  two_factor_enabled: boolean;
  last_vault_unlock_at: string | null;
  last_password_change_at: string | null;
}

export function useMySecuritySettings() {
  return useQuery({
    queryKey: qk.security,
    queryFn: () => apiFetch<SecuritySettingsDTO>('/api/auth/security/'),
  });
}

export function useSecurityMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.security });

  const updateTwoFactor = useMutation({
    mutationFn: (twoFactorEnabled: boolean) =>
      apiFetch<SecuritySettingsDTO>('/api/auth/security/', {
        method: 'PATCH',
        json: { two_factor_enabled: twoFactorEnabled },
      }),
    onSuccess: invalidate,
  });

  const changePassword = useMutation({
    mutationFn: (input: { oldPassword: string; newPassword: string }) =>
      apiFetch('/api/auth/password/change/', {
        method: 'POST',
        json: {
          old_password: input.oldPassword,
          new_password1: input.newPassword,
          new_password2: input.newPassword,
        },
      }),
    onSuccess: invalidate,
  });

  return { updateTwoFactor, changePassword };
}
