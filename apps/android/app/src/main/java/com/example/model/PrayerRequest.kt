package com.example.model

enum class PrayerPrivacyLevel {
    ENCRYPTED_PRIVATE_WITH_GOD,
    CONFIDENTIAL_MENTOR_PAIR_ONLY,
    CHURCH_FELLOWSHIP_CIRCLE
}

data class PrayerRequest(
    val id: String,
    val title: String,
    val description: String,
    val sphere: LifeSphere,
    val authorId: String,
    val authorName: String,
    val authorRole: UserRole,
    val dateCreated: String,
    val privacyLevel: PrayerPrivacyLevel,
    val isAnswered: Boolean = false,
    val praiseReport: String? = null,
    val prayerCount: Int = 1,
    val scripturePromise: String? = null
)
