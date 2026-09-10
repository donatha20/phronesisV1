import {
  UserProfile,
  GoalItem,
  DailyDevotion,
  PodcastEpisode,
  DiscipleshipSession,
  PrayerRequest,
  ResourceItem,
  SecuritySettings
} from '../types';

export const initialMentors: UserProfile[] = [
  {
    id: 'mentor_1',
    name: 'Elder Thomas Bradley',
    role: 'MENTOR_ELDER',
    title: 'Retired Aerospace Engineer & Elder at Grace Fellowship',
    age: 68,
    location: 'Austin, TX (Remote Available)',
    bio: 'Walking with Jesus for 48 years. Father of 4, grandfather of 9. Passionate about helping young believers navigate career integrity, biblical stewardship, and consistent secret-place prayer rhythms.',
    fullBiography: 'Born in Fort Worth, Texas, Thomas gave his life to Christ in 1978 during his undergraduate studies in engineering. Over a 36-year aerospace career leading defense propulsion projects, he learned firsthand what it means to hold fast to Daniel-like kingdom integrity in high-pressure secular corporate environments. He was ordained as a ruling elder at Grace Fellowship in 1994 and has discipled over 60 young men through university transitions, marriage preparation, career crossroads, and spiritual wilderness seasons.',
    ministryJourney: '30+ years in Elder Shepherding, College Ministry Oversight, Workplace Discipleship Fellowships, and Biblical Stewardship Workshops.',
    mentorshipPhilosophy: 'Discipleship is not merely passing along technical facts, but sharing life in Christ (1 Thess 2:8). I prioritize unhurried listening, rigorous grounding in biblical text, and practical spiritual habit loops.',
    availabilitySchedule: 'Available Tuesday & Thursday evenings (6:00 PM – 9:00 PM CST) and Saturday mornings for video & voice check-ins.',
    spiritualGifts: ['Wisdom & Counsel', 'Teaching', 'Pastoral Shepherding', 'Faith'],
    primarySpheres: ['PERSONAL_GROWTH', 'ACADEMIA_CAREER', 'FINANCES'],
    churchCommunity: 'Grace Fellowship Bible Church',
    yearsInFaith: 48,
    email: 'thomas.bradley@agapelink.org',
    phone: '+1 (512) 555-0143',
    whatsappNumber: '15125550143',
    telegramUsername: 'elder_thomas_b',
    isVerifiedElder: true,
    activeMenteesCount: 3,
    discipleshipHours: 240,
    avatarInitial: 'T',
    favoriteScripture: 'Proverbs 3:5-6 — "Trust in the Lord with all your heart, and do not lean on your own understanding."',
    badges: ['Ordained Elder', '48 Yrs Faith', 'STEM / Career Mentor', 'Top Discipleship Guide']
  },
  {
    id: 'mentor_2',
    name: 'Pastor Deborah Vance',
    role: 'MENTOR_ELDER',
    title: 'Family Ministry Director & Certified Spiritual Director',
    age: 62,
    location: 'Chicago, IL',
    bio: '35 years in marriage & Christian counseling. Passionate about emotional healing, prayer disciplines, and guiding young women through relational wisdom and godly leadership.',
    fullBiography: 'Deborah grew up in the Midwest and experienced God\'s restorative power through grief early in life. She holds an M.A. in Christian Counseling and has spent 35 years walking alongside young women, couples, and college students. She served as Director of Family Life Ministries for 18 years, developing curriculums on peacemaking in family conflict, emotional resilience grounded in the Psalms, and cultivating a quiet heart before God in noisy seasons.',
    ministryJourney: 'Spiritual Direction with Renovaré traditions, Trauma-informed Biblical Care, Premarital Counseling, and Intercessory Prayer Guild.',
    mentorshipPhilosophy: 'Transformation happens where deep honesty meets the relentless tenderness of Christ. I focus on creating a secure, judgment-free spiritual space where blind spots can be gently uncovered and healed.',
    availabilitySchedule: 'Available Mondays & Wednesdays (10:00 AM – 2:00 PM and 7:00 PM – 9:00 PM EST).',
    spiritualGifts: ['Discernment', 'Encouragement', 'Counseling', 'Hospitality'],
    primarySpheres: ['RELATIONSHIPS', 'PERSONAL_GROWTH', 'PHYSICAL_WELLBEING'],
    churchCommunity: 'New Covenant Community Church',
    yearsInFaith: 40,
    email: 'deborah.vance@agapelink.org',
    phone: '+1 (312) 555-0198',
    whatsappNumber: '13125550198',
    telegramUsername: 'deborah_vance_faith',
    isVerifiedElder: true,
    activeMenteesCount: 4,
    discipleshipHours: 310,
    avatarInitial: 'D',
    favoriteScripture: 'Romans 8:28 — "And we know that for those who love God all things work together for good, for those who are called according to his purpose."',
    badges: ['Certified Spiritual Director', 'Marriage & Family Elder', 'Intercessor', '40 Yrs Faith']
  },
  {
    id: 'mentor_3',
    name: 'Dr. Samuel Osei',
    role: 'MENTOR_ELDER',
    title: 'Professor of Economics & Kingdom Philanthropist',
    age: 65,
    location: 'Atlanta, GA',
    bio: 'Advising young believers on stewarding wealth for God\'s glory, avoiding consumerism, and using business as a high calling for the Kingdom of God.',
    fullBiography: 'Originally from Kumasi, Ghana, Dr. Osei completed his doctorate at Oxford before teaching Applied Macroeconomics for over three decades. Having seen the destructive entrapment of materialism in both academia and corporate finance, Samuel has committed his life to raising the next generation of generous, debt-free, kingdom-driven stewards who see their work as worship.',
    ministryJourney: 'Deacon and Stewardship Committee Lead, Global Missions Board Advisor, Micro-Finance for Developing World Church Plants.',
    mentorshipPhilosophy: 'Every dollar, every hour, and every skill is owned by God; we are merely managers. My mentorship is highly tactical: budgeting, ethical negotiations, debt freedom, and high-impact generosity.',
    availabilitySchedule: 'Available Fridays (4:00 PM – 8:00 PM EST) & Sunday afternoons.',
    spiritualGifts: ['Giving', 'Administration', 'Teaching', 'Leadership'],
    primarySpheres: ['FINANCES', 'ACADEMIA_CAREER'],
    churchCommunity: 'Redeemer Presbyterian Church',
    yearsInFaith: 38,
    email: 'samuel.osei@agapelink.org',
    phone: '+1 (404) 555-0177',
    whatsappNumber: '14045550177',
    telegramUsername: 'dr_samuel_osei',
    isVerifiedElder: true,
    activeMenteesCount: 2,
    discipleshipHours: 185,
    avatarInitial: 'S',
    favoriteScripture: 'Matthew 6:33 — "But seek first the kingdom of God and his righteousness, and all these things will be added to you."',
    badges: ['Kingdom Steward', 'Economics Scholar', 'Missions Supporter', '38 Yrs Faith']
  }
];

