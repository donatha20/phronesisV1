/** Two-way maps between the Django API's snake_case enums and the legacy
 *  UPPER_SNAKE enums the existing views use (apps/web/src/types.ts). */
import type { LifeSphere, UserRole, GoalStatus, PrayerPrivacyLevel, SessionPlatform, SessionStatus } from '../types';

export const SPHERE_TO_UI: Record<string, LifeSphere> = {
  personal_growth: 'PERSONAL_GROWTH',
  academia_career: 'ACADEMIA_CAREER',
  relationships: 'RELATIONSHIPS',
  finances: 'FINANCES',
  physical_wellbeing: 'PHYSICAL_WELLBEING',
};
export const SPHERE_TO_API: Record<string, string> = invert(SPHERE_TO_UI);

export const ROLE_TO_UI: Record<string, UserRole> = {
  mentee: 'YOUNG_BELIEVER_MENTEE',
  mentor: 'MENTOR_ELDER',
  admin: 'ADMIN',
};

export const GOAL_STATUS_TO_UI: Record<string, GoalStatus> = {
  active: 'ACTIVE',
  completed: 'COMPLETED',
  paused: 'PAUSED',
  under_review: 'UNDER_REVIEW',
};
export const GOAL_STATUS_TO_API: Record<string, string> = invert(GOAL_STATUS_TO_UI);

export const PRAYER_PRIVACY_TO_UI: Record<string, PrayerPrivacyLevel> = {
  private_vault: 'PRIVATE_VAULT',
  mentor_only: 'MENTOR_ONLY',
  community_intercessors: 'COMMUNITY_INTERCESSORS',
};
export const PRAYER_PRIVACY_TO_API: Record<string, string> = invert(PRAYER_PRIVACY_TO_UI);

export const SESSION_PLATFORM_TO_UI: Record<string, SessionPlatform> = {
  google_meet: 'GOOGLE_MEET',
  in_app_video: 'IN_APP_VIDEO',
  in_app_audio: 'IN_APP_AUDIO',
  audio_room: 'AUDIO_ROOM',
  whatsapp: 'WHATSAPP',
  zoom: 'ZOOM',
  in_person: 'IN_PERSON',
};
export const SESSION_PLATFORM_TO_API: Record<string, string> = invert(SESSION_PLATFORM_TO_UI);

export const MEDIA_TYPE_TO_UI: Record<string, 'AUDIO' | 'VIDEO'> = {
  audio: 'AUDIO',
  video: 'VIDEO',
};
export const MEDIA_TYPE_TO_API: Record<string, string> = invert(MEDIA_TYPE_TO_UI);

export const RESOURCE_TYPE_TO_UI: Record<string, string> = {
  pdf_guide: 'PDF_GUIDE',
  study_series: 'STUDY_SERIES',
  sermon_transcript: 'SERMON_TRANSCRIPT',
  book_recommendation: 'BOOK_RECOMMENDATION',
};
export const RESOURCE_TYPE_TO_API: Record<string, string> = invert(RESOURCE_TYPE_TO_UI);

export const ACCESS_TIER_TO_UI: Record<string, string> = {
  open_public: 'OPEN_PUBLIC',
  registered_disciples: 'REGISTERED_DISCIPLES',
  elders_only: 'ELDERS_ONLY',
  enrolled_cohort: 'ENROLLED_COHORT',
};
export const ACCESS_TIER_TO_API: Record<string, string> = invert(ACCESS_TIER_TO_UI);

export const SESSION_STATUS_TO_UI: Record<string, SessionStatus> = {
  scheduled: 'SCHEDULED',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

function invert(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
}
