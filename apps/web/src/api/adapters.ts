import type {
  GoalItem, MilestoneItem, DailyDevotion, DevotionComment,
  PrayerRequest, DiscipleshipSession, PodcastEpisode, ResourceItem,
} from '../types';
import type {
  GoalDTO, MilestoneDTO, DevotionDTO, DevotionCommentDTO, PrayerDTO, SessionDTO,
  EpisodeDTO, ResourceDTO,
} from './dto';
import {
  SPHERE_TO_UI, SPHERE_TO_API, ROLE_TO_UI, GOAL_STATUS_TO_UI,
  PRAYER_PRIVACY_TO_UI, SESSION_PLATFORM_TO_UI, SESSION_STATUS_TO_UI,
  MEDIA_TYPE_TO_UI, MEDIA_TYPE_TO_API, RESOURCE_TYPE_TO_UI, RESOURCE_TYPE_TO_API,
  ACCESS_TIER_TO_UI, ACCESS_TIER_TO_API,
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

// ---- Media / episodes --------------------------------------------------
export const toEpisode = (e: EpisodeDTO): PodcastEpisode => ({
  id: e.id,
  title: e.title,
  series: e.series,
  speaker: e.speaker,
  speakerRole: e.speaker_role,
  mediaType: MEDIA_TYPE_TO_UI[e.media_type] ?? 'AUDIO',
  durationString: formatDuration(e.duration_seconds),
  durationSeconds: e.duration_seconds,
  releaseDate: e.release_date ?? '',
  sphere: SPHERE_TO_UI[e.sphere] ?? 'PERSONAL_GROWTH',
  description: e.description,
  keyScriptures: e.key_scriptures,
  keyTakeaways: e.key_takeaways,
  viewsCount: e.views_count,
  likesCount: e.likes_count,
  isLiked: e.is_liked_by_me,
  isSaved: e.is_saved_by_me,
  videoEmbedUrl: e.video_embed_url || undefined,
  mediaUrl: e.media_file || undefined,
  coverImageTheme: e.cover_image_theme || 'from-amber-800 to-stone-950',
});

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export interface CreateEpisodeInput {
  title: string;
  series: string;
  speaker: string;
  speakerRole: string;
  mediaType: string;
  durationSeconds: number;
  sphere: string;
  description: string;
  keyScriptures: string[];
  keyTakeaways: string[];
  videoEmbedUrl?: string;
  coverImageTheme?: string;
  /** The actual audio/video file to upload (phase P6); omitted when the
   * episode only links out via `videoEmbedUrl`. */
  file?: File;
}

/** Reverse-adapt the legacy PodcastEpisode object the view builds locally
 * into an API create payload (id/counts/like-state are server-generated). */
export function episodeToCreateInput(ep: PodcastEpisode): CreateEpisodeInput {
  return {
    title: ep.title,
    series: ep.series,
    speaker: ep.speaker,
    speakerRole: ep.speakerRole,
    mediaType: ep.mediaType,
    durationSeconds: ep.durationSeconds,
    sphere: ep.sphere,
    description: ep.description,
    keyScriptures: ep.keyScriptures,
    keyTakeaways: ep.keyTakeaways,
    videoEmbedUrl: ep.videoEmbedUrl,
    coverImageTheme: ep.coverImageTheme,
  };
}

// ---- Resources -----------------------------------------------------
export const toResource = (r: ResourceDTO): ResourceItem => ({
  id: r.id,
  title: r.title,
  author: r.author,
  type: RESOURCE_TYPE_TO_UI[r.type] as ResourceItem['type'] ?? 'PDF_GUIDE',
  sphere: SPHERE_TO_UI[r.sphere] ?? 'PERSONAL_GROWTH',
  description: r.description,
  readTime: r.read_time,
  downloadUrl: r.file ?? r.external_url ?? undefined,
  isBookmarked: r.is_bookmarked_by_me,
  isEnrolled: r.is_enrolled,
  rating: Number(r.rating) || 0,
  accessTier: ACCESS_TIER_TO_UI[r.access_tier] as ResourceItem['accessTier'] ?? 'OPEN_PUBLIC',
  syllabusChapters: r.syllabus_chapters,
  fileSize: r.file_size_bytes ? `${(r.file_size_bytes / 1_000_000).toFixed(1)} MB` : undefined,
  enrolledUsersCount: r.enrolled_users_count,
  uploadedBy: r.uploaded_by_name || undefined,
  uploadDate: r.created_at,
  keyScriptureAnchors: r.key_scripture_anchors,
});

export interface CreateResourceInput {
  title: string;
  author: string;
  type: string;
  sphere: string;
  description: string;
  readTime: string;
  accessTier: string;
  syllabusChapters: string[];
  keyScriptureAnchors: string[];
  /** The actual file to upload (phase P6); omitted when only `externalUrl` is set. */
  file?: File;
}

export function resourceToCreateInput(res: ResourceItem): CreateResourceInput {
  return {
    title: res.title,
    author: res.author,
    type: res.type,
    sphere: res.sphere,
    description: res.description,
    readTime: res.readTime,
    accessTier: res.accessTier ?? 'OPEN_PUBLIC',
    syllabusChapters: res.syllabusChapters ?? [],
    keyScriptureAnchors: res.keyScriptureAnchors ?? [],
  };
}

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
