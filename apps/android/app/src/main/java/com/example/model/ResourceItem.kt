package com.example.model

enum class ResourceType {
    DEVOTIONAL_SERIES,
    SCRIPTURE_MEMORY_PACK,
    STUDY_GUIDE_PDF,
    DISCIPLESHIP_BOOK,
    AUDIO_SERMON,
    VIDEO_MASTERCLASS
}

data class ScriptureCard(
    val reference: String,
    val text: String,
    val translation: String = "NIV",
    val sphere: LifeSphere,
    val memoryProgress: Int = 0, // 0 to 100%
    val memorized: Boolean = false
)

data class ResourceItem(
    val id: String,
    val title: String,
    val author: String,
    val sphere: LifeSphere,
    val type: ResourceType,
    val description: String,
    val scriptureReference: String,
    val readTimeMinutes: Int,
    val isRecommendedByMentor: Boolean = false,
    val mentorRecommendationNote: String? = null,
    val contentSummary: String,
    val keyTakeaways: List<String>
)