export const initialMentees: UserProfile[] = [
  {
    id: 'mentee_1',
    name: 'Joshua Miller',
    role: 'YOUNG_BELIEVER_MENTEE',
    title: 'Computer Science Senior & Young Believer',
    age: 22,
    location: 'Seattle, WA',
    bio: 'Came to Christ 2 years ago during college. Seeking deep accountability in daily prayer, wisdom on upcoming job offers, and learning how to honor God with finances and relationships.',
    spiritualGifts: ['Service', 'Evangelism', 'Music'],
    primarySpheres: ['PERSONAL_GROWTH', 'ACADEMIA_CAREER', 'FINANCES'],
    churchCommunity: 'Cornerstone Christian Fellowship',
    yearsInFaith: 2,
    email: 'joshua.m@agapelink.org',
    phone: '+1 (206) 555-0112',
    whatsappNumber: '12065550112',
    telegramUsername: 'joshua_faith_dev',
    isVerifiedElder: false,
    activeMenteesCount: 0,
    discipleshipHours: 42,
    avatarInitial: 'J',
    favoriteScripture: 'Colossians 3:23',
    badges: ['Eager Learner', 'Daily Devotional Streak 24d', 'Word Memorizer']
  },
  {
    id: 'mentee_2',
    name: 'Sarah Chen',
    role: 'YOUNG_BELIEVER_MENTEE',
    title: 'Biomedical Graduate Student',
    age: 24,
    location: 'Boston, MA',
    bio: 'Balancing intense laboratory research with church small group leadership. Learning biblical boundaries and discernment in relationships.',
    spiritualGifts: ['Hospitality', 'Teaching', 'Intercession'],
    primarySpheres: ['ACADEMIA_CAREER', 'RELATIONSHIPS', 'PHYSICAL_WELLBEING'],
    churchCommunity: 'Park Street Church',
    yearsInFaith: 4,
    email: 'sarah.chen@agapelink.org',
    phone: '+1 (617) 555-0821',
    whatsappNumber: '16175550821',
    telegramUsername: 'sarah_c_bio',
    isVerifiedElder: false,
    activeMenteesCount: 0,
    discipleshipHours: 58,
    avatarInitial: 'S',
    favoriteScripture: 'Philippians 4:6-7',
    badges: ['Faith in Science', 'Prayer Leader']
  }
];

