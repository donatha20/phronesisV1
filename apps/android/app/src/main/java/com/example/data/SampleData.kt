package com.example.data

import com.example.model.*

object SampleData {

    val mentorThomas = UserProfile(
        id = "mentor_1",
        name = "Elder Thomas Bradley",
        role = UserRole.MENTOR_ELDER,
        title = "Retired Aerospace Engineer & Elder at Grace Fellowship",
        age = 68,
        location = "Austin, TX (Remote Available)",
        bio = "Walking with Jesus for 48 years. Father of 4, grandfather of 9. Passionate about helping young believers navigate career integrity, biblical stewardship, and consistent secret-place prayer rhythms.",
        spiritualGifts = listOf("Wisdom & Counsel", "Teaching", "Pastoral Shepherding", "Faith"),
        primarySpheres = listOf(LifeSphere.PERSONAL_GROWTH, LifeSphere.ACADEMIA_CAREER, LifeSphere.FINANCES),
        churchCommunity = "Grace Fellowship Bible Church",
        yearsInFaith = 48,
        email = "thomas.bradley@agapelink.org",
        phone = "+1 (512) 555-0143",
        whatsappNumber = "15125550143",
        telegramUsername = "elder_thomas_b",
        isVerifiedElder = true,
        activeMenteesCount = 3,
        discipleshipHours = 240,
        avatarInitial = "T",
        favoriteScripture = "Proverbs 3:5-6",
        badges = listOf("Ordained Elder", "40+ Yrs Faith", "Top Discipleship Mentor")
    )

    val mentorDeborah = UserProfile(
        id = "mentor_2",
        name = "Pastor Deborah Vance",
        role = UserRole.MENTOR_ELDER,
        title = "Family Ministry Director & Spiritual Director",
        age = 62,
        location = "Chicago, IL",
        bio = "35 years in marriage & Christian counseling. Passionate about emotional healing, prayer disciplines, and guiding young women through relational wisdom and godly leadership.",
        spiritualGifts = listOf("Discernment", "Encouragement", "Counseling", "Hospitality"),
        primarySpheres = listOf(LifeSphere.RELATIONSHIPS, LifeSphere.PERSONAL_GROWTH, LifeSphere.PHYSICAL_WELLBEING),
        churchCommunity = "New Covenant Community Church",
        yearsInFaith = 40,
        email = "deborah.vance@agapelink.org",
        phone = "+1 (312) 555-0198",
        whatsappNumber = "13125550198",
        telegramUsername = "deborah_vance_faith",
        isVerifiedElder = true,
        activeMenteesCount = 4,
        discipleshipHours = 310,
        avatarInitial = "D",
        favoriteScripture = "Romans 8:28",
        badges = listOf("Certified Spiritual Director", "Marriage Mentor", "Prayer Intercessor")
    )

    val mentorSamuel = UserProfile(
        id = "mentor_3",
        name = "Dr. Samuel Osei",
        role = UserRole.MENTOR_ELDER,
        title = "Professor of Economics & Kingdom Philanthropist",
        age = 65,
        location = "Atlanta, GA",
        bio = "Advising young believers on stewarding wealth for God's glory, avoiding consumerism, and using business as a high calling for the Kingdom of God.",
        spiritualGifts = listOf("Giving", "Administration", "Teaching", "Leadership"),
        primarySpheres = listOf(LifeSphere.FINANCES, LifeSphere.ACADEMIA_CAREER),
        churchCommunity = "Redeemer Presbyterian",
        yearsInFaith = 38,
        email = "samuel.osei@agapelink.org",
        phone = "+1 (404) 555-0177",
        whatsappNumber = "14045550177",
        telegramUsername = "dr_samuel_osei",
        isVerifiedElder = true,
        activeMenteesCount = 2,
        discipleshipHours = 185,
        avatarInitial = "S",
        favoriteScripture = "Matthew 6:33",
        badges = listOf("Kingdom Steward", "Economics Scholar", "Youth Disciple Leader")
    )

    val menteeJoshua = UserProfile(
        id = "mentee_1",
        name = "Joshua Miller",
        role = UserRole.YOUNG_BELIEVER_MENTEE,
        title = "Computer Science Senior & Young Believer",
        age = 22,
        location = "Seattle, WA",
        bio = "Came to Christ 2 years ago during college. Seeking deep accountability in daily prayer, wisdom on upcoming job offers, and learning how to honor God with finances and relationships.",
        spiritualGifts = listOf("Service", "Evangelism", "Music"),
        primarySpheres = listOf(LifeSphere.PERSONAL_GROWTH, LifeSphere.ACADEMIA_CAREER, LifeSphere.FINANCES),
        churchCommunity = "Cornerstone Christian Fellowship",
        yearsInFaith = 2,
        email = "joshua.m@agapelink.org",
        phone = "+1 (206) 555-0112",
        whatsappNumber = "12065550112",
        telegramUsername = "joshua_faith_dev",
        isVerifiedElder = false,
        activeMenteesCount = 0,
        discipleshipHours = 42,
        avatarInitial = "J",
        favoriteScripture = "Colossians 3:23",
        badges = listOf("Eager Learner", "Daily Devotional Streak 24d", "Word Memorizer")
    )

