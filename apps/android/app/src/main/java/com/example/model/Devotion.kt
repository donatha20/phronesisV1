package com.example.model

data class DevotionComment(
    val id: String,
    val authorName: String,
    val authorRole: UserRole,
    val authorAvatar: String,
    val commentText: String,
    val timestamp: String
)

data class DailyDevotion(
    val id: String,
    val title: String,
    val authorId: String,
    val authorName: String,
    val authorRole: UserRole,
    val authorAvatar: String,
    val sphere: LifeSphere,
    val datePosted: String,
    val scripturePassage: String,
    val scriptureText: String,
    val reflection: String,
    val practicalStep: String,
    val prayerAnchor: String,
    val readingTimeMinutes: Int = 3,
    val audioNarrationUrl: String? = null,
    val audioNarrationDuration: String = "3:45",
    val amenCount: Int = 0,
    val isAmendedByCurrentUser: Boolean = false,
    val comments: List<DevotionComment> = emptyList(),
    val isFeaturedToday: Boolean = false
)
