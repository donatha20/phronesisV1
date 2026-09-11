import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import type {
  GoalDTO, DevotionDTO, DevotionCommentDTO, PrayerDTO, SessionDTO, MentorshipDTO, Paginated,
} from './dto';
import {
  toGoal, toDevotion, toDevotionComment, toPrayer, toSession,
} from './adapters';
import {
  SPHERE_TO_API, GOAL_STATUS_TO_API, PRAYER_PRIVACY_TO_API, SESSION_PLATFORM_TO_API,
} from './enums';

const list = <T>(path: string) => apiFetch<Paginated<T>>(path).then((r) => r.results ?? (r as unknown as T[]));

export const qk = {
  goals: ['goals'] as const,
  devotions: ['devotions'] as const,
  devotionComments: (id: string) => ['devotion-comments', id] as const,
  prayers: ['prayers'] as const,
  vaultStatus: ['vault-status'] as const,
  sessions: ['sessions'] as const,
  mentorships: ['mentorships'] as const,
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