    val allMentors = listOf(mentorThomas, mentorDeborah, mentorSamuel)

    val sampleGoals = listOf(
        GoalItem(
            id = "goal_1",
            sphere = LifeSphere.PERSONAL_GROWTH,
            title = "Morning Quiet Time & Romans Scripture Journaling",
            description = "Spend 30 uninterrupted minutes every morning in prayer and deep inductive study through the Book of Romans with Elder Thomas's study guide.",
            scriptureAnchor = "Psalm 119:105 - 'Your word is a lamp for my feet, a light on my path.'",
            targetDate = "Sep 30, 2026",
            milestones = listOf(
                MilestoneItem("m1", "Complete Romans Chapters 1-4 with cross-references", isCompleted = true, completedDate = "Aug 20"),
                MilestoneItem("m2", "Complete Romans Chapters 5-8 (Life in the Spirit)", isCompleted = true, completedDate = "Aug 27"),
                MilestoneItem("m3", "Complete Romans Chapters 9-11 (God's Sovereign Plan)", isCompleted = false),
                MilestoneItem("m4", "Complete Romans 12-16 & write discipleship summary essay", isCompleted = false)
            ),
            status = GoalStatus.ACTIVE,
            mentorFeedback = "Joshua, your insights on Romans 6:11 regarding reckoning ourselves dead to sin were mature and encouraging! Keep pressing into Chapter 8.",
            mentorApproved = true,
            checkInFrequency = "Weekly",
            progressPercent = 50,
            createdBy = "Joshua Miller",
            assignedTo = "Elder Thomas Bradley"
        ),
        GoalItem(
            id = "goal_2",
            sphere = LifeSphere.FINANCES,
            title = "Biblical Firstfruits Tithing & Zero-Debt Budget",
            description = "Build a debt-free transition plan post-graduation, automate 10% firstfruit tithe to local church, and allocate 5% benevolence fund.",
            scriptureAnchor = "Proverbs 3:9 - 'Honor the Lord with your wealth, with the firstfruits of all your crops.'",
            targetDate = "Oct 15, 2026",
            milestones = listOf(
                MilestoneItem("f1", "Setup dedicated savings envelope for firstfruits tithe", isCompleted = true, completedDate = "Aug 15"),
                MilestoneItem("f2", "Create graduation budget with mentor Dr. Samuel's spreadsheet", isCompleted = true, completedDate = "Aug 24"),
                MilestoneItem("f3", "Emergency fund reached: $1,500 target", isCompleted = true, completedDate = "Aug 28"),
                MilestoneItem("f4", "Finalize salary review & workplace giving pledge", isCompleted = false)
            ),
            status = GoalStatus.ACTIVE,
            mentorFeedback = "Excellent discipline on the emergency fund! Remember, stewardship is not hoarding—it is managing God's resources for His mission.",
            mentorApproved = true,
            checkInFrequency = "Bi-Weekly",
            progressPercent = 75,
            createdBy = "Joshua Miller",
            assignedTo = "Elder Thomas Bradley"
        ),
        GoalItem(
            id = "goal_3",
            sphere = LifeSphere.ACADEMIA_CAREER,
            title = "Vocational Calling & Workplace Ministry Ethics",
            description = "Discern between two engineering job offers based on kingdom impact, work-life balance for church service, and ethical alignment.",
            scriptureAnchor = "Colossians 3:23-24 - 'Whatever you do, work at it with all your heart, as working for the Lord...'",
            targetDate = "Sep 18, 2026",
            milestones = listOf(
                MilestoneItem("c1", "Evaluate offer compensation and work culture through biblical lens", isCompleted = true, completedDate = "Aug 22"),
                MilestoneItem("c2", "Discuss ministry opportunities with Elder Thomas", isCompleted = true, completedDate = "Aug 26"),
                MilestoneItem("c3", "Fast and pray for 24 hours prior to decision", isCompleted = false),
                MilestoneItem("c4", "Accept offer and craft Personal Workplace Ministry Charter", isCompleted = false)
            ),
            status = GoalStatus.ACTIVE,
            mentorFeedback = "Proud of how you prioritized community involvement over a slightly higher paycheck. We will pray over this on Tuesday's call.",
            mentorApproved = true,
            checkInFrequency = "Weekly",
            progressPercent = 50,
            createdBy = "Joshua Miller",
            assignedTo = "Elder Thomas Bradley"
        ),
        GoalItem(
            id = "goal_4",
            sphere = LifeSphere.RELATIONSHIPS,
            title = "Reconciliation & Family Honor",
            description = "Initiate monthly phone calls with parents with intentional listening, forgiveness, and sharing what God is doing in college.",
            scriptureAnchor = "Ephesians 6:2 - 'Honor your father and mother—which is the first commandment with a promise.'",
            targetDate = "Nov 01, 2026",
            milestones = listOf(
                MilestoneItem("r1", "Write a handwritten gratitude letter to father", isCompleted = true, completedDate = "Aug 10"),
                MilestoneItem("r2", "First Sunday long-distance video call without bringing up old conflicts", isCompleted = true, completedDate = "Aug 18"),
                MilestoneItem("r3", "Invite family to church graduation service", isCompleted = false)
            ),
            status = GoalStatus.ACTIVE,
            mentorFeedback = "A soft answer turns away wrath (Prov 15:1). God is doing a mighty work in your heart.",
            mentorApproved = true,
            checkInFrequency = "Monthly",
            progressPercent = 66,
            createdBy = "Joshua Miller",
            assignedTo = "Elder Thomas Bradley"
        ),
        GoalItem(
            id = "goal_5",
            sphere = LifeSphere.PHYSICAL_WELLBEING,
            title = "Sabbath Rest & Body as Temple Discipline",
            description = "Protect a full 24-hour weekly digital Sabbath (screens off Saturday evening to Sunday evening), sleep 7.5 hours, and exercise 3x weekly.",
            scriptureAnchor = "1 Corinthians 6:19 - 'Do you not know that your bodies are temples of the Holy Spirit...'",
            targetDate = "Oct 31, 2026",
            milestones = listOf(
                MilestoneItem("p1", "Block Sunday morning to evening on Google Calendar as sacred rest", isCompleted = true, completedDate = "Aug 12"),
                MilestoneItem("p2", "3x weekly gym workouts before morning devotionals", isCompleted = true, completedDate = "Aug 25"),
                MilestoneItem("p3", "Complete 4 consecutive Sabbath rest cycles", isCompleted = false)
            ),
            status = GoalStatus.ACTIVE,
            mentorFeedback = "Sabbath is a declaration that God is in control, not our busyness. Keep guarding this sacred rhythm.",
            mentorApproved = true,
            checkInFrequency = "Weekly",
            progressPercent = 66,
            createdBy = "Joshua Miller",
            assignedTo = "Elder Thomas Bradley"
        )
    )

