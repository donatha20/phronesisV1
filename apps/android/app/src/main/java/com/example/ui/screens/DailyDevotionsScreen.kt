package com.example.ui.screens

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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DailyDevotionsScreen(
    devotions: List<DailyDevotion>,
    currentUser: UserProfile,
    onAddDevotion: (DailyDevotion) -> Unit,
    onToggleAmen: (String) -> Unit,
    onAddComment: (devotionId: String, comment: DevotionComment) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var selectedSphereFilter by remember { mutableStateOf<LifeSphere?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var isPostingDialogVisible by remember { mutableStateOf(false) }
    var activeReadingDevotion by remember { mutableStateOf<DailyDevotion?>(null) }

    val filteredDevotions = remember(devotions, selectedSphereFilter, searchQuery) {
        devotions.filter { dev ->
            val matchesSphere = selectedSphereFilter == null || dev.sphere == selectedSphereFilter
            val matchesSearch = searchQuery.isBlank() ||
                    dev.title.contains(searchQuery, ignoreCase = true) ||
                    dev.scripturePassage.contains(searchQuery, ignoreCase = true) ||
                    dev.authorName.contains(searchQuery, ignoreCase = true) ||
                    dev.reflection.contains(searchQuery, ignoreCase = true)
            matchesSphere && matchesSearch
        }
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { isPostingDialogVisible = true },
                containerColor = BrandSecondary,
                contentColor = PureWhite,
                shape = RoundedCornerShape(16.dp),
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp),
                icon = {
                    Icon(
                        imageVector = Icons.Default.EditNote,
                        contentDescription = "Post Devotion"
                    )
                },
                text = {
                    Text(
                        text = "Post Devotion",
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
            // Header Banner
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
                                    colors = listOf(BrandPrimary, BrandPrimaryDark)
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
                                        text = "Daily Phronesis Devotionals",
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PureWhite
                                    )
                                    Text(
                                        text = "Practical Biblical Wisdom & Community Reflections",
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
                                        imageVector = Icons.Default.MenuBook,
                                        contentDescription = null,
                                        tint = PureWhite
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = "“Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom...” — Colossians 3:16",
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
                    placeholder = { Text("Search devotions, scriptures, topics...", fontSize = 13.sp) },
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

            // Sphere Filter Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = 2.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedSphereFilter == null,
                            onClick = { selectedSphereFilter = null },
                            label = { Text("All Spheres (${devotions.size})") },
                            shape = RoundedCornerShape(20.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = BrandPrimary,
                                selectedLabelColor = PureWhite
                            )
                        )
                    }
                    items(LifeSphere.entries.toTypedArray()) { sphere ->
                        val count = devotions.count { it.sphere == sphere }
                        FilterChip(
                            selected = selectedSphereFilter == sphere,
                            onClick = {
                                selectedSphereFilter = if (selectedSphereFilter == sphere) null else sphere
                            },
                            label = { Text("${sphere.displayName} ($count)") },
                            shape = RoundedCornerShape(20.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = sphere.primaryColor,
                                selectedLabelColor = PureWhite
                            )
                        )
                    }
                }
            }

            // Devotions list
            if (filteredDevotions.isEmpty()) {
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
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = "Empty",
                                tint = Slate400,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No devotions found",
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Be the first to post a daily reflection or search with different keywords.",
                                fontSize = 12.sp,
                                color = Slate500
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { isPostingDialogVisible = true },
                                colors = ButtonDefaults.buttonColors(containerColor = BrandSecondary)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Post First Devotional", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            } else {
                items(filteredDevotions, key = { it.id }) { devotion ->
                    DevotionCard(
                        devotion = devotion,
                        onClick = { activeReadingDevotion = devotion },
                        onToggleAmen = { onToggleAmen(devotion.id) },
                        onShareWhatsApp = {
                            val text = "📖 *${devotion.title}*\n${devotion.scripturePassage} - “${devotion.scriptureText}”\n\n*Reflection:*\n${devotion.reflection}\n\n*Practical Step:* ${devotion.practicalStep}\n\nShared from Phronesis Mentorship"
                            ExternalAppHelper.shareViaWhatsApp(context, text)
                        },
                        onShareTelegram = {
                            val text = "📖 *${devotion.title}*\n${devotion.scripturePassage}\n\n${devotion.reflection}\n\nPhronesis Mentorship"
                            ExternalAppHelper.shareViaTelegram(context, text)
                        }
                    )
                }
            }
        }
    }

    // Post Dialog
    if (isPostingDialogVisible) {
        PostDevotionDialog(
            currentUser = currentUser,
            onDismiss = { isPostingDialogVisible = false },
            onPost = { newDevotion ->
                onAddDevotion(newDevotion)
                isPostingDialogVisible = false
            }
        )
    }

    // Reader Dialog
    activeReadingDevotion?.let { devotion ->
        val currentInState = devotions.firstOrNull { it.id == devotion.id } ?: devotion
        FullDevotionReaderDialog(
            devotion = currentInState,
            currentUser = currentUser,
            onDismiss = { activeReadingDevotion = null },
            onToggleAmen = { onToggleAmen(devotion.id) },
            onAddComment = { commentText ->
                val comment = DevotionComment(
                    id = "com_${System.currentTimeMillis()}",
                    authorName = currentUser.name,
                    authorRole = currentUser.role,
                    authorAvatar = currentUser.avatarInitial,
                    commentText = commentText,
                    timestamp = "Just now"
                )
                onAddComment(devotion.id, comment)
            }
        )
    }
}