export const initialGoals: GoalItem[] = [
  {
    id: 'goal_1',
    sphere: 'PERSONAL_GROWTH',
    title: 'Morning Quiet Time & Romans Scripture Journaling',
    description: 'Spend 30 uninterrupted minutes every morning in prayer and deep inductive study through the Book of Romans with Elder Thomas\'s study guide.',
    scriptureAnchor: 'Psalm 119:105 - "Your word is a lamp for my feet, a light on my path."',
    targetDate: '2026-09-30',
    milestones: [
      { id: 'm1', title: 'Complete Romans Chapters 1-4 with cross-references', isCompleted: true, completedDate: 'Aug 20' },
      { id: 'm2', title: 'Complete Romans Chapters 5-8 (Life in the Spirit)', isCompleted: true, completedDate: 'Aug 27' },
      { id: 'm3', title: 'Complete Romans Chapters 9-11 (God\'s Sovereign Plan)', isCompleted: false },
      { id: 'm4', title: 'Complete Romans 12-16 & write discipleship summary essay', isCompleted: false }
    ],
    status: 'ACTIVE',
    mentorFeedback: 'Joshua, your insights on Romans 6:11 regarding reckoning ourselves dead to sin were mature and encouraging! Keep pressing into Chapter 8.',
    mentorApproved: true,
    checkInFrequency: 'Weekly',
    progressPercent: 50,
    createdBy: 'Joshua Miller',
    assignedTo: 'Elder Thomas Bradley'
  },
  {
    id: 'goal_2',
    sphere: 'FINANCES',
    title: 'Biblical Firstfruits Tithing & Zero-Debt Budget',
    description: 'Build a debt-free transition plan post-graduation, automate 10% firstfruit tithe to local church, and allocate 5% benevolence fund.',
    scriptureAnchor: 'Proverbs 3:9 - "Honor the Lord with your wealth, with the firstfruits of all your crops."',
    targetDate: '2026-10-15',
    milestones: [
      { id: 'f1', title: 'Setup dedicated savings envelope for firstfruits tithe', isCompleted: true, completedDate: 'Aug 15' },
      { id: 'f2', title: 'Create graduation budget with mentor Dr. Samuel\'s spreadsheet', isCompleted: true, completedDate: 'Aug 24' },
      { id: 'f3', title: 'Emergency fund reached: $1,500 target', isCompleted: true, completedDate: 'Aug 28' },
      { id: 'f4', title: 'Finalize salary review & workplace giving pledge', isCompleted: false }
    ],
    status: 'ACTIVE',
    mentorFeedback: 'Excellent discipline on the emergency fund! Remember, stewardship is not hoarding—it is managing God\'s resources for His mission.',
    mentorApproved: true,
    checkInFrequency: 'Bi-Weekly',
    progressPercent: 75,
    createdBy: 'Joshua Miller',
    assignedTo: 'Elder Thomas Bradley'
  },
  {
    id: 'goal_3',
    sphere: 'ACADEMIA_CAREER',
    title: 'Tech Industry Workplace Witness & Integrity Code',
    description: 'Establish clear ethical boundaries regarding proprietary work, maintain honesty in project delivery, and initiate a bi-weekly workplace Christian prayer group.',
    scriptureAnchor: 'Colossians 3:23-24 - "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."',
    targetDate: '2026-11-01',
    milestones: [
      { id: 'c1', title: 'Draft personal Christian ethics code for software engineering', isCompleted: true, completedDate: 'Aug 18' },
      { id: 'c2', title: 'Review offer letters with Elder Thomas for work-life balance', isCompleted: true, completedDate: 'Aug 26' },
      { id: 'c3', title: 'Identify 2 Christian colleagues for lunchtime prayer fellowship', isCompleted: false },
      { id: 'c4', title: 'Host first devotional gathering at local tech hub cafe', isCompleted: false }
    ],
    status: 'ACTIVE',
    mentorFeedback: 'Software engineering needs godly men and women who reflect Christ\'s truth in code, data privacy, and peer relations.',
    mentorApproved: true,
    checkInFrequency: 'Monthly',
    progressPercent: 50,
    createdBy: 'Joshua Miller',
    assignedTo: 'Elder Thomas Bradley'
  },
  {
    id: 'goal_4',
    sphere: 'RELATIONSHIPS',
    title: 'Purity, Honor & Authentic Biblical Brotherhood',
    description: 'Cultivate vulnerable, accountable friendships with two brothers in the faith, practicing James 5:16 confession and encouragement.',
    scriptureAnchor: 'Proverbs 27:17 - "As iron sharpens iron, so one person sharpens another."',
    targetDate: '2026-12-15',
    milestones: [
      { id: 'r1', title: 'Form weekly accountability call with Christian roommate Caleb', isCompleted: true, completedDate: 'Aug 10' },
      { id: 'r2', title: 'Install digital purity filters across all personal devices', isCompleted: true, completedDate: 'Aug 12' },
      { id: 'r3', title: 'Complete Pastor Deborah\'s Biblical Dating & Honor module', isCompleted: false }
    ],
    status: 'ACTIVE',
    mentorFeedback: 'Guarding the heart is a lifelong discipline. Stay vigilant and transparent in prayer.',
    mentorApproved: true,
    checkInFrequency: 'Weekly',
    progressPercent: 66,
    createdBy: 'Joshua Miller',
    assignedTo: 'Pastor Deborah Vance'
  },
  {
    id: 'goal_5',
    sphere: 'PHYSICAL_WELLBEING',
    title: 'Sabbath Rest Rhythm & Temple Stewardship',
    description: 'Honor the physical body as the temple of the Holy Spirit with 7 hours of sleep nightly, 4 physical exercise sessions weekly, and a strict 24-hour weekly digital Sabbath.',
    scriptureAnchor: '1 Corinthians 6:19-20 - "Do you not know that your bodies are temples of the Holy Spirit, who is in you... therefore honor God with your bodies."',
    targetDate: '2026-10-31',
    milestones: [
      { id: 'p1', title: 'Establish sunset Friday to sunset Saturday technology fast', isCompleted: true, completedDate: 'Aug 22' },
      { id: 'p2', title: 'Consistent 4x/week 45-minute cardiovascular workout', isCompleted: true, completedDate: 'Aug 29' },
      { id: 'p3', title: 'Maintain 30 consecutive days of regular 10:30 PM sleep schedule', isCompleted: false }
    ],
    status: 'ACTIVE',
    mentorFeedback: 'Rest is an act of trust in God\'s sovereignty. When we cease striving, we proclaim that He is God.',
    mentorApproved: true,
    checkInFrequency: 'Weekly',
    progressPercent: 66,
    createdBy: 'Joshua Miller',
    assignedTo: 'Pastor Deborah Vance'
  }
];

