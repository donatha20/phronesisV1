package com.example.model

enum class GoalStatus {
    ACTIVE,
    IN_REVIEW,
    COMPLETED,
    NEEDS_PRAYER
}

data class MilestoneItem(
    val id: String,
    val title: String,
    val isCompleted: Boolean = false,
    val completedDate: String? = null
)

data class GoalItem(
    val id: String,
    val sphere: LifeSphere,
    val title: String,
    val description: String,
    val scriptureAnchor: String,
    val targetDate: String,
    val milestones: List<MilestoneItem>,
    val status: GoalStatus = GoalStatus.ACTIVE,
    val mentorFeedback: String? = null,
    val mentorApproved: Boolean = false,
    val checkInFrequency: String = "Weekly",
    val progressPercent: Int = 0,
    val createdBy: String,
    val assignedTo: String
)