@Composable
fun DevotionCard(
    devotion: DailyDevotion,
    onClick: () -> Unit,
    onToggleAmen: () -> Unit,
    onShareWhatsApp: () -> Unit,
    onShareTelegram: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row: Author & Sphere Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(if (devotion.authorRole == UserRole.MENTOR_ELDER) BrandPrimary else BrandSecondary),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = devotion.authorAvatar,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite,
                            fontSize = 16.sp
                        )
                    }
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = devotion.authorName,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (devotion.authorRole == UserRole.MENTOR_ELDER) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(
                                    imageVector = Icons.Default.Verified,
                                    contentDescription = "Elder",
                                    tint = BrandPrimary,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                        Text(
                            text = "${devotion.datePosted} • ${devotion.readingTimeMinutes} min read",
                            fontSize = 11.sp,
                            color = Slate400
                        )
                    }
                }

                LifeSphereBadge(sphere = devotion.sphere)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Title
            Text(
                text = devotion.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                lineHeight = 22.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Scripture Banner Box
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = devotion.sphere.primaryColor.copy(alpha = 0.08f),
                border = androidx.compose.foundation.BorderStroke(1.dp, devotion.sphere.primaryColor.copy(alpha = 0.2f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = devotion.scripturePassage,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = devotion.sphere.primaryColor
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = devotion.scriptureText,
                        fontSize = 12.sp,
                        fontStyle = FontStyle.Italic,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        lineHeight = 16.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Reflection preview
            Text(
                text = devotion.reflection,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 3,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Footer Actions (Amen, Comments count, Share)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Amen button
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (devotion.isAmendedByCurrentUser) BrandSecondary.copy(alpha = 0.15f) else Slate100,
                        modifier = Modifier.clickable { onToggleAmen() }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = if (devotion.isAmendedByCurrentUser) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Amen",
                                tint = if (devotion.isAmendedByCurrentUser) BrandSecondaryDark else Slate500,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${devotion.amenCount} Amen",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (devotion.isAmendedByCurrentUser) BrandSecondaryDark else Slate600
                            )
                        }
                    }

                    // Comments count
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.ChatBubbleOutline,
                            contentDescription = "Comments",
                            tint = Slate400,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${devotion.comments.size}",
                            fontSize = 12.sp,
                            color = Slate500,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    if (devotion.audioNarrationUrl != null) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = BrandPrimary.copy(alpha = 0.1f),
                            modifier = Modifier.padding(start = 4.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.GraphicEq,
                                    contentDescription = "Audio narration",
                                    tint = BrandPrimary,
                                    modifier = Modifier.size(12.dp)
                                )
                                Spacer(modifier = Modifier.width(3.dp))
                                Text(
                                    text = devotion.audioNarrationDuration,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandPrimary
                                )
                            }
                        }
                    }
                }

                // Share options
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(
                        onClick = onShareWhatsApp,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share WhatsApp",
                            tint = WhatsAppGreen,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    IconButton(
                        onClick = onShareTelegram,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "Share Telegram",
                            tint = TelegramBlue,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PostDevotionDialog(
    currentUser: UserProfile,
    onDismiss: () -> Unit,
    onPost: (DailyDevotion) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var selectedSphere by remember { mutableStateOf(LifeSphere.PERSONAL_GROWTH) }
    var scripturePassage by remember { mutableStateOf("") }
    var scriptureText by remember { mutableStateOf("") }
    var reflection by remember { mutableStateOf("") }
    var practicalStep by remember { mutableStateOf("") }
    var prayerAnchor by remember { mutableStateOf("") }
    var attachAudioVoiceNote by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = "Post Daily Devotion",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Close")
                        }
                    },
                    actions = {
                        Button(
                            onClick = {
                                if (title.isNotBlank() && scripturePassage.isNotBlank() && reflection.isNotBlank()) {
                                    val newDev = DailyDevotion(
                                        id = "dev_${System.currentTimeMillis()}",
                                        title = title.trim(),
                                        authorId = currentUser.id,
                                        authorName = currentUser.name,
                                        authorRole = currentUser.role,
                                        authorAvatar = currentUser.avatarInitial,
                                        sphere = selectedSphere,
                                        datePosted = "Just now",
                                        scripturePassage = scripturePassage.trim(),
                                        scriptureText = if (scriptureText.isNotBlank()) scriptureText.trim() else "“Study to show thyself approved unto God...”",
                                        reflection = reflection.trim(),
                                        practicalStep = if (practicalStep.isNotBlank()) practicalStep.trim() else "Meditate on this passage in your quiet time today.",
                                        prayerAnchor = if (prayerAnchor.isNotBlank()) prayerAnchor.trim() else "Lord, lead our steps in Your wisdom.",
                                        readingTimeMinutes = (reflection.length / 300).coerceAtLeast(2),
                                        audioNarrationUrl = if (attachAudioVoiceNote) "user_uploaded_audio_voice_note.mp3" else null,
                                        audioNarrationDuration = if (attachAudioVoiceNote) "2:45" else "0:00",
                                        amenCount = 1,
                                        isAmendedByCurrentUser = true
                                    )
                                    onPost(newDev)
                                }
                            },
                            enabled = title.isNotBlank() && scripturePassage.isNotBlank() && reflection.isNotBlank(),
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
                item {
                    // Author banner
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(BrandPrimary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(currentUser.avatarInitial, color = PureWhite, fontWeight = FontWeight.Bold)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Author: ${currentUser.name}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = if (currentUser.role == UserRole.MENTOR_ELDER) "Elder Pastoral Devotional" else "Mentee Discipleship Testimony",
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
                        label = { Text("Devotional Title *") },
                        placeholder = { Text("e.g. Walking in Quiet Confidence") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Life Sphere Selector
                item {
                    Text("Select Life Sphere Focus *", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(LifeSphere.entries.toTypedArray()) { sphere ->
                            FilterChip(
                                selected = selectedSphere == sphere,
                                onClick = { selectedSphere = sphere },
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

                // Scripture Passage
                item {
                    OutlinedTextField(
                        value = scripturePassage,
                        onValueChange = { scripturePassage = it },
                        label = { Text("Scripture Reference *") },
                        placeholder = { Text("e.g. Proverbs 3:5-6 or Philippians 4:6-7") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Scripture Text
                item {
                    OutlinedTextField(
                        value = scriptureText,
                        onValueChange = { scriptureText = it },
                        label = { Text("Scripture Passage Text (Optional)") },
                        placeholder = { Text("“Trust in the Lord with all your heart...”") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Reflection Body
                item {
                    OutlinedTextField(
                        value = reflection,
                        onValueChange = { reflection = it },
                        label = { Text("Reflection & Spiritual Teaching *") },
                        placeholder = { Text("Share how God illuminated this scripture and how it applies to practical life...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 4,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Practical Step
                item {
                    OutlinedTextField(
                        value = practicalStep,
                        onValueChange = { practicalStep = it },
                        label = { Text("Today's Practical Action Step (Phronesis)") },
                        placeholder = { Text("e.g. Reach out to one person you need to forgive today...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Prayer Anchor
                item {
                    OutlinedTextField(
                        value = prayerAnchor,
                        onValueChange = { prayerAnchor = it },
                        label = { Text("Closing Prayer Anchor") },
                        placeholder = { Text("e.g. Heavenly Father, grant us grace to obey...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2,
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                // Audio Voice Note Attachment Toggle
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Mic,
                                    contentDescription = "Voice note",
                                    tint = if (attachAudioVoiceNote) BrandPrimary else Slate400
                                )
                                Column {
                                    Text(
                                        text = "Attach Audio Narration Note",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                    Text(
                                        text = "Simulated 2-3 min spoken prayer & meditation",
                                        fontSize = 11.sp,
                                        color = Slate500
                                    )
                                }
                            }
                            Switch(
                                checked = attachAudioVoiceNote,
                                onCheckedChange = { attachAudioVoiceNote = it }
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FullDevotionReaderDialog(
    devotion: DailyDevotion,
    currentUser: UserProfile,
    onDismiss: () -> Unit,
    onToggleAmen: () -> Unit,
    onAddComment: (String) -> Unit
) {
    val context = LocalContext.current
    var isPlayingAudio by remember { mutableStateOf(false) }
    var audioProgress by remember { mutableFloatStateOf(0.35f) }
    var commentInput by remember { mutableStateOf("") }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = devotion.sphere.displayName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                        }
                    },
                    actions = {
                        IconButton(
                            onClick = {
                                val text = "📖 ${devotion.title}\n${devotion.scripturePassage}\n\n${devotion.reflection}"
                                ExternalAppHelper.shareViaWhatsApp(context, text)
                            }
                        ) {
                            Icon(Icons.Default.Share, contentDescription = "Share", tint = BrandPrimary)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            },
            bottomBar = {
                Surface(
                    tonalElevation = 8.dp,
                    color = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = commentInput,
                            onValueChange = { commentInput = it },
                            placeholder = { Text("Share a mentorship reflection...", fontSize = 12.sp) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(20.dp),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = BrandPrimary,
                                unfocusedBorderColor = Slate200
                            )
                        )
                        IconButton(
                            onClick = {
                                if (commentInput.isNotBlank()) {
                                    onAddComment(commentInput.trim())
                                    commentInput = ""
                                }
                            },
                            enabled = commentInput.isNotBlank(),
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(if (commentInput.isNotBlank()) BrandPrimary else Slate200)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "Post Comment",
                                tint = if (commentInput.isNotBlank()) PureWhite else Slate400,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        ) { padding ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(top = 8.dp, bottom = 20.dp)
            ) {
                // Author Header
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(if (devotion.authorRole == UserRole.MENTOR_ELDER) BrandPrimary else BrandSecondary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = devotion.authorAvatar,
                                    fontWeight = FontWeight.Bold,
                                    color = PureWhite,
                                    fontSize = 18.sp
                                )
                            }
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = devotion.authorName,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp
                                    )
                                    if (devotion.authorRole == UserRole.MENTOR_ELDER) {
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Icon(Icons.Default.Verified, contentDescription = null, tint = BrandPrimary, modifier = Modifier.size(14.dp))
                                    }
                                }
                                Text(
                                    text = "${devotion.datePosted} • ${devotion.readingTimeMinutes} min read",
                                    fontSize = 12.sp,
                                    color = Slate500
                                )
                            }
                        }
                        LifeSphereBadge(sphere = devotion.sphere)
                    }
                }

                // Audio player if attached
                if (devotion.audioNarrationUrl != null) {
                    item {
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = BrandPrimary.copy(alpha = 0.08f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BrandPrimary.copy(alpha = 0.2f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        IconButton(
                                            onClick = { isPlayingAudio = !isPlayingAudio },
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(CircleShape)
                                                .background(BrandPrimary)
                                        ) {
                                            Icon(
                                                imageVector = if (isPlayingAudio) Icons.Default.Pause else Icons.Default.PlayArrow,
                                                contentDescription = "Audio play",
                                                tint = PureWhite,
                                                modifier = Modifier.size(20.dp)
                                            )
                                        }
                                        Column {
                                            Text(
                                                text = "Audio Spoken Meditation",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 13.sp,
                                                color = BrandPrimaryDark
                                            )
                                            Text(
                                                text = if (isPlayingAudio) "Playing • ${devotion.audioNarrationDuration}" else "Listen with Elder Narration (${devotion.audioNarrationDuration})",
                                                fontSize = 11.sp,
                                                color = Slate500
                                            )
                                        }
                                    }
                                    Icon(
                                        imageVector = Icons.Default.GraphicEq,
                                        contentDescription = "Equalizer",
                                        tint = if (isPlayingAudio) BrandSecondary else Slate400
                                    )
                                }

                                if (isPlayingAudio) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Slider(
                                        value = audioProgress,
                                        onValueChange = { audioProgress = it },
                                        colors = SliderDefaults.colors(
                                            thumbColor = BrandPrimary,
                                            activeTrackColor = BrandPrimary
                                        )
                                    )
                                }
                            }
                        }
                    }
                }

                // Title
                item {
                    Text(
                        text = devotion.title,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        lineHeight = 26.sp
                    )
                }

                // Scripture Passage Box
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = devotion.sphere.primaryColor.copy(alpha = 0.08f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, devotion.sphere.primaryColor.copy(alpha = 0.25f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = devotion.scripturePassage,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = devotion.sphere.primaryColor
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = devotion.scriptureText,
                                fontStyle = FontStyle.Italic,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface,
                                lineHeight = 19.sp
                            )
                        }
                    }
                }

                // Reflection Body
                item {
                    Text(
                        text = devotion.reflection,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface,
                        lineHeight = 22.sp
                    )
                }

                // Practical Step Box
                item {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldGreen, modifier = Modifier.size(18.dp))
                                Text("Today's Practical Step (Phronesis)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = devotion.practicalStep,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }

                // Prayer Anchor Box
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = BrandSecondary.copy(alpha = 0.08f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BrandSecondary.copy(alpha = 0.2f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.Favorite, contentDescription = null, tint = BrandSecondary, modifier = Modifier.size(18.dp))
                                Text("Prayer Anchor", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = BrandSecondaryDark)
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = devotion.prayerAnchor,
                                fontStyle = FontStyle.Italic,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface,
                                lineHeight = 19.sp
                            )
                        }
                    }
                }

                // Amen & Interactive Action Bar
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = onToggleAmen,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (devotion.isAmendedByCurrentUser) BrandSecondary else Slate100,
                                contentColor = if (devotion.isAmendedByCurrentUser) PureWhite else Slate700
                            ),
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Icon(
                                imageVector = if (devotion.isAmendedByCurrentUser) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "${devotion.amenCount} Pray & Amen",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }

                        Text(
                            text = "${devotion.comments.size} Mentorship Comments",
                            fontSize = 12.sp,
                            color = Slate500,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                // Comments / Mentorship Discussion Section
                item {
                    Text(
                        text = "Mentorship Discussion & Testimonies",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                if (devotion.comments.isEmpty()) {
                    item {
                        Text(
                            text = "No reflections yet. Be the first to share your thoughts or ask a question!",
                            fontSize = 12.sp,
                            color = Slate400,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                } else {
                    items(devotion.comments) { comment ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(if (comment.authorRole == UserRole.MENTOR_ELDER) BrandPrimary else BrandSecondary),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = comment.authorAvatar,
                                        color = PureWhite,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = comment.authorName,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp
                                        )
                                        Text(
                                            text = comment.timestamp,
                                            fontSize = 10.sp,
                                            color = Slate400
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = comment.commentText,
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        lineHeight = 16.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