    val sampleSessions = listOf(
        DiscipleshipSession(
            id = "session_1",
            title = "Weekly Spiritual Mentorship & Job Decision Prayer",
            mentorId = mentorThomas.id,
            mentorName = mentorThomas.name,
            menteeId = menteeJoshua.id,
            menteeName = menteeJoshua.name,
            scheduledDateTime = "Tomorrow, 7:00 PM EST",
            durationMinutes = 45,
            sphereFocus = LifeSphere.ACADEMIA_CAREER,
            scriptureFocus = "James 1:5 - 'If any of you lacks wisdom, you should ask God, who gives generously to all...'",
            agenda = listOf(
                "Opening Prayer & Praise reports for the week",
                "Review Romans 7 & 8 devotion notes",
                "Deep dive into software engineering career offer decision",
                "Set 2-week financial budget milestones",
                "Closing intercessory prayer for family reconciliation"
            ),
            platform = SessionPlatform.IN_APP_VIDEO,
            status = SessionStatus.UPCOMING,
            sessionNotes = "Prep material: Joshua has uploaded offer comparison matrix and questions on workplace ethics.",
            actionItems = listOf(
                "Read James 1 & 2 prior to call",
                "Prepare financial budget summary"
            ),
            remindersEnabled = true,
            reminderMinutesBefore = 30
        ),
        DiscipleshipSession(
            id = "session_2",
            title = "Biblical Finances & Firstfruits Workshop",
            mentorId = mentorThomas.id,
            mentorName = mentorThomas.name,
            menteeId = menteeJoshua.id,
            menteeName = menteeJoshua.name,
            scheduledDateTime = "Sep 05, 2026 - 6:30 PM EST",
            durationMinutes = 60,
            sphereFocus = LifeSphere.FINANCES,
            scriptureFocus = "Luke 16:10-11 - 'Whoever can be trusted with very little can also be trusted with much...'",
            agenda = listOf(
                "Scripture meditation on Luke 16",
                "Review of emergency fund & zero-debt strategy",
                "How to budget for hospitality and missionary support"
            ),
            platform = SessionPlatform.WHATSAPP,
            status = SessionStatus.UPCOMING,
            sessionNotes = "",
            actionItems = emptyList(),
            remindersEnabled = true,
            reminderMinutesBefore = 60
        ),
        DiscipleshipSession(
            id = "session_3",
            title = "Past Session: Foundations of Secret-Place Prayer",
            mentorId = mentorThomas.id,
            mentorName = mentorThomas.name,
            menteeId = menteeJoshua.id,
            menteeName = menteeJoshua.name,
            scheduledDateTime = "Aug 22, 2026 - 7:00 PM EST",
            durationMinutes = 50,
            sphereFocus = LifeSphere.PERSONAL_GROWTH,
            scriptureFocus = "Matthew 6:6 - 'When you pray, go into your room, close the door and pray to your Father...'",
            agenda = listOf(
                "Prayer rhythms: ACTS model (Adoration, Confession, Thanksgiving, Supplication)",
                "Overcoming spiritual distraction and phone habits"
            ),
            platform = SessionPlatform.IN_APP_VIDEO,
            status = SessionStatus.COMPLETED,
            sessionNotes = "Joshua shared breakthroughs in waking up 30 minutes earlier. Recommended Richard Foster's Celebration of Discipline.",
            actionItems = listOf(
                "Establish a dedicated prayer chair with phone outside bedroom",
                "Memorize Psalm 63:1-3"
            )
        )
    )

