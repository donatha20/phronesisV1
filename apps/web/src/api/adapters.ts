import type {
  GoalItem, MilestoneItem, DailyDevotion, DevotionComment,
  PrayerRequest, DiscipleshipSession,
} from '../types';
import type {
  GoalDTO, MilestoneDTO, DevotionDTO, DevotionCommentDTO, PrayerDTO, SessionDTO,
} from './dto';
import {
  SPHERE_TO_UI, ROLE_TO_UI, GOAL_STATUS_TO_UI,
  PRAYER_PRIVACY_TO_UI, SESSION_PLATFORM_TO_UI, SESSION_STATUS_TO_UI,
} from './enums';

const initialOf = (name: string) => (name.trim()[0] || '?').toUpperCase();

// ---- Goals ----------------------------------------------------------------
export const toMilestone = (m: MilestoneDTO): MilestoneItem => ({
  id: m.id,
  title: m.title,
  isCompleted: m.is_completed,
  completedDate: m.completed_date ?? undefined,
});

export const toGoal = (g: GoalDTO): GoalItem => ({
  id: g.id,
  sphere: SPHERE_TO_UI[g.sphere] ?? 'PERSONAL_GROWTH',
  title: g.title,
  description: g.description,
  scriptureAnchor: g.scripture_anchor,
  targetDate: g.target_date ?? '',
  milestones: g.milestones.map(toMilestone),
  status: GOAL_STATUS_TO_UI[g.status] ?? 'ACTIVE',
  mentorFeedback: g.mentor_feedback,
  mentorApproved: g.mentor_approved,
  checkInFrequency: g.check_in_frequency,
  progressPercent: g.progress_percent,
  createdBy: g.created_by,
  assignedTo: g.assigned_to,
});

// ---- Devotions ----------------------------------------------------------
export const toDevotionComment = (c: DevotionCommentDTO): DevotionComment => ({
  id: c.id,
  authorName: c.author_name,
  authorRole: ROLE_TO_UI[c.author_role] ?? 'YOUNG_BELIEVER_MENTEE',
  authorInitial: initialOf(c.author_name),
  text: c.text,
  timestamp: new Date(c.created_at).toLocaleDateString(),
  likes: c.likes_count,
  isUserLiked: c.is_liked_by_me,
});

export const toDevotion = (
  d: DevotionDTO,
  comments: DevotionComment[] = [],
): DailyDevotion => ({
  id: d.id,
  title: d.title,
  date: d.date,
  theme: d.theme,
  authorName: d.author_name,
  authorRole: ROLE_TO_UI[d.author_role] ?? 'MENTOR_ELDER',
  authorTitle: d.author_title,
  scriptureReference: d.scripture_reference,
  scriptureText: d.scripture_text,
  reflectionBody: d.reflection_body,
  prayerPoint: d.prayer_point,
  practicalActionStep: d.practical_action_step,
  audioDurationSeconds: d.audio_duration_seconds,
  audioVoiceNoteUrl: d.audio_voice_note ?? undefined,
  categorySphere: SPHERE_TO_UI[d.category_sphere] ?? 'PERSONAL_GROWTH',
  likesCount: d.likes_count,
  isLikedByUser: d.is_liked_by_me,
  comments,
  tags: d.tags,
  readTimeMinutes: d.read_time_minutes,
});

// ---- Prayers ----------------------------------------------------------
export const toPrayer = (p: PrayerDTO): PrayerRequest => ({
  id: p.id,
  authorName: p.author_name,
  authorId: p.author,
  title: p.title,
  prayerNeed: p.prayer_need,
  categorySphere: SPHERE_TO_UI[p.category_sphere] ?? 'PERSONAL_GROWTH',
  privacyLevel: PRAYER_PRIVACY_TO_UI[p.privacy_level] ?? 'PRIVATE_VAULT',
  isAnswered: p.is_answered,
  praiseReport: p.praise_report || undefined,
  createdAt: p.created_at,
  intercessorsCount: p.intercessors_count,
  isPrayedByMe: p.is_prayed_by_me,
  isEncrypted: p.privacy_level === 'private_vault',
  cipherHint: p.is_body_hidden ? 'Locked — unlock the vault to view' : '',
  tags: p.tags,
});

// ---- Sessions --------------------------------------------------------
export const toSession = (s: SessionDTO): DiscipleshipSession => ({
  id: s.id,
  menteeId: s.mentee,
  menteeName: s.mentee_name,
  mentorId: s.mentor,
  mentorName: s.mentor_name,
  scheduledTime: new Date(s.scheduled_at).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }),
  durationMinutes: s.duration_minutes,
  sphereFocus: SPHERE_TO_UI[s.sphere_focus] ?? 'PERSONAL_GROWTH',
  topic: s.topic,
  scriptureText: s.scripture_text,
  platform: SESSION_PLATFORM_TO_UI[s.platform] ?? 'GOOGLE_MEET',
  status: SESSION_STATUS_TO_UI[s.status] ?? 'SCHEDULED',
  meetingNotes: s.meeting_notes,
  actionItems: s.action_items,
  postSessionPrayer: s.post_session_prayer,
  meetingLink: s.meet_url || s.meeting_link || undefined,
});