export const initialDevotions: DailyDevotion[] = [
  {
    id: 'dev_1',
    title: 'Phronesis: The Practical Wisdom of Christ in a Noisy World',
    date: 'Today • Aug 30, 2026',
    theme: 'Spiritual Discernment & Daily Application',
    authorName: 'Elder Thomas Bradley',
    authorRole: 'MENTOR_ELDER',
    authorTitle: 'Elder & Aerospace Consultant',
    scriptureReference: 'Ephesians 1:7-9 & Luke 1:17',
    scriptureText: '"In Him we have redemption through His blood, the forgiveness of sins, in accordance with the riches of God’s grace that He lavished on us with all wisdom and understanding (phronēsis)." — Ephesians 1:7-8',
    reflectionBody: `In biblical Greek, 'Phronesis' is not merely abstract theological knowledge (Sophia) or academic understanding (Gnosis)—it is practical spiritual prudence, the divine ability to discern how eternal truth translates into everyday earthly conduct.

When Paul prays that God would lavish upon us all wisdom and phronēsis, he is asking that every young believer and elder would possess heavenly street-smarts: how to answer an angry supervisor at work with gentle grace, how to manage unexpected financial surplus with generosity, and how to govern our private thought lives when alone.

Cross-generational mentorship is the God-ordained incubator of phronesis. An older brother or sister who has walked through valleys of disappointment, child-rearing, layoffs, and prolonged answered prayer carries experiential wisdom that books alone cannot convey. Today, ask God for phronesis in one specific decision facing your week.`,
    prayerPoint: 'Heavenly Father, impart into my heart the Spirit of Phronesis today. Protect me from foolish haste, and grant me your practical discernment in every conversation, email, and relationship.',
    practicalActionStep: 'Identify one pending decision in your work or personal life. Before committing, ask a mature believer or your mentor for their biblical perspective.',
    audioDurationSeconds: 245,
    audioVoiceNoteUrl: 'https://actions.google.com/sounds/v1/ambiences/gentle_stream.ogg',
    categorySphere: 'PERSONAL_GROWTH',
    likesCount: 84,
    isLikedByUser: true,
    readTimeMinutes: 4,
    tags: ['Wisdom', 'Phronesis', 'Ephesians', 'Discernment', 'Mentorship'],
    comments: [
      {
        id: 'c1',
        authorName: 'Joshua Miller',
        authorRole: 'YOUNG_BELIEVER_MENTEE',
        authorInitial: 'J',
        text: 'This was exactly what I needed this morning. Elder Thomas, your note about Phronesis being "heavenly street-smarts" in the workplace really clarified how I should handle my project review tomorrow.',
        timestamp: '2 hours ago',
        likes: 12,
        isUserLiked: true
      },
      {
        id: 'c2',
        authorName: 'Sarah Chen',
        authorRole: 'YOUNG_BELIEVER_MENTEE',
        authorInitial: 'S',
        text: 'Amen! The cross-generational connection is so rare today. Grateful for our elders investing their lives in us.',
        timestamp: '1 hour ago',
        likes: 7
      }
    ]
  },
  {
    id: 'dev_2',
    title: 'The Secret Place: Cultivating Unhurried Communion with the Father',
    date: 'Yesterday • Aug 29, 2026',
    theme: 'Prayer Disciplines & Secret Place',
    authorName: 'Pastor Deborah Vance',
    authorRole: 'MENTOR_ELDER',
    authorTitle: 'Family Ministry & Spiritual Director',
    scriptureReference: 'Matthew 6:6 & Psalm 91:1',
    scriptureText: '"But when you pray, go into your room, close the door and pray to your Father, who is unseen. Then your Father, who sees what is done in secret, will reward you." — Matthew 6:6',
    reflectionBody: `Our modern culture rewards visibility, metrics, and instant public affirmation. Yet Jesus teaches that the foundation of all spiritual fruitfulness is established in secret, unrecorded spaces.

Before Jesus chose His twelve disciples, He spent the entire night on the mountain in prayer. Before His crucifixion, He poured out His soul in Gethsemane. The spiritual power to withstand worldly compromise is forged when no one is watching except the Father.

If your devotional life has felt like a hurried checklist before rushing into the morning commute, take heart. God is not evaluating your performance; He is inviting you into intimacy. Set aside your phone 15 minutes before opening the Word. Sit in quiet awe of His holiness.`,
    prayerPoint: 'Lord Jesus, draw me into the secret place of Your presence. Strip away my addiction to hurry and human applause, and teach my soul to find rest in You alone.',
    practicalActionStep: 'Create a "phone-free sanctuary zone" in your home where you pray and read scripture without notifications.',
    audioDurationSeconds: 310,
    audioVoiceNoteUrl: 'https://actions.google.com/sounds/v1/ambiences/gentle_wind_through_trees.ogg',
    categorySphere: 'PERSONAL_GROWTH',
    likesCount: 112,
    isLikedByUser: false,
    readTimeMinutes: 5,
    tags: ['Prayer', 'QuietTime', 'SecretPlace', 'Intimacy', 'Discipline'],
    comments: [
      {
        id: 'c3',
        authorName: 'Dr. Samuel Osei',
        authorRole: 'MENTOR_ELDER',
        authorInitial: 'S',
        text: 'Well said Deborah. When our inner life is rich in Christ, external pressures cannot crush us.',
        timestamp: '1 day ago',
        likes: 15
      }
    ]
  },
  {
    id: 'dev_3',
    title: 'Stewardship Over Ownership: Managing Kingdom Capital',
    date: 'Aug 28, 2026',
    theme: 'Biblical Finances & Generosity',
    authorName: 'Dr. Samuel Osei',
    authorRole: 'MENTOR_ELDER',
    authorTitle: 'Professor of Economics & Philanthropist',
    scriptureReference: 'Psalm 24:1 & 1 Timothy 6:17-19',
    scriptureText: '"The earth is the Lord’s, and everything in it, the world, and all who live in it." — Psalm 24:1',
    reflectionBody: `The core mindset shift of Christian financial freedom is acknowledging that we own nothing; we manage everything as stewards of the King of Kings.

When we view our paycheck as "mine," giving feels like a painful loss. But when we realize that every breath, intellect, skill, and dollar originates from God\'s sovereign providence, giving becomes our highest joy. It is investing earthly seed into an eternal Kingdom that can never be devalued or stolen.`,
    prayerPoint: 'Father, forgive me for hoarding and anxiety. You are Jehovah Jireh, my provider. Give me open hands and a generous heart to meet the needs of the saints and the poor.',
    practicalActionStep: 'Review your monthly spending and designate an extra giving amount this week to support a missionary or local family in need.',
    audioDurationSeconds: 280,
    audioVoiceNoteUrl: 'https://actions.google.com/sounds/v1/ambiences/gentle_stream.ogg',
    categorySphere: 'FINANCES',
    likesCount: 96,
    isLikedByUser: true,
    readTimeMinutes: 4,
    tags: ['Finances', 'Stewardship', 'Tithing', 'Generosity', 'KingdomEconomy'],
    comments: []
  }
];

