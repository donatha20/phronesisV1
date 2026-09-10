package com.example.model

enum class UserRole {
    MENTOR_ELDER,
    YOUNG_BELIEVER_MENTEE
}

data class UserProfile(
    val id: String,
    val name: String,
    val role: UserRole,
    val title: String,
    val age: Int,
    val location: String,
    val bio: String,
    val spiritualGifts: List<String>,
    val primarySpheres: List<LifeSphere>,
    val churchCommunity: String,
    val yearsInFaith: Int,
    val email: String,
    val phone: String,
    val whatsappNumber: String,
    val telegramUsername: String,
    val isVerifiedElder: Boolean = false,
    val activeMenteesCount: Int = 0,
    val discipleshipHours: Int = 0,
    val avatarInitial: String = name.firstOrNull()?.toString() ?: "U",
    val favoriteScripture: String = "Proverbs 3:5-6",
    val badges: List<String> = emptyList()
)