    val samplePrayers = listOf(
        PrayerRequest(
            id = "prayer_1",
            title = "Clarity & Peace on Post-Graduation Career Offer",
            description = "Asking the Lord for wisdom between Company A (local ministry focus) and Company B (higher tech visibility). Praying for humility and obedience to God's calling above prestige.",
            sphere = LifeSphere.ACADEMIA_CAREER,
            authorId = menteeJoshua.id,
            authorName = "Joshua Miller",
            authorRole = UserRole.YOUNG_BELIEVER_MENTEE,
            dateCreated = "Aug 27, 2026",
            privacyLevel = PrayerPrivacyLevel.CONFIDENTIAL_MENTOR_PAIR_ONLY,
            isAnswered = false,
            praiseReport = null,
            prayerCount = 14,
            scripturePromise = "Proverbs 16:3 - 'Commit to the Lord whatever you do, and he will establish your plans.'"
        ),
        PrayerRequest(
            id = "prayer_2",
            title = "Dad's Openness to the Gospel & Healed Conversation",
            description = "Prayed for 2 years for open doors with my father. Had our first peaceful 45-minute phone call without resentment.",
            sphere = LifeSphere.RELATIONSHIPS,
            authorId = menteeJoshua.id,
            authorName = "Joshua Miller",
            authorRole = UserRole.YOUNG_BELIEVER_MENTEE,
            dateCreated = "Aug 18, 2026",
            privacyLevel = PrayerPrivacyLevel.CONFIDENTIAL_MENTOR_PAIR_ONLY,
            isAnswered = true,
            praiseReport = "Praise God! Dad accepted my apology and asked to read the devotional book I sent him for his birthday.",
            prayerCount = 28,
            scripturePromise = "Malachi 4:6 - 'He will turn the hearts of the parents to their children...'"
        ),
        PrayerRequest(
            id = "prayer_3",
            title = "Strength in Secret-Place Daily Devotion & Purity of Mind",
            description = "Guarding my eyes and thought life in a digital era. Asking God for a pure heart and unwavering focus on Christ during early mornings.",
            sphere = LifeSphere.PERSONAL_GROWTH,
            authorId = menteeJoshua.id,
            authorName = "Joshua Miller",
            authorRole = UserRole.YOUNG_BELIEVER_MENTEE,
            dateCreated = "Aug 10, 2026",
            privacyLevel = PrayerPrivacyLevel.ENCRYPTED_PRIVATE_WITH_GOD,
            isAnswered = false,
            praiseReport = null,
            prayerCount = 9,
            scripturePromise = "Psalm 51:10 - 'Create in me a pure heart, O God, and renew a steadfast spirit within me.'"
        ),
        PrayerRequest(
            id = "prayer_4",
            title = "Faithful Stewardship & Avoiding Materialist Traps",
            description = "Praying that as graduation nears and income starts, my heart remains gripped by radical generosity for missions and the poor.",
            sphere = LifeSphere.FINANCES,
            authorId = menteeJoshua.id,
            authorName = "Joshua Miller",
            authorRole = UserRole.YOUNG_BELIEVER_MENTEE,
            dateCreated = "Aug 02, 2026",
            privacyLevel = PrayerPrivacyLevel.CHURCH_FELLOWSHIP_CIRCLE,
            isAnswered = false,
            praiseReport = null,
            prayerCount = 19,
            scripturePromise = "1 Timothy 6:17-18 - 'Command those who are rich in this present world not to be arrogant... but to be generous and willing to share.'"
        )
    )

