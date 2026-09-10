package com.example.model

enum class PodcastMediaType {
    AUDIO_PODCAST,
    VIDEO_SERMON,
    MENTORSHIP_WORKSHOP
}

data class PodcastEpisode(
    val id: String,
    val title: String,
    val seriesName: String,
    val hostName: String,
    val hostRole: String,
    val hostAvatar: String,
    val mediaType: PodcastMediaType,
    val mediaUrl: String,
    val durationString: String,
    val durationSeconds: Int,
    val sphereFocus: LifeSphere,
    val episodeNumber: Int,
    val publishDate: String,
    val description: String,
    val keyTakeaways: List<String>,
    val scriptureAnchor: String,
    val discussionQuestions: List<String>,
    val likesCount: Int = 0,
    val hasLiked: Boolean = false,
    val playProgressSeconds: Int = 0,
    val videoThumbnailLabel: String? = null,
    val isMentorUploaded: Boolean = true
)
