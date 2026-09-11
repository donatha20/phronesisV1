export type UserRole = 'YOUNG_BELIEVER_MENTEE' | 'MENTOR_ELDER' | 'ADMIN';

export type LifeSphere = 
  | 'PERSONAL_GROWTH' 
  | 'ACADEMIA_CAREER' 
  | 'RELATIONSHIPS' 
  | 'FINANCES' 
  | 'PHYSICAL_WELLBEING';

export interface MilestoneItem {
  id: string;
  title: string;
  isCompleted: boolean;
  completedDate?: string;
}

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'UNDER_REVIEW';

export interface GoalItem {
  id: string;
  sphere: LifeSphere;
  title: string;
  description: string;
  scriptureAnchor: string;
  targetDate: string;
  milestones: MilestoneItem[];
  status: GoalStatus;
  mentorFeedback: string;
  mentorApproved: boolean;
  checkInFrequency: string;
  progressPercent: number;
  createdBy: string;
  assignedTo: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  age: number;
  location: string;
  bio: string;
  fullBiography?: string;
  ministryJourney?: string;
  mentorshipPhilosophy?: string;
  availabilitySchedule?: string;
  spiritualGifts: string[];
  primarySpheres: LifeSphere[];
  churchCommunity: string;
  yearsInFaith: number;
  email: string;
  phone: string;
  whatsappNumber: string;
  telegramUsername: string;
  isVerifiedElder: boolean;
  activeMenteesCount: number;
  discipleshipHours: number;
  avatarInitial: string;
  favoriteScripture: string;
  badges: string[];
  assignedMentorId?: string;
  assignedMentorName?: string;
  pairedDate?: string;
  enrolledResourceIds?: string[];
}

export interface MentorshipApplication {
  id: string;
  menteeId: string;
  menteeName: string;
  mentorId: string;
  mentorName: string;
  chosenSphere: LifeSphere;
  personalIntroduction: string;
  growthDesire: string;
  meetingFrequency: string;
  appliedDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'ACTIVE';
}

export type ResourceAccessTier = 'OPEN_PUBLIC' | 'REGISTERED_DISCIPLES' | 'ELDERS_ONLY' | 'ENROLLED_COHORT';

export interface ResourceItem {
  id: string;
  title: string;
  author: string;
  type: ResourceType;
  sphere: LifeSphere;
  description: string;
  readTime: string;
  downloadUrl?: string;
  isBookmarked: boolean;
  rating: number;
  accessTier?: ResourceAccessTier;
  syllabusChapters?: string[];
  fileSize?: string;
  enrolledUsersCount?: number;
  uploadedBy?: string;
  uploadDate?: string;
  keyScriptureAnchors?: string[];
  /** Whether the current user is enrolled (API-backed resources only). */
  isEnrolled?: boolean;
}

export type ResourceType = 'PDF_GUIDE' | 'STUDY_SERIES' | 'SERMON_TRANSCRIPT' | 'BOOK_RECOMMENDATION';

export interface DevotionComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorInitial: string;
  text: string;
  timestamp: string;
  likes: number;
  isUserLiked?: boolean;
}

export interface DailyDevotion {
  id: string;
  title: string;
  date: string;
  theme: string;
  authorName: string;
  authorRole: UserRole;
  authorTitle: string;
  scriptureReference: string;
  scriptureText: string;
  reflectionBody: string;
  prayerPoint: string;
  practicalActionStep: string;
  audioDurationSeconds: number;
  audioVoiceNoteUrl?: string;
  categorySphere: LifeSphere;
  likesCount: number;
  isLikedByUser: boolean;
  comments: DevotionComment[];
  tags: string[];
  readTimeMinutes: number;
}

export type PodcastMediaType = 'AUDIO' | 'VIDEO';

export interface PodcastEpisode {
  id: string;
  title: string;
  series: string;
  speaker: string;
  speakerRole: string;
  mediaType: PodcastMediaType;
  durationString: string;
  durationSeconds: number;
  releaseDate: string;
  sphere: LifeSphere;
  description: string;
  keyScriptures: string[];
  keyTakeaways: string[];
  viewsCount: number;
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  videoEmbedUrl?: string;
  coverImageTheme: string;
}

export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type SessionPlatform = 'GOOGLE_MEET' | 'IN_APP_VIDEO' | 'IN_APP_AUDIO' | 'AUDIO_ROOM' | 'WHATSAPP' | 'ZOOM' | 'IN_PERSON';

export interface DiscipleshipSession {
  id: string;
  menteeId: string;
  menteeName: string;
  mentorId: string;
  mentorName: string;
  scheduledTime: string;
  durationMinutes: number;
  sphereFocus: LifeSphere;
  topic: string;
  scriptureText: string;
  platform: SessionPlatform;
  status: SessionStatus;
  meetingNotes: string;
  actionItems: string[];
  postSessionPrayer: string;
  meetingLink?: string;
}

export type PrayerPrivacyLevel = 'PRIVATE_VAULT' | 'MENTOR_ONLY' | 'COMMUNITY_INTERCESSORS';

export interface PrayerRequest {
  id: string;
  authorName: string;
  authorId: string;
  title: string;
  prayerNeed: string;
  categorySphere: LifeSphere;
  privacyLevel: PrayerPrivacyLevel;
  isAnswered: boolean;
  praiseReport?: string;
  createdAt: string;
  intercessorsCount: number;
  isPrayedByMe: boolean;
  isEncrypted: boolean;
  cipherHint: string;
  tags: string[];
}

export interface SecuritySettings {
  isVaultLocked: boolean;
  pinCode: string;
  biometricsEnabled: boolean;
  encryptionAlgorithm: string;
  lastBackupDate: string;
  twoFactorEnabled: boolean;
}