export const initialPodcasts: PodcastEpisode[] = [
  {
    id: 'pod_1',
    title: 'Ep. 42: How Elders & Young Believers Bridge the Cultural Divide',
    series: 'Phronesis Mentorship Masterclass',
    speaker: 'Elder Thomas Bradley & Joshua Miller',
    speakerRole: 'Cross-Generational Dialogue',
    mediaType: 'AUDIO',
    durationString: '38:45',
    durationSeconds: 2325,
    releaseDate: 'Aug 26, 2026',
    sphere: 'RELATIONSHIPS',
    description: 'A transparent conversation between a 68-year-old retired aerospace engineer and a 22-year-old computer science senior exploring what genuine discipleship looks like in an era of social media isolation and spiritual cynicism.',
    keyScriptures: ['Titus 2:1-8', '1 Timothy 4:12', '1 Peter 5:5'],
    keyTakeaways: [
      'Older believers must offer vulnerability, not just dogmatic lecture',
      'Young believers need safe spaces to ask difficult cultural and theological questions',
      'Consistent weekly touchpoints build long-term generational endurance'
    ],
    viewsCount: 1420,
    likesCount: 230,
    isLiked: true,
    isSaved: true,
    coverImageTheme: 'from-amber-700 to-stone-900'
  },
  {
    id: 'pod_2',
    title: 'Ep. 41: Navigating Tech Careers Without Losing Your Soul',
    series: 'Kingdom in the Marketplace',
    speaker: 'Dr. Samuel Osei & Elder Thomas Bradley',
    speakerRole: 'Marketplace Elders Panel',
    mediaType: 'VIDEO',
    durationString: '45:10',
    durationSeconds: 2710,
    releaseDate: 'Aug 19, 2026',
    sphere: 'ACADEMIA_CAREER',
    description: 'How Christian software engineers, researchers, and corporate professionals can maintain unbending biblical integrity, handle lucrative equity incentives with stewardship, and shine as salt and light in secular boardrooms.',
    keyScriptures: ['Daniel 1:8', 'Colossians 3:22-25', 'Proverbs 11:1'],
    keyTakeaways: [
      'Daniel resolved in his heart before the pressure arrived',
      'Excellence in your craft gives you a hearing for the Gospel',
      'Guard against identity being tied to stock options or promotion titles'
    ],
    viewsCount: 2890,
    likesCount: 410,
    isLiked: true,
    isSaved: false,
    videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    coverImageTheme: 'from-blue-900 to-indigo-950'
  },
  {
    id: 'pod_3',
    title: 'Ep. 40: Emotional Healing, Forgiveness & Healthy Boundaries',
    series: 'Heart & Soul Discipleship',
    speaker: 'Pastor Deborah Vance',
    speakerRole: 'Spiritual Director & Counselor',
    mediaType: 'AUDIO',
    durationString: '32:15',
    durationSeconds: 1935,
    releaseDate: 'Aug 12, 2026',
    sphere: 'PERSONAL_GROWTH',
    description: 'Pastor Deborah breaks down the biblical theology of forgiveness versus reconciliation, how to release bitter resentment from childhood wounds, and setting boundaries that honor God.',
    keyScriptures: ['Ephesians 4:31-32', 'Genesis 50:20', 'Proverbs 4:23'],
    keyTakeaways: [
      'Forgiveness is a command; trust is rebuilt through proven fruits',
      'Bitterness poisons the vessel that carries it',
      'The Holy Spirit is our gentle Counselor who restores broken souls'
    ],
    viewsCount: 1950,
    likesCount: 350,
    isLiked: false,
    isSaved: true,
    coverImageTheme: 'from-emerald-800 to-stone-900'
  }
];

