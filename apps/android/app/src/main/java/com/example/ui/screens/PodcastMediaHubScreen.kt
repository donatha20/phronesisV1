package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.*
import com.example.ui.components.LifeSphereBadge
import com.example.ui.theme.*
import com.example.util.ExternalAppHelper

enum class MediaFilterType {
    ALL,
    AUDIO_ONLY,
    VIDEO_ONLY,
    MENTOR_EPISODES
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PodcastMediaHubScreen(
    episodes: List<PodcastEpisode>,
    currentUser: UserProfile,
    onAddEpisode: (PodcastEpisode) -> Unit,
    onToggleLike: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var selectedFilter by remember { mutableStateOf(MediaFilterType.ALL) }
    var selectedSphereFilter by remember { mutableStateOf<LifeSphere?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var isUploadDialogOpen by remember { mutableStateOf(false) }
    var activePlayingEpisode by remember { mutableStateOf<PodcastEpisode?>(null) }

    val filteredEpisodes = remember(episodes, selectedFilter, selectedSphereFilter, searchQuery) {
        episodes.filter { ep ->
            val matchesType = when (selectedFilter) {
                MediaFilterType.ALL -> true
                MediaFilterType.AUDIO_ONLY -> ep.mediaType == PodcastMediaType.AUDIO_PODCAST
                MediaFilterType.VIDEO_ONLY -> ep.mediaType == PodcastMediaType.VIDEO_SERMON
                MediaFilterType.MENTOR_EPISODES -> ep.isMentorUploaded
            }
            val matchesSphere = selectedSphereFilter == null || ep.sphereFocus == selectedSphereFilter
            val matchesSearch = searchQuery.isBlank() ||
                    ep.title.contains(searchQuery, ignoreCase = true) ||
                    ep.seriesName.contains(searchQuery, ignoreCase = true) ||
                    ep.hostName.contains(searchQuery, ignoreCase = true) ||
                    ep.description.contains(searchQuery, ignoreCase = true) ||
                    ep.scriptureAnchor.contains(searchQuery, ignoreCase = true)
            matchesType && matchesSphere && matchesSearch
        }
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { isUploadDialogOpen = true },
                containerColor = BrandSecondary,
                contentColor = PureWhite,
                shape = RoundedCornerShape(16.dp),
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp),
                icon = {
                    Icon(
                        imageVector = Icons.Default.CloudUpload,
                        contentDescription = "Upload Podcast/Video"
                    )
                },
                text = {
                    Text(
                        text = "Upload Media",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(top = 12.dp, bottom = 80.dp)
        ) {
            // Header Hero Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(BrandPrimaryDark, BrandPrimary)
                                )
                            )
                            .padding(20.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Phronesis Media Hub",
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PureWhite
                                    )
                                    Text(
                                        text = "Podcasts, Video Sermons & Discipleship Workshops",
                                        fontSize = 12.sp,
                                        color = Slate300
                                    )
                                }
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape)
                                        .background(BrandSecondary),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Podcasts,
                                        contentDescription = null,
                                        tint = PureWhite
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = "“Faith comes from hearing the message, and the message is heard through the word about Christ.” — Romans 10:17",
                                fontSize = 12.sp,
                                color = BrandSecondaryLight,
                                fontStyle = FontStyle.Italic
                            )
                        }
                    }
                }
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Search podcasts, sermons, mentors, series...", fontSize = 13.sp) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = Slate400
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    },
                    shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BrandPrimary,
                        unfocusedBorderColor = Slate200
                    ),
                    singleLine = true
                )
            }

            // Format Filter Segment (All, Audio, Video, Mentor)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = selectedFilter == MediaFilterType.ALL,
                        onClick = { selectedFilter = MediaFilterType.ALL },
                        label = { Text("All Media", fontSize = 12.sp) },
                        shape = RoundedCornerShape(18.dp),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = BrandPrimary,
                            selectedLabelColor = PureWhite
                        )
                    )
                    FilterChip(
                        selected = selectedFilter == MediaFilterType.AUDIO_ONLY,
                        onClick = { selectedFilter = MediaFilterType.AUDIO_ONLY },
                        leadingIcon = { Icon(Icons.Default.Mic, contentDescription = null, modifier = Modifier.size(14.dp)) },
                        label = { Text("Audio Podcasts", fontSize = 12.sp) },
                        shape = RoundedCornerShape(18.dp),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = BrandPrimary,
                            selectedLabelColor = PureWhite
                        )
                    )
                    FilterChip(
                        selected = selectedFilter == MediaFilterType.VIDEO_ONLY,
                        onClick = { selectedFilter = MediaFilterType.VIDEO_ONLY },
                        leadingIcon = { Icon(Icons.Default.Videocam, contentDescription = null, modifier = Modifier.size(14.dp)) },
                        label = { Text("Video Sermons", fontSize = 12.sp) },
                        shape = RoundedCornerShape(18.dp),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = BrandSecondary,
                            selectedLabelColor = PureWhite
                        )
                    )
                }
            }

            // Life Sphere Selector Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = 2.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedSphereFilter == null,
                            onClick = { selectedSphereFilter = null },
                            label = { Text("All Spheres", fontSize = 11.sp) },
                            shape = RoundedCornerShape(16.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Slate800,
                                selectedLabelColor = PureWhite
                            )
                        )
                    }
                    items(LifeSphere.entries.toTypedArray()) { sphere ->
                        FilterChip(
                            selected = selectedSphereFilter == sphere,
                            onClick = {
                                selectedSphereFilter = if (selectedSphereFilter == sphere) null else sphere
                            },
                            label = { Text(sphere.displayName, fontSize = 11.sp) },
                            shape = RoundedCornerShape(16.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = sphere.primaryColor,
                                selectedLabelColor = PureWhite
                            )
                        )
                    }
                }
            }

            // Episode List
            if (filteredEpisodes.isEmpty()) {
                item {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Podcasts,
                                contentDescription = "Empty",
                                tint = Slate400,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("No episodes found", fontWeight = FontWeight.SemiBold)
                            Text("Upload a podcast or video sermon to inspire the community!", fontSize = 13.sp, color = Slate500)
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { isUploadDialogOpen = true },
                                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                            ) {
                                Icon(Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Upload Audio or Video")
                            }
                        }
                    }
                }
            } else {
                items(filteredEpisodes, key = { it.id }) { episode ->
                    PodcastEpisodeCard(
                        episode = episode,
                        onPlay = { activePlayingEpisode = episode },
                        onToggleLike = { onToggleLike(episode.id) },
                        onShareWhatsApp = {
                            val msg = "🎙️ *Phronesis Mentorship Media*\n*${episode.title}*\nSeries: ${episode.seriesName} • Host: ${episode.hostName}\n\n*Scripture:* ${episode.scriptureAnchor}\n\n*Description:* ${episode.description}\n\nListen & Watch on Phronesis Mentorship App"
                            ExternalAppHelper.shareViaWhatsApp(context, msg)
                        },
                        onShareTelegram = {
                            val msg = "🎙️ Phronesis Mentorship: ${episode.title}\nSeries: ${episode.seriesName}\nHost: ${episode.hostName}\nScripture: ${episode.scriptureAnchor}"
                            ExternalAppHelper.shareViaTelegram(context, msg)
                        }
                    )
                }
            }
        }
    }

    // Upload Podcast Dialog
    if (isUploadDialogOpen) {
        UploadMediaDialog(
            currentUser = currentUser,
            onDismiss = { isUploadDialogOpen = false },
            onUpload = { newEpisode ->
                onAddEpisode(newEpisode)
                isUploadDialogOpen = false
            }
        )
    }

    // Media Player Modal
    activePlayingEpisode?.let { episode ->
        val currentEpisodeInState = episodes.firstOrNull { it.id == episode.id } ?: episode
        InteractiveMediaPlayerDialog(
            episode = currentEpisodeInState,
            currentUser = currentUser,
            onDismiss = { activePlayingEpisode = null },
            onToggleLike = { onToggleLike(episode.id) }
        )
    }
}

