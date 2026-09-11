/** Raw response shapes from the Django REST API (snake_case). */

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MilestoneDTO {
  id: string;
  title: string;
  is_completed: boolean;
  completed_date: string | null;
  order: number;
  created_at: string;
}

export interface GoalDTO {
  id: string;
  sphere: string;
  title: string;
  description: string;
  scripture_anchor: string;
  target_date: string | null;
  status: string;
  check_in_frequency: string;
  progress_percent: number;
  mentor_feedback: string;
  mentor_approved: boolean;
  created_by: string;
  assigned_to: string;
  milestones: MilestoneDTO[];
  mentor_fields_editable: boolean;
  created_at: string;
  updated_at: string;
}

export interface DevotionDTO {
  id: string;
  title: string;
  date: string;
  theme: string;
  author: string | null;
  author_name: string;
  author_role: string;
  author_title: string;
  scripture_reference: string;
  scripture_text: string;
  reflection_body: string;
  prayer_point: string;
  practical_action_step: string;
  audio_voice_note: string | null;
  audio_duration_seconds: number;
  category_sphere: string;
  tags: string[];
  read_time_minutes: number;
  likes_count: number;
  comments_count: number;
  is_liked_by_me: boolean;
  created_at: string;
  updated_at: string;
}

export interface DevotionCommentDTO {
  id: string;
  devotion: string;
  author: string | null;
  author_name: string;
  author_role: string;
  text: string;
  likes_count: number;
  is_liked_by_me: boolean;
  created_at: string;
}

export interface PrayerDTO {
  id: string;
  author: string;
  author_name: string;
  title: string;
  prayer_need: string;
  category_sphere: string;
  privacy_level: string;
  is_answered: boolean;
  praise_report: string;
  answered_at: string | null;
  tags: string[];
  intercessors_count: number;
  is_prayed_by_me: boolean;
  is_body_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface EpisodeDTO {
  id: string;
  title: string;
  series: string;
  speaker: string;
  speaker_role: string;
  media_type: string;
  media_file: string | null;
  video_embed_url: string;
  cover_image_theme: string;
  duration_seconds: number;
  release_date: string | null;
  sphere: string;
  description: string;
  key_scriptures: string[];
  key_takeaways: string[];
  views_count: number;
  uploaded_by: string | null;
  uploaded_by_name: string;
  likes_count: number;
  is_liked_by_me: boolean;
  is_saved_by_me: boolean;
  created_at: string;
}

export interface ResourceDTO {
  id: string;
  title: string;
  author: string;
  type: string;
  sphere: string;
  description: string;
  read_time: string;
  file: string | null;
  external_url: string;
  file_size_bytes: number | null;
  rating: string;
  access_tier: string;
  syllabus_chapters: string[];
  key_scripture_anchors: string[];
  uploaded_by: string | null;
  uploaded_by_name: string;
  is_bookmarked_by_me: boolean;
  is_enrolled: boolean;
  enrolled_users_count: number;
  created_at: string;
}

export interface MentorshipDTO {
  id: string;
  mentee: string;
  mentee_name: string;
  mentor: string;
  mentor_name: string;
  is_active: boolean;
  paired_at: string | null;
}

export interface SessionDTO {
  id: string;
  mentee: string;
  mentee_name: string;
  mentor: string;
  mentor_name: string;
  scheduled_at: string;
  duration_minutes: number;
  sphere_focus: string;
  topic: string;
  scripture_text: string;
  platform: string;
  status: string;
  meeting_notes: string;
  action_items: string[];
  post_session_prayer: string;
  meeting_link: string;
  google_calendar_event_id: string;
  meet_space_id: string;
  meet_url: string;
  created_at: string;
  updated_at: string;
}

// ---- Admin: roles & users --------------------------------------------
export interface RoleDTO {
  id: string;
  name: string;
  slug: string;
  base_kind: string;
  capabilities: string[];
  is_system: boolean;
  description: string;
  created_at: string;
}

export interface AdminUserDTO {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: RoleDTO;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}