export const initialSessions: DiscipleshipSession[] = [
  {
    id: 'sess_1',
    menteeId: 'mentee_1',
    menteeName: 'Joshua Miller',
    mentorId: 'mentor_1',
    mentorName: 'Elder Thomas Bradley',
    scheduledTime: 'Tomorrow, 7:00 PM EST',
    durationMinutes: 45,
    sphereFocus: 'PERSONAL_GROWTH',
    topic: 'Romans 8 & Overcoming Workplace Performance Anxiety',
    scriptureText: 'Romans 8:1 - "There is therefore now no condemnation for those who are in Christ Jesus."',
    platform: 'IN_APP_VIDEO',
    status: 'SCHEDULED',
    meetingNotes: 'Review Joshua\'s journal entries on Romans 7-8. Discuss how justification by faith liberates us from people-pleasing and fear of failure in upcoming software deployments.',
    actionItems: [
      'Joshua to memorize Romans 8:31-32',
      'Elder Thomas to share his 1985 aerospace crisis reflection notes',
      'Pray specifically for the Amazon job interview scheduled next Thursday'
    ],
    postSessionPrayer: 'Father, seal our brother Joshua in the assurance of Your adoption. Let him know that his worth is rooted in Christ\'s finished work, not in corporate approval.'
  },
  {
    id: 'sess_2',
    menteeId: 'mentee_1',
    menteeName: 'Joshua Miller',
    mentorId: 'mentor_3',
    mentorName: 'Dr. Samuel Osei',
    scheduledTime: 'Friday, Sep 4 • 6:30 PM EST',
    durationMinutes: 60,
    sphereFocus: 'FINANCES',
    topic: 'First Salary Budget & Tithing Envelope Setup',
    scriptureText: 'Malachi 3:10 & 2 Corinthians 9:7',
    platform: 'IN_APP_VIDEO',
    status: 'SCHEDULED',
    meetingNotes: 'Review starting salary package, healthcare options, 401k matching vs local church tithing strategy.',
    actionItems: [
      'Complete budget spreadsheet with actual fixed expenses',
      'Select local gospel-preaching ministry for benevolence fund'
    ],
    postSessionPrayer: 'Lord, bless the work of his hands and give him wisdom to steward every penny for eternal dividends.'
  },
  {
    id: 'sess_3',
    menteeId: 'mentee_1',
    menteeName: 'Joshua Miller',
    mentorId: 'mentor_1',
    mentorName: 'Elder Thomas Bradley',
    scheduledTime: 'Aug 23, 2026 • 7:00 PM EST',
    durationMinutes: 50,
    sphereFocus: 'ACADEMIA_CAREER',
    topic: 'Biblical Decision Making in Career Paths',
    scriptureText: 'Proverbs 16:3 - "Commit to the Lord whatever you do, and he will establish your plans."',
    platform: 'IN_APP_VIDEO',
    status: 'COMPLETED',
    meetingNotes: 'Discussed the 3 competing job offers. Evaluated corporate culture, proximity to church community, and opportunities for Christian fellowship.',
    actionItems: [
      'Seek God in 3-day prayer fast regarding Seattle vs Austin relocation',
      'Call church pastor for reference on local church plants in Seattle'
    ],
    postSessionPrayer: 'Lord, guide Joshua\'s steps into the precise geographic location where he will bear the most fruit for Your Kingdom.'
  }
];