@Composable
fun PodcastEpisodeCard(
    episode: PodcastEpisode,
    onPlay: () -> Unit,
    onToggleLike: () -> Unit,
    onShareWhatsApp: () -> Unit,
    onShareTelegram: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onPlay() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row: Media Type badge + Life Sphere
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (episode.mediaType == PodcastMediaType.AUDIO_PODCAST) BrandPrimary.copy(alpha = 0.1f) else BrandSecondary.copy(alpha = 0.12f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (episode.mediaType == PodcastMediaType.AUDIO_PODCAST) Icons.Default.Mic else Icons.Default.Videocam,
                            contentDescription = null,
                            tint = if (episode.mediaType == PodcastMediaType.AUDIO_PODCAST) BrandPrimary else BrandSecondaryDark,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (episode.mediaType == PodcastMediaType.AUDIO_PODCAST) "Audio Podcast • ${episode.durationString}" else "Video Sermon • ${episode.durationString}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (episode.mediaType == PodcastMediaType.AUDIO_PODCAST) BrandPrimary else BrandSecondaryDark
                        )
                    }
                }

                LifeSphereBadge(sphere = episode.sphereFocus)
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Video/Audio Canvas Preview Box
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = if (episode.mediaType == PodcastMediaType.AUDIO_PODCAST) Color(0xFF1E293B) else Color(0xFF0F172A),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    // Visual background styling
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = episode.seriesName,
                                fontSize = 11.sp,
                                color = BrandSecondaryLight,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = episode.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite,
                                maxLines = 2
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Host: ${episode.hostName} (${episode.hostRole})",
                                fontSize = 11.sp,
                                color = Slate400
                            )
                        }

                        // Play circle icon
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(if (episode.mediaType == PodcastMediaType.AUDIO_PODCAST) BrandPrimary else BrandSecondary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Play",
                                tint = PureWhite,
                                modifier = Modifier.size(26.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Scripture Anchor
            Text(
                text = "📖 Scripture Anchor: ${episode.scriptureAnchor}",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = episode.sphereFocus.darkColor
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = episode.description,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2,
                lineHeight = 17.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Footer (Likes, Publish date, share)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    IconButton(
                        onClick = onToggleLike,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = if (episode.hasLiked) Icons.Default.ThumbUp else Icons.Default.ThumbUpOffAlt,
                            contentDescription = "Like",
                            tint = if (episode.hasLiked) BrandSecondary else Slate400,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Text("${episode.likesCount} Blessed", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate600)
                    Text(
                        text = episode.publishDate,
                        fontSize = 11.sp,
                        color = Slate400
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(
                        onClick = onShareWhatsApp,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.Share, contentDescription = "WhatsApp", tint = WhatsAppGreen, modifier = Modifier.size(18.dp))
                    }
                    IconButton(
                        onClick = onShareTelegram,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Telegram", tint = TelegramBlue, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadMediaDialog(
    currentUser: UserProfile,
    onDismiss: () -> Unit,
    onUpload: (PodcastEpisode) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var seriesName by remember { mutableStateOf("Phronesis Discipleship Series") }
    var hostName by remember { mutableStateOf(currentUser.name) }
    var hostRole by remember { mutableStateOf(if (currentUser.role == UserRole.MENTOR_ELDER) "Elder Mentor" else "Mentee Disciple") }
    var mediaType by remember { mutableStateOf(PodcastMediaType.AUDIO_PODCAST) }
    var sphereFocus by remember { mutableStateOf(LifeSphere.PERSONAL_GROWTH) }
    var scriptureAnchor by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var keyTakeaway1 by remember { mutableStateOf("") }
    var keyTakeaway2 by remember { mutableStateOf("") }
    var discussionQuestion by remember { mutableStateOf("") }
    var simulatedSelectedFileName by remember { mutableStateOf("") }
    var durationMinutes by remember { mutableIntStateOf(25) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text("Upload Podcast or Video", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    },
                    navigationIcon = {
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Close")
                        }
                    },
                    actions = {
                        Button(
                            onClick = {
                                if (title.isNotBlank() && description.isNotBlank()) {
                                    val takeaways = mutableListOf<String>()
                                    if (keyTakeaway1.isNotBlank()) takeaways.add(keyTakeaway1.trim())
                                    if (keyTakeaway2.isNotBlank()) takeaways.add(keyTakeaway2.trim())
                                    if (takeaways.isEmpty()) takeaways.add("Walk faithfully with Christ in practical wisdom.")

                                    val questions = mutableListOf<String>()
                                    if (discussionQuestion.isNotBlank()) questions.add(discussionQuestion.trim())
                                    if (questions.isEmpty()) questions.add("How can you apply this teaching to your current walk?")

                                    val newEpisode = PodcastEpisode(
                                        id = "pod_${System.currentTimeMillis()}",
                                        title = title.trim(),
                                        seriesName = seriesName.trim(),
                                        hostName = hostName.trim(),
                                        hostRole = hostRole.trim(),
                                        hostAvatar = currentUser.avatarInitial,
                                        mediaType = mediaType,
                                        mediaUrl = if (simulatedSelectedFileName.isNotBlank()) simulatedSelectedFileName else "https://phronesis-media.internal/stream_${System.currentTimeMillis()}.mp3",
                                        durationString = "$durationMinutes:00",
                                        durationSeconds = durationMinutes * 60,
                                        sphereFocus = sphereFocus,
                                        episodeNumber = 12,
                                        publishDate = "Today",
                                        description = description.trim(),
                                        keyTakeaways = takeaways,
                                        scriptureAnchor = if (scriptureAnchor.isNotBlank()) scriptureAnchor.trim() else "Colossians 3:16",
                                        discussionQuestions = questions,
                                        likesCount = 1,
                                        hasLiked = true,
                                        isMentorUploaded = currentUser.role == UserRole.MENTOR_ELDER
                                    )
                                    onUpload(newEpisode)
                                }
                            },
                            enabled = title.isNotBlank() && description.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Publish", fontWeight = FontWeight.Bold)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            }
        ) { padding ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Media Type Selector (Audio vs Video)
                item {
                    Text("Select Media Format *", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clickable { mediaType = PodcastMediaType.AUDIO_PODCAST },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (mediaType == PodcastMediaType.AUDIO_PODCAST) BrandPrimary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surfaceVariant
                            ),
                            border = if (mediaType == PodcastMediaType.AUDIO_PODCAST) androidx.compose.foundation.BorderStroke(2.dp, BrandPrimary) else null
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(Icons.Default.Mic, contentDescription = null, tint = if (mediaType == PodcastMediaType.AUDIO_PODCAST) BrandPrimary else Slate400, modifier = Modifier.size(28.dp))
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Audio Podcast", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text("MP3, AAC, M4A", fontSize = 10.sp, color = Slate500)
                            }
                        }

                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clickable { mediaType = PodcastMediaType.VIDEO_SERMON },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (mediaType == PodcastMediaType.VIDEO_SERMON) BrandSecondary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surfaceVariant
                            ),
                            border = if (mediaType == PodcastMediaType.VIDEO_SERMON) androidx.compose.foundation.BorderStroke(2.dp, BrandSecondary) else null
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(Icons.Default.Videocam, contentDescription = null, tint = if (mediaType == PodcastMediaType.VIDEO_SERMON) BrandSecondary else Slate400, modifier = Modifier.size(28.dp))
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Video Sermon", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text("MP4, MOV, YouTube", fontSize = 10.sp, color = Slate500)
                            }
                        }
                    }
                }

                // File Selector Simulation
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                simulatedSelectedFileName = if (mediaType == PodcastMediaType.AUDIO_PODCAST) "discipleship_episode_recording_${System.currentTimeMillis()}.mp3" else "pastoral_video_sermon_${System.currentTimeMillis()}.mp4"
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = if (simulatedSelectedFileName.isNotBlank()) Icons.Default.CheckCircle else Icons.Default.FolderOpen,
                                contentDescription = null,
                                tint = if (simulatedSelectedFileName.isNotBlank()) EmeraldGreen else BrandPrimary,
                                modifier = Modifier.size(28.dp)
                            )
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = if (simulatedSelectedFileName.isNotBlank()) "Selected: $simulatedSelectedFileName" else "Tap to choose audio/video file",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = if (simulatedSelectedFileName.isNotBlank()) "Ready for upload • End-to-end encrypted storage" else "Supports drag-and-drop or device file browser",
                                    fontSize = 11.sp,
                                    color = Slate500
                                )
                            }
                        }
                    }
                }

                // Title
                item {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Episode Title *") },
                        placeholder = { Text("e.g. Navigating Seasons of Spiritual Silence") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Series & Duration
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = seriesName,
                            onValueChange = { seriesName = it },
                            label = { Text("Series Name") },
                            modifier = Modifier.weight(1.5f),
                            shape = RoundedCornerShape(12.dp)
                        )
                        OutlinedTextField(
                            value = durationMinutes.toString(),
                            onValueChange = { durationMinutes = it.toIntOrNull() ?: 20 },
                            label = { Text("Duration (min)") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                // Sphere Focus
                item {
                    Text("Select Life Sphere Focus *", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(LifeSphere.entries.toTypedArray()) { sphere ->
                            FilterChip(
                                selected = sphereFocus == sphere,
                                onClick = { sphereFocus = sphere },
                                label = { Text(sphere.displayName) },
                                shape = RoundedCornerShape(16.dp),
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = sphere.primaryColor,
                                    selectedLabelColor = PureWhite
                                )
                            )
                        }
                    }
                }

                // Scripture Anchor
                item {
                    OutlinedTextField(
                        value = scriptureAnchor,
                        onValueChange = { scriptureAnchor = it },
                        label = { Text("Key Scripture Anchor") },
                        placeholder = { Text("e.g. Colossians 3:23-24 or Titus 2:1-8") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Description
                item {
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Episode Description & Overview *") },
                        placeholder = { Text("Summary of the key biblical counsel, practical wisdom, and testimonies discussed...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Study Takeaways
                item {
                    Text("Study Notes & Biblical Takeaways (Optional)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = keyTakeaway1,
                        onValueChange = { keyTakeaway1 = it },
                        label = { Text("Key Takeaway 1") },
                        placeholder = { Text("e.g. Secret-place prayer precedes public power") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = keyTakeaway2,
                        onValueChange = { keyTakeaway2 = it },
                        label = { Text("Key Takeaway 2") },
                        placeholder = { Text("e.g. Accountability transforms good intentions into character") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Mentorship Discussion Prompt
                item {
                    OutlinedTextField(
                        value = discussionQuestion,
                        onValueChange = { discussionQuestion = it },
                        label = { Text("Mentorship Discussion Question for Pair Calls") },
                        placeholder = { Text("e.g. What is one area where compromise has been tempting you this week?") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2,
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InteractiveMediaPlayerDialog(
    episode: PodcastEpisode,
    currentUser: UserProfile,
    onDismiss: () -> Unit,
    onToggleLike: () -> Unit
) {
    val context = LocalContext.current
    var isPlaying by remember { mutableStateOf(true) }
    var currentSeconds by remember { mutableIntStateOf(episode.playProgressSeconds.coerceAtLeast(30)) }
    var playbackSpeed by remember { mutableFloatStateOf(1.0f) }
    var volumeLevel by remember { mutableFloatStateOf(0.85f) }
    var isMuted by remember { mutableStateOf(false) }

    val totalSeconds = episode.durationSeconds.coerceAtLeast(600)
    val progressFraction = (currentSeconds.toFloat() / totalSeconds).coerceIn(0f, 1f)

    // Animated waveform bars for audio
    val infiniteTransition = rememberInfiniteTransition(label = "equalizer")
    val waveScale1 by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "w1"
    )
    val waveScale2 by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 0.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(550, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "w2"
    )
    val waveScale3 by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(
            animation = tween(350, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "w3"
    )

    fun formatSeconds(sec: Int): String {
        val m = sec / 60
        val s = sec % 60
        return "%02d:%02d".format(m, s)
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = if (episode.mediaType == PodcastMediaType.AUDIO_PODCAST) "Audio Podcast Player" else "Video Sermon Player",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Close")
                        }
                    },
                    actions = {
                        IconButton(
                            onClick = {
                                val msg = "🎙️ *Phronesis Mentorship Media*\n*${episode.title}*\n${episode.description}\n\nShared from Phronesis Mentorship"
                                ExternalAppHelper.shareViaWhatsApp(context, msg)
                            }
                        ) {
                            Icon(Icons.Default.Share, contentDescription = "Share", tint = BrandPrimary)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            }
        ) { padding ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp)
            ) {
                // Media Screen / Video Player Box
                item {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFF0F172A),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(210.dp)
                    ) {
                        Box(modifier = Modifier.fillMaxSize()) {
                            if (episode.mediaType == PodcastMediaType.VIDEO_SERMON) {
                                // Video frame layout
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.LiveTv,
                                        contentDescription = "Video Stream",
                                        tint = BrandSecondaryLight,
                                        modifier = Modifier.size(48.dp)
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "HD Video Stream • 1080p 60fps",
                                        fontSize = 12.sp,
                                        color = PureWhite,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "Speaker: ${episode.hostName}",
                                        fontSize = 11.sp,
                                        color = Slate400
                                    )
                                }
                            } else {
                                // Audio Podcast Equalizer layout
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center
                                ) {
                                    // Animated Waveform Bars
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(modifier = Modifier.width(6.dp).height((40 * waveScale1).dp).clip(RoundedCornerShape(3.dp)).background(BrandSecondaryLight))
                                        Box(modifier = Modifier.width(6.dp).height((60 * waveScale2).dp).clip(RoundedCornerShape(3.dp)).background(BrandPrimaryLight))
                                        Box(modifier = Modifier.width(6.dp).height((50 * waveScale3).dp).clip(RoundedCornerShape(3.dp)).background(BrandSecondary))
                                        Box(modifier = Modifier.width(6.dp).height((70 * waveScale1).dp).clip(RoundedCornerShape(3.dp)).background(PureWhite))
                                        Box(modifier = Modifier.width(6.dp).height((45 * waveScale2).dp).clip(RoundedCornerShape(3.dp)).background(BrandPrimaryLight))
                                        Box(modifier = Modifier.width(6.dp).height((55 * waveScale3).dp).clip(RoundedCornerShape(3.dp)).background(BrandSecondaryLight))
                                    }

                                    Spacer(modifier = Modifier.height(14.dp))

                                    Text(
                                        text = "Phronesis Wisdom Audio Feed",
                                        fontSize = 12.sp,
                                        color = Slate300,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }

                // Progress Bar & Timestamp
                item {
                    Column {
                        Slider(
                            value = progressFraction,
                            onValueChange = { fraction ->
                                currentSeconds = (fraction * totalSeconds).toInt()
                            },
                            colors = SliderDefaults.colors(
                                thumbColor = BrandSecondary,
                                activeTrackColor = BrandSecondary
                            )
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = formatSeconds(currentSeconds),
                                fontSize = 11.sp,
                                color = Slate500,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = episode.durationString,
                                fontSize = 11.sp,
                                color = Slate500,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // Playback Control Buttons (Rewind 15, Play/Pause, Forward 15, Speed)
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Playback speed toggle
                        TextButton(
                            onClick = {
                                playbackSpeed = when (playbackSpeed) {
                                    1.0f -> 1.25f
                                    1.25f -> 1.5f
                                    1.5f -> 2.0f
                                    else -> 1.0f
                                }
                            }
                        ) {
                            Text(
                                text = "${playbackSpeed}x",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = BrandPrimary
                            )
                        }

                        // Rewind 15s
                        IconButton(
                            onClick = { currentSeconds = (currentSeconds - 15).coerceAtLeast(0) },
                            modifier = Modifier.size(44.dp)
                        ) {
                            Icon(Icons.Default.Replay10, contentDescription = "Rewind", tint = MaterialTheme.colorScheme.onSurface, modifier = Modifier.size(28.dp))
                        }

                        // Play/Pause Main Button
                        IconButton(
                            onClick = { isPlaying = !isPlaying },
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(BrandPrimary)
                        ) {
                            Icon(
                                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = "Play/Pause",
                                tint = PureWhite,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        // Forward 15s
                        IconButton(
                            onClick = { currentSeconds = (currentSeconds + 15).coerceAtMost(totalSeconds) },
                            modifier = Modifier.size(44.dp)
                        ) {
                            Icon(Icons.Default.Forward10, contentDescription = "Forward", tint = MaterialTheme.colorScheme.onSurface, modifier = Modifier.size(28.dp))
                        }

                        // Like button
                        IconButton(
                            onClick = onToggleLike,
                            modifier = Modifier.size(44.dp)
                        ) {
                            Icon(
                                imageVector = if (episode.hasLiked) Icons.Default.ThumbUp else Icons.Default.ThumbUpOffAlt,
                                contentDescription = "Like",
                                tint = if (episode.hasLiked) BrandSecondary else Slate400,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                }

                // Title & Details
                item {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            LifeSphereBadge(sphere = episode.sphereFocus)
                            Text(
                                text = "${episode.likesCount} Believers Blessed",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = BrandSecondaryDark
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = episode.title,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 24.sp
                        )

                        Text(
                            text = "Series: ${episode.seriesName} • EP #${episode.episodeNumber}",
                            fontSize = 12.sp,
                            color = Slate500,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                // Scripture Anchor Box
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = BrandPrimary.copy(alpha = 0.08f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BrandPrimary.copy(alpha = 0.2f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "Scripture Anchor",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = BrandPrimary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = episode.scriptureAnchor,
                                fontSize = 13.sp,
                                fontStyle = FontStyle.Italic,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                // Description
                item {
                    Text(
                        text = episode.description,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 19.sp
                    )
                }

                // Key Biblical Takeaways
                if (episode.keyTakeaways.isNotEmpty()) {
                    item {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "Key Biblical Takeaways (Phronesis)",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                episode.keyTakeaways.forEach { takeaway ->
                                    Row(
                                        modifier = Modifier.padding(vertical = 3.dp),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldGreen, modifier = Modifier.size(16.dp))
                                        Text(takeaway, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, lineHeight = 16.sp)
                                    }
                                }
                            }
                        }
                    }
                }

                // Mentorship Discussion Prompts
                if (episode.discussionQuestions.isNotEmpty()) {
                    item {
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = BrandSecondary.copy(alpha = 0.08f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BrandSecondary.copy(alpha = 0.2f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "Mentorship Pair Discussion Prompts",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = BrandSecondaryDark
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                episode.discussionQuestions.forEach { q ->
                                    Row(
                                        modifier = Modifier.padding(vertical = 3.dp),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(Icons.Default.HelpOutline, contentDescription = null, tint = BrandSecondary, modifier = Modifier.size(16.dp))
                                        Text(q, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface, lineHeight = 16.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
