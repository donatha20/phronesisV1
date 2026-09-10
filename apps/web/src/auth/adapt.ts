import type { UserProfile, UserRole, LifeSphere } from '../types';
import type { ApiUser } from './types';

const ROLE_MAP: Record<ApiUser['role'], UserRole> = {
  mentee: 'YOUNG_BELIEVER_MENTEE',
  mentor: 'MENTOR_ELDER',
  admin: 'ADMIN',
};

const SPHERE_MAP: Record<string, LifeSphere> = {
  personal_growth: 'PERSONAL_GROWTH',
  academia_career: 'ACADEMIA_CAREER',
  relationships: 'RELATIONSHIPS',
  finances: 'FINANCES',
  physical_wellbeing: 'PHYSICAL_WELLBEING',
};

function mapSpheres(values: string[]): LifeSphere[] {
  return values.map((v) => SPHERE_MAP[v]).filter(Boolean) as LifeSphere[];
}

/**
 * Bridge the authenticated API user onto the legacy `UserProfile` shape the
 * views still expect. `template` supplies defaults for fields the API does not
 * yet serve; those are removed in phase P4 when the views move onto the API.
 */
export function apiUserToProfile(api: ApiUser, template: UserProfile): UserProfile {
  return {
    ...template,
    id: api.id,
    name: api.display_name || api.email,
    role: ROLE_MAP[api.role],
    title: api.title || template.title,
    bio: api.bio || template.bio,
    fullBiography: api.full_biography || template.fullBiography,
    ministryJourney: api.ministry_journey || template.ministryJourney,
    mentorshipPhilosophy: api.mentorship_philosophy || template.mentorshipPhilosophy,
    availabilitySchedule: api.availability_schedule || template.availabilitySchedule,
    location: api.location || template.location,
    age: api.age ?? template.age,
    yearsInFaith: api.years_in_faith ?? template.yearsInFaith,
    churchCommunity: api.church_community || template.churchCommunity,
    favoriteScripture: api.favorite_scripture || template.favoriteScripture,
    spiritualGifts: api.spiritual_gifts.length ? api.spiritual_gifts : template.spiritualGifts,
    primarySpheres: api.primary_spheres.length
      ? mapSpheres(api.primary_spheres)
      : template.primarySpheres,
    badges: api.badges.length ? api.badges : template.badges,
    email: api.email,
    phone: api.phone || template.phone,
    whatsappNumber: api.whatsapp_number || template.whatsappNumber,
    telegramUsername: api.telegram_username || template.telegramUsername,
    isVerifiedElder: api.is_verified_elder,
    activeMenteesCount: api.active_mentees_count,
    discipleshipHours: api.discipleship_hours,
    avatarInitial: api.avatar_initial || template.avatarInitial,
  };
}