    val sampleScriptureCards = listOf(
        ScriptureCard(
            reference = "Colossians 3:23-24",
            text = "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters, since you know that you will receive an inheritance from the Lord as a reward. It is the Lord Christ you are serving.",
            translation = "NIV",
            sphere = LifeSphere.ACADEMIA_CAREER,
            memoryProgress = 100,
            memorized = true
        ),
        ScriptureCard(
            reference = "Proverbs 3:5-6",
            text = "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
            translation = "NIV",
            sphere = LifeSphere.PERSONAL_GROWTH,
            memoryProgress = 100,
            memorized = true
        ),
        ScriptureCard(
            reference = "1 Corinthians 6:19-20",
            text = "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.",
            translation = "NIV",
            sphere = LifeSphere.PHYSICAL_WELLBEING,
            memoryProgress = 70,
            memorized = false
        ),
        ScriptureCard(
            reference = "Proverbs 3:9-10",
            text = "Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing, and your vats will brim over with new wine.",
            translation = "NIV",
            sphere = LifeSphere.FINANCES,
            memoryProgress = 85,
            memorized = false
        ),
        ScriptureCard(
            reference = "1 Thessalonians 5:11",
            text = "Therefore encourage one another and build each other up, just as in fact you are doing.",
            translation = "NIV",
            sphere = LifeSphere.RELATIONSHIPS,
            memoryProgress = 90,
            memorized = false
        )
    )

    val sampleResources = listOf(
        ResourceItem(
            id = "res_1",
            title = "Celebration of Discipline: The Path to Spiritual Growth",
            author = "Richard J. Foster (Recommended by Elder Thomas)",
            sphere = LifeSphere.PERSONAL_GROWTH,
            type = ResourceType.DISCIPLESHIP_BOOK,
            description = "Explores the classic inward, outward, and corporate disciplines of the Christian life including meditation, prayer, fasting, and study.",
            scriptureReference = "1 Timothy 4:7-8",
            readTimeMinutes = 45,
            isRecommendedByMentor = true,
            mentorRecommendationNote = "Read Chapters 1-3 on Prayer and Solitude before our next call. It transformed my walk 30 years ago.",
            contentSummary = "Spiritual disciplines are not a way to earn God's favor, but the channel through which we place ourselves before God so He can transform our inner life.",
            keyTakeaways = listOf(
                "Superficiality is the curse of our age; the desperate need is for deep spiritual roots.",
                "The disciplines of prayer, fasting, and solitude open the door to genuine intimacy with the Father.",
                "Corporate disciplines like confession and guidance keep us humble and accountable within the body of Christ."
            )
        ),
        ResourceItem(
            id = "res_2",
            title = "Master Your Money: A Step-by-Step Biblical Financial Blueprint",
            author = "Ron Blue & Jeremy White (Recommended by Dr. Samuel)",
            sphere = LifeSphere.FINANCES,
            type = ResourceType.STUDY_GUIDE_PDF,
            description = "Comprehensive guide on living on less than you make, eliminating debt, setting long-term goals, and giving generously.",
            scriptureReference = "Proverbs 21:20",
            readTimeMinutes = 30,
            isRecommendedByMentor = true,
            mentorRecommendationNote = "Follow the 5 Biblical Principles in Chapter 2 to build your first post-college budget.",
            contentSummary = "God owns everything (Psalm 24:1). We are simply managers or stewards of His property. Faithfulness in small things qualifies us for true kingdom riches.",
            keyTakeaways = listOf(
                "Spend less than you earn consistently.",
                "Avoid the use of debt and prioritize immediate payoff.",
                "Maintain liquidity for emergencies to avoid fear-driven financial decisions.",
                "Give generously to store up treasures in heaven."
            )
        ),
        ResourceItem(
            id = "res_3",
            title = "Every Good Endeavor: Connecting Your Work to God's Work",
            author = "Timothy Keller",
            sphere = LifeSphere.ACADEMIA_CAREER,
            type = ResourceType.DISCIPLESHIP_BOOK,
            description = "A theological framework for seeing our daily work, engineering, business, and study as an integral part of God's redemptive mission.",
            scriptureReference = "Genesis 2:15 & Colossians 3:23",
            readTimeMinutes = 35,
            isRecommendedByMentor = true,
            mentorRecommendationNote = "Pay special attention to the section on avoiding making career an idol while pursuing excellence.",
            contentSummary = "Work is not a curse resulting from the Fall; God worked and designed humanity to cultivate creation in love and service to our neighbors.",
            keyTakeaways = listOf(
                "Work has intrinsic dignity because God Himself is a worker and Creator.",
                "Integrate Christian worldview into ethical workplace dilemmas and culture building.",
                "Rest is essential: Sabbath protects us from defining our worth by our productivity."
            )
        ),
        ResourceItem(
            id = "res_4",
            title = "The Meaning of Marriage & Biblical Friendship",
            author = "Timothy & Kathy Keller",
            sphere = LifeSphere.RELATIONSHIPS,
            type = ResourceType.DEVOTIONAL_SERIES,
            description = "Grounded in Ephesians 5, exploring how covenant commitment and gospel-centered grace unlock lifelong flourishing.",
            scriptureReference = "Ephesians 5:25-33",
            readTimeMinutes = 25,
            isRecommendedByMentor = false,
            mentorRecommendationNote = null,
            contentSummary = "Marriage and friendships reflect the sacrificial, covenant-keeping love of Jesus Christ for His bride, the Church.",
            keyTakeaways = listOf(
                "Look for godly character, humble teachability, and spiritual maturity over superficial traits.",
                "Practice quick forgiveness and open communication.",
                "Serve before seeking to be served."
            )
        ),
        ResourceItem(
            id = "res_5",
            title = "Habits of Grace: Enjoying Jesus through the Spiritual Disciplines",
            author = "David Mathis",
            sphere = LifeSphere.PHYSICAL_WELLBEING,
            type = ResourceType.STUDY_GUIDE_PDF,
            description = "Practical guide to body stewardship, sleep, hearing God's voice in Bible intake, and resting in the gospel.",
            scriptureReference = "Mark 2:27",
            readTimeMinutes = 20,
            isRecommendedByMentor = true,
            mentorRecommendationNote = "Great practical advice on sleep hygiene and mental peace through evening prayer.",
            contentSummary = "Spiritual disciplines are simple habits of grace—small daily channels where God's peace and strength flow into our busy lives.",
            keyTakeaways = listOf(
                "Prioritize consistent physical rest as an act of trust in God's sovereignty.",
                "Quiet the digital noise 30 minutes before sleep with Scripture meditation.",
                "Honor your body as a temple by moving, eating well, and giving praise."
            )
        )
    )