export const initialPrayers: PrayerRequest[] = [
  {
    id: 'pray_1',
    authorName: 'Joshua Miller',
    authorId: 'mentee_1',
    title: 'Wisdom & Peace for Upcoming Senior Tech Interviews',
    prayerNeed: 'Pray for clarity of mind, integrity during coding tests, and trusting God with the outcome without succumbing to anxiety.',
    categorySphere: 'ACADEMIA_CAREER',
    privacyLevel: 'MENTOR_ONLY',
    isAnswered: false,
    createdAt: 'Aug 28, 2026',
    intercessorsCount: 4,
    isPrayedByMe: true,
    isEncrypted: true,
    cipherHint: 'AES-256 GCM • Authorized Mentors & Joshua',
    tags: ['Career', 'Interviews', 'Trust', 'Peace']
  },
  {
    id: 'pray_2',
    authorName: 'Joshua Miller',
    authorId: 'mentee_1',
    title: 'Salvation of My Father (David Miller)',
    prayerNeed: 'My dad has been skeptical of the Gospel for decades. Pray that the Holy Spirit softens his heart during our Labor Day family dinner and opens doors for a gentle gospel conversation.',
    categorySphere: 'RELATIONSHIPS',
    privacyLevel: 'PRIVATE_VAULT',
    isAnswered: false,
    createdAt: 'Aug 15, 2026',
    intercessorsCount: 2,
    isPrayedByMe: true,
    isEncrypted: true,
    cipherHint: 'Encrypted in Joshua\'s Biometric Vault',
    tags: ['Evangelism', 'Family', 'Salvation', 'LaborDay']
  },
  {
    id: 'pray_3',
    authorName: 'Joshua Miller',
    authorId: 'mentee_1',
    title: 'PRAISE REPORT: Full Healing of Knee Ligament without Surgery',
    prayerNeed: 'Doctor confirmed the meniscus tear has healed completely! Back to serving in youth ministry setup on Sundays.',
    categorySphere: 'PHYSICAL_WELLBEING',
    privacyLevel: 'COMMUNITY_INTERCESSORS',
    isAnswered: true,
    praiseReport: 'The Lord answered our united prayer! The MRI came back completely clear. Thank you Elder Thomas and Church Intercessors!',
    createdAt: 'Aug 02, 2026',
    intercessorsCount: 28,
    isPrayedByMe: true,
    isEncrypted: false,
    cipherHint: 'Public Praise Report',
    tags: ['Praise', 'Healing', 'AnsweredPrayer', 'YouthMinistry']
  }
];

