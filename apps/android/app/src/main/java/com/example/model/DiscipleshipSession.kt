package com.example.model

enum class SessionPlatform {
    IN_APP_VIDEO,
    IN_APP_AUDIO,
    WHATSAPP,
    TELEGRAM,
    EMAIL_MEET
}

enum class SessionStatus {
    UPCOMING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}

data class DiscipleshipSession(
    val id: String,
    val title: String,
    val mentorId: String,
    val mentorName: String,
    val menteeId: String,
    val menteeName: String,
    val scheduledDateTime: String,
    val durationMinutes: Int = 45,
    val sphereFocus: LifeSphere,
    val scriptureFocus: String,
    val agenda: List<String>,
    val platform: SessionPlatform = SessionPlatform.IN_APP_VIDEO,
    val status: SessionStatus = SessionStatus.UPCOMING,
    val sessionNotes: String = "",
    val actionItems: List<String> = emptyList(),
    val remindersEnabled: Boolean = true,
    val reminderMinutesBefore: Int = 30
)