    val sampleDevotions = listOf(
        DailyDevotion(
            id = "dev_1",
            title = "Phronesis: The Practical Wisdom of the Kingdom",
            authorId = mentorThomas.id,
            authorName = mentorThomas.name,
            authorRole = UserRole.MENTOR_ELDER,
            authorAvatar = mentorThomas.avatarInitial,
            sphere = LifeSphere.PERSONAL_GROWTH,
            datePosted = "Today • August 29",
            scripturePassage = "Proverbs 4:7 & Ephesians 1:17-18",
            scriptureText = "“Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding... that the God of our Lord Jesus Christ, the Father of glory, may give unto you the spirit of wisdom and revelation in the knowledge of him.”",
            reflection = "Phronesis (φρόνησις) is not mere academic knowledge or abstract theology. In the biblical mindset, it is the divine capacity to apply spiritual truth directly to everyday human decisions—how we talk to our bosses, spend our first paycheck, respond to offense, and steward our physical bodies. When young believers partner with seasoned elders, this practical wisdom is transferred not merely by lectures, but by life-on-life discipleship.",
            practicalStep = "Take 10 quiet minutes before checking your phone today. Ask the Holy Spirit for Phronesis wisdom over one difficult conversation or decision you must make before sunset.",
            prayerAnchor = "Lord Jesus, grant me the spirit of wisdom and revelation today. Teach me to walk circumspectly, redeeming the time, and honoring You with every choice. Amen.",
            readingTimeMinutes = 3,
            audioNarrationUrl = "devotion_narration_audio_1.mp3",
            audioNarrationDuration = "3:15",
            amenCount = 42,
            isAmendedByCurrentUser = true,
            isFeaturedToday = true,
            comments = listOf(
                DevotionComment(
                    id = "c1",
                    authorName = "Joshua Miller",
                    authorRole = UserRole.YOUNG_BELIEVER_MENTEE,
                    authorAvatar = "J",
                    commentText = "This word on Phronesis hit deeply today Elder Thomas. Applying this to my job offer negotiations this morning!",
                    timestamp = "1 hour ago"
                ),
                DevotionComment(
                    id = "c2",
                    authorName = "Pastor Deborah Vance",
                    authorRole = UserRole.MENTOR_ELDER,
                    authorAvatar = "D",
                    commentText = "Amen! Proverbs 4 reminds us that wisdom guards our footsteps. Praying for every young believer reading this today.",
                    timestamp = "30 mins ago"
                )
            )
        ),
        DailyDevotion(
            id = "dev_2",
            title = "Financial Integrity & The Generous Heart",
            authorId = mentorSamuel.id,
            authorName = mentorSamuel.name,
            authorRole = UserRole.MENTOR_ELDER,
            authorAvatar = mentorSamuel.avatarInitial,
            sphere = LifeSphere.FINANCES,
            datePosted = "Yesterday • August 28",
            scripturePassage = "2 Corinthians 9:6-8 & Proverbs 3:9-10",
            scriptureText = "“Remember this: Whoever sows sparingly will also reap sparingly, and whoever sows generously will also reap generously. Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.”",
            reflection = "In our culture of endless consumer desire, biblical stewardship is radical counter-cultural warfare. When we return the firstfruits to God, we dismantle the idol of Mammon and proclaim that Christ is our true security. Tithing is not a tax; it is an invitation into kingdom abundance where God multiplies seed for the sower.",
            practicalStep = "Review your bank statement this month. Identify one recurring non-essential subscription you can cancel, and reroute those funds to bless a missionary or local community member in need.",
            prayerAnchor = "Father, all that I have belongs to You. Free my heart from fear of lack, and make me a conduit of generous blessing to Your church and the needy. Amen.",
            readingTimeMinutes = 4,
            audioNarrationUrl = "devotion_narration_audio_2.mp3",
            audioNarrationDuration = "4:10",
            amenCount = 38,
            isAmendedByCurrentUser = false,
            isFeaturedToday = false,
            comments = listOf(
                DevotionComment(
                    id = "c3",
                    authorName = "Joshua Miller",
                    authorRole = UserRole.YOUNG_BELIEVER_MENTEE,
                    authorAvatar = "J",
                    commentText = "Just set up my automated 10% firstfruit tithe! Feeling so much peace.",
                    timestamp = "Yesterday"
                )
            )
        ),
        DailyDevotion(
            id = "dev_3",
            title = "Sacred Temple: The Spirituality of Sleep & Sabbath",
            authorId = mentorDeborah.id,
            authorName = mentorDeborah.name,
            authorRole = UserRole.MENTOR_ELDER,
            authorAvatar = mentorDeborah.avatarInitial,
            sphere = LifeSphere.PHYSICAL_WELLBEING,
            datePosted = "August 27, 2026",
            scripturePassage = "Psalm 127:2 & 1 Corinthians 6:19-20",
            scriptureText = "“In vain you rise early and stay up late, toiling for food to eat—for he grants sleep to those he loves.”",
            reflection = "Why is chronic exhaustion so prevalent among young professionals and students? Often, our inability to rest stems from unbelief—the subtle anxiety that if we stop working, everything will fall apart. Sabbath is a confession that God is the Sovereign Creator, and we are creatures. Resting our bodies is an act of worship.",
            practicalStep = "Turn off screens 45 minutes before sleep tonight. Replace social media scrolling with reading 3 chapters of Psalms by dim lamp light.",
            prayerAnchor = "Lord, I lay down my striving. Grant sweet rest to my weary body and renew my soul in Your holy presence. In Jesus' name, Amen.",
            readingTimeMinutes = 3,
            audioNarrationUrl = "devotion_narration_audio_3.mp3",
            audioNarrationDuration = "3:30",
            amenCount = 51,
            isAmendedByCurrentUser = true,
            isFeaturedToday = false,
            comments = emptyList()
        )
    )