export const initialResources: ResourceItem[] = [
  {
    id: 'res_1',
    title: 'The Discipline of Grace Discipleship Syllabus',
    author: 'Elder Thomas Bradley',
    type: 'PDF_GUIDE',
    sphere: 'PERSONAL_GROWTH',
    description: 'An 8-week comprehensive discipleship workbook exploring God\'s provision and our pursuit of holiness, with practical secret-place journal worksheets and weekly memory verses.',
    readTime: '45 pages (PDF)',
    isBookmarked: true,
    rating: 4.9,
    accessTier: 'OPEN_PUBLIC',
    fileSize: '3.8 MB',
    enrolledUsersCount: 142,
    uploadedBy: 'Elder Thomas Bradley (Curriculum Lead)',
    uploadDate: 'Aug 20, 2026',
    keyScriptureAnchors: ['Titus 2:11-14', 'Romans 6:1-14', 'Galatians 2:20'],
    syllabusChapters: [
      'Week 1: Understanding Grace vs. Self-Effort (Ephesians 2:8-10)',
      'Week 2: The Gospel for Everyday Believers',
      'Week 3: Mortifying Sin through the Power of the Holy Spirit',
      'Week 4: The Role of the Word & Meditation in Heart Transformation',
      'Week 5: Prayer as Intimacy, Not Performance',
      'Week 6: Walking in Holiness in the Workplace',
      'Week 7: Overcoming Spiritual Wilderness & Dry Seasons',
      'Week 8: Multiplying Grace: Discipling the Next Generation'
    ]
  },
  {
    id: 'res_2',
    title: 'Biblical Wealth & Kingdom Economics Handbook',
    author: 'Dr. Samuel Osei',
    type: 'STUDY_SERIES',
    sphere: 'FINANCES',
    description: 'Practical financial modeling templates, debt elimination masterclass, and biblical guidelines for budgeting, saving, and investing for gospel advancement.',
    readTime: '6-Part Interactive Series',
    isBookmarked: true,
    rating: 4.8,
    accessTier: 'REGISTERED_DISCIPLES',
    fileSize: '12.4 MB',
    enrolledUsersCount: 89,
    uploadedBy: 'Dr. Samuel Osei',
    uploadDate: 'Aug 14, 2026',
    keyScriptureAnchors: ['Matthew 6:19-34', '1 Timothy 6:6-19', 'Proverbs 13:22'],
    syllabusChapters: [
      'Module 1: The Principle of Radical Ownership (Psalm 24:1)',
      'Module 2: Snowball Debt Elimination & Kingdom Budgeting',
      'Module 3: Generosity Horizons: Firstfruits & Sacrificial Giving',
      'Module 4: Ethical Career Negotiations & Work as Worship',
      'Module 5: Kingdom Investing & Long-term Family Legacy',
      'Module 6: Avoiding Consumerist Traps in Tech & Modern Markets'
    ]
  },
  {
    id: 'res_3',
    title: 'Guarding the Tongue & Relational Integrity in Conflict',
    author: 'Pastor Deborah Vance',
    type: 'SERMON_TRANSCRIPT',
    sphere: 'RELATIONSHIPS',
    description: 'A deep biblical study on James 3, Matthew 18, and practical conversational scripts for resolving interpersonal offense with humility, grace, and restorative love.',
    readTime: '18 min read',
    isBookmarked: false,
    rating: 5.0,
    accessTier: 'OPEN_PUBLIC',
    fileSize: '1.2 MB',
    enrolledUsersCount: 215,
    uploadedBy: 'Pastor Deborah Vance',
    uploadDate: 'Aug 05, 2026',
    keyScriptureAnchors: ['James 3:1-18', 'Matthew 18:15-17', 'Ephesians 4:29-32'],
    syllabusChapters: [
      'Chapter 1: The Power of Life and Death in Words (Proverbs 18:21)',
      'Chapter 2: Identifying the Root Idols Behind Anger and Slander',
      'Chapter 3: The 4 Rules of Biblical Communication',
      'Chapter 4: Forgiveness as a Covenant Decision, Not an Emotion'
    ]
  },
  {
    id: 'res_4',
    title: 'Church Elder Shepherding & Mentorship Manual',
    author: 'Phronesis Leadership Council',
    type: 'PDF_GUIDE',
    sphere: 'PERSONAL_GROWTH',
    description: 'Confidential elder manual on discipleship ethics, mandatory reporting boundaries, pastoral counseling best practices, and tracking spiritual milestones.',
    readTime: '60 pages (PDF)',
    isBookmarked: false,
    rating: 4.9,
    accessTier: 'ELDERS_ONLY',
    fileSize: '5.6 MB',
    enrolledUsersCount: 24,
    uploadedBy: 'Curriculum Director (Admin)',
    uploadDate: 'Aug 01, 2026',
    keyScriptureAnchors: ['1 Peter 5:1-4', '1 Timothy 3:1-7', 'Titus 1:5-9'],
    syllabusChapters: [
      'Section 1: The Heart & Spiritual Qualification of a Christian Mentor',
      'Section 2: Shepherding Young Believers Through Modern Cultural Challenges',
      'Section 3: Confidentiality, Accountability & Safe Church Standards',
      'Section 4: Structuring 1-on-1 Sessions for Maximum Spiritual Breakthrough'
    ]
  }
];

export const initialSecurity: SecuritySettings = {
  isVaultLocked: true,
  pinCode: '1234',
  biometricsEnabled: true,
  encryptionAlgorithm: 'AES-256-GCM + Argon2id Key Derivation',
  lastBackupDate: 'Aug 29, 2026 at 11:45 PM',
  twoFactorEnabled: true
};
