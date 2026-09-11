/** Shape returned by `GET /api/auth/user/` (Django `UserSerializer`). */
export interface ApiUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  /** The assigned role's slug — may be a custom admin-created role (e.g.
   * "youth-pastor"), not just mentee/mentor/admin. Use `role_base_kind` for
   * anything permission- or UI-mode-related. */
  role: string;
  /** Always one of mentee/mentor/admin, regardless of how many custom roles
   * exist — this is what every RBAC/UI-mode decision should key off. */
  role_base_kind: 'mentee' | 'mentor' | 'admin';
  role_name: string;
  avatar_initial: string;
  profile_completed: boolean;
  title: string;
  age: number | null;
  location: string;
  bio: string;
  full_biography: string;
  ministry_journey: string;
  mentorship_philosophy: string;
  availability_schedule: string;
  church_community: string;
  years_in_faith: number | null;
  favorite_scripture: string;
  spiritual_gifts: string[];
  primary_spheres: string[];
  focus_spheres: string[];
  badges: string[];
  phone: string;
  whatsapp_number: string;
  telegram_username: string;
  is_verified_elder: boolean;
  active_mentees_count: number;
  discipleship_hours: number;
  date_joined: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';