    val samplePodcasts = listOf(
        PodcastEpisode(
            id = "pod_1",
            title = "Episode 1: The Phronesis Blueprint — Cross-Generational Discipleship in a Digital Age",
            seriesName = "Phronesis Mentorship Voice",
            hostName = mentorThomas.name,
            hostRole = "Senior Elder & Aerospace Engineer",
            hostAvatar = mentorThomas.avatarInitial,
            mediaType = PodcastMediaType.AUDIO_PODCAST,
            mediaUrl = "https://example.com/audio/phronesis_ep1.mp3",
            durationString = "28:45",
            durationSeconds = 1725,
            sphereFocus = LifeSphere.PERSONAL_GROWTH,
            episodeNumber = 1,
            publishDate = "August 28, 2026",
            description = "Elder Thomas Bradley unpacks why the ancient Titus 2 model of discipleship is the ultimate antidote to spiritual loneliness, digital distraction, and shallow discipleship among Gen Z and young professionals.",
            keyTakeaways = listOf(
                "Why information without elder incarnation leads to spiritual fatigue.",
                "How to build mutual vulnerability between senior saints and young disciples.",
                "Establishing an unshakeable 30-minute morning secret-place prayer rhythm."
            ),
            scriptureAnchor = "Titus 2:1-8 & 2 Timothy 2:2",
            discussionQuestions = listOf(
                "What is the biggest barrier preventing you from being fully transparent with your mentor?",
                "How has digital media shaped your attention span in prayer?"
            ),
            likesCount = 89,
            hasLiked = true,
            playProgressSeconds = 420,
            videoThumbnailLabel = "Audio Master EP #1",
            isMentorUploaded = true
        ),
        PodcastEpisode(
            id = "pod_2",
            title = "Video Sermon: Kingdom Economics — Disarming Mammon & Building Zero-Debt Wealth",
            seriesName = "Biblical Stewardship Series",
            hostName = mentorSamuel.name,
            hostRole = "Professor of Economics & Philanthropist",
            hostAvatar = mentorSamuel.avatarInitial,
            mediaType = PodcastMediaType.VIDEO_SERMON,
            mediaUrl = "https://example.com/video/kingdom_economics.mp4",
            durationString = "34:12",
            durationSeconds = 2052,
            sphereFocus = LifeSphere.FINANCES,
            episodeNumber = 2,
            publishDate = "August 25, 2026",
            description = "Dr. Samuel Osei presents a full masterclass on how to navigate graduation, student debt, first jobs, and generous tithing without falling into worldly materialism.",
            keyTakeaways = listOf(
                "The difference between Kingdom Stewardship vs worldly wealth accumulation.",
                "The 10-10-80 Rule: 10% Tithe, 10% Kingdom Savings, 80% Disciplined Living.",
                "How to pray over career compensation with biblical contentment."
            ),
            scriptureAnchor = "Luke 16:1-13 & 1 Timothy 6:6-12",
            discussionQuestions = listOf(
                "How do you define financial success according to Jesus?",
                "What practical step can you take this week to lower unnecessary consumption?"
            ),
            likesCount = 124,
            hasLiked = true,
            playProgressSeconds = 950,
            videoThumbnailLabel = "Video Masterclass HD",
            isMentorUploaded = true
        ),
        PodcastEpisode(
            id = "pod_3",
            title = "Workshop: Emotional Health, Forgiveness & Godly Marriage Prep",
            seriesName = "Kingdom Relationships Workshop",
            hostName = mentorDeborah.name,
            hostRole = "Family Ministry Director & Spiritual Director",
            hostAvatar = mentorDeborah.avatarInitial,
            mediaType = PodcastMediaType.VIDEO_SERMON,
            mediaUrl = "https://example.com/video/godly_relationships.mp4",
            durationString = "41:30",
            durationSeconds = 2490,
            sphereFocus = LifeSphere.RELATIONSHIPS,
            episodeNumber = 3,
            publishDate = "August 20, 2026",
            description = "Pastor Deborah Vance teaches on breaking generational cycles of resentment, communicating with godly grace, and preparing your heart for covenant marriage.",
            keyTakeaways = listOf(
                "You cannot have spiritual maturity while remaining emotionally immature.",
                "Forgiveness is a cancellation of the debt, not an instant emotional feeling.",
                "Discerning red flags vs growing pains in Christian relationships."
            ),
            scriptureAnchor = "Ephesians 4:26-32 & Colossians 3:12-15",
            discussionQuestions = listOf(
                "Is there an offense you have been holding onto that God is calling you to release today?",
                "What character traits are non-negotiable in your future friendships or spouse?"
            ),
            likesCount = 96,
            hasLiked = false,
            playProgressSeconds = 0,
            videoThumbnailLabel = "Mentorship Video Workshop",
            isMentorUploaded = true
        ),
        PodcastEpisode(
            id = "pod_4",
            title = "Episode 4: Work as Worship — Being Salt & Light in High-Tech & Corporate Arenas",
            seriesName = "Phronesis Mentorship Voice",
            hostName = mentorThomas.name,
            hostRole = "Senior Elder & Aerospace Engineer",
            hostAvatar = mentorThomas.avatarInitial,
            mediaType = PodcastMediaType.AUDIO_PODCAST,
            mediaUrl = "https://example.com/audio/phronesis_ep4.mp3",
            durationString = "22:15",
            durationSeconds = 1335,
            sphereFocus = LifeSphere.ACADEMIA_CAREER,
            episodeNumber = 4,
            publishDate = "August 15, 2026",
            description = "Elder Thomas shares stories from his 40 years as an aerospace lead on maintaining Christian integrity, refusing unethical shortcuts, and viewing engineering as divine stewardship.",
            keyTakeaways = listOf(
                "Competence is the currency of influence in the workplace.",
                "How to handle difficult bosses and toxic corporate politics with Christlike humility.",
                "Starting a quiet workplace prayer group without violating company policy."
            ),
            scriptureAnchor = "Daniel 6:3-5 & Colossians 3:23",
            discussionQuestions = listOf(
                "How does your faith influence your work quality when nobody is looking?",
                "What is one opportunity you have this week to serve a coworker?"
            ),
            likesCount = 67,
            hasLiked = false,
            playProgressSeconds = 0,
            videoThumbnailLabel = "Audio Podcast #4",
            isMentorUploaded = true
        )
    )
}
