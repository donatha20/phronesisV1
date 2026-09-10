package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.example.model.*
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.util.ExternalAppHelper

@Composable
fun DashboardScreen(
    currentRole: UserRole,
    currentUser: UserProfile,
    pairedMentor: UserProfile,
    goals: List<GoalItem>,
    sessions: List<DiscipleshipSession>,
    devotions: List<DailyDevotion> = emptyList(),
    podcasts: List<PodcastEpisode> = emptyList(),
    onToggleMilestone: (goalId: String, milestoneId: String) -> Unit,
    onStartCall: (DiscipleshipSession) -> Unit,
    onNavigateToSpheres: () -> Unit,
    onNavigateToSessions: () -> Unit,
    onNavigateToPrayers: () -> Unit,
    onNavigateToResources: () -> Unit,
    onNavigateToMentors: () -> Unit,
    onNavigateToDevotions: () -> Unit = {},
    onNavigateToPodcasts: () -> Unit = {},
    onOpenSecurity: () -> Unit,
    onOpenAiAssistant: () -> Unit,
    securitySettings: SecuritySettings,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val upcomingSession = sessions.firstOrNull { it.status == SessionStatus.UPCOMING }
    val featuredDevotion = devotions.firstOrNull { it.isFeaturedToday } ?: devotions.firstOrNull()
    val featuredPodcast = podcasts.firstOrNull()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 32.dp)
    ) {
        // Security Status Banner
        item {
            SecurityStatusBar(
                securitySettings = securitySettings,
                onOpenSecurity = onOpenSecurity
            )
        }

        // Welcome & Daily Anchor
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
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
                                    text = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) "Grace & Peace, ${currentUser.name}" else "Elder Pastoral Portal, ${currentUser.name}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PureWhite
                                )
                                Text(
                                    text = "Phronesis: Practical Biblical Discipleship",
                                    fontSize = 12.sp,
                                    color = Slate300
                                )
                            }
                            IconButton(
                                onClick = onOpenAiAssistant,
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .background(BrandSecondary)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = "Spiritual AI Guidance",
                                    tint = PureWhite
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Daily Scripture Quote inside banner
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0x22FFFFFF),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "“Wisdom is the principal thing; therefore get wisdom (Phronesis): and with all thy getting get understanding.”",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = PureWhite,
                                    lineHeight = 18.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "— Proverbs 4:7 & Titus 2:2-6",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandSecondaryLight
                                )
                            }
                        }
                    }
                }
            }
        }

        // Daily Devotion Anchor Widget
        if (featuredDevotion != null) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToDevotions() },
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.MenuBook,
                                    contentDescription = null,
                                    tint = BrandPrimary,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = "Today's Phronesis Devotional",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                            TextButton(onClick = onNavigateToDevotions) {
                                Text("Devotions Hub", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = BrandPrimary)
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = featuredDevotion.title,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "📖 ${featuredDevotion.scripturePassage} • By ${featuredDevotion.authorName}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = BrandSecondaryDark
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = featuredDevotion.reflection,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 2,
                            lineHeight = 17.sp
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = BrandSecondary.copy(alpha = 0.15f)
                                ) {
                                    Text(
                                        text = "${featuredDevotion.amenCount} Praying",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = BrandSecondaryDark,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                    )
                                }
                                if (featuredDevotion.audioNarrationUrl != null) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.GraphicEq, contentDescription = null, tint = BrandPrimary, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(3.dp))
                                        Text(featuredDevotion.audioNarrationDuration, fontSize = 11.sp, color = BrandPrimary, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }

                            Button(
                                onClick = onNavigateToDevotions,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                            ) {
                                Text("Read & Meditate", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // Featured Podcast / Video Spotlight Widget
        if (featuredPodcast != null) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToPodcasts() },
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Podcasts,
                                    contentDescription = null,
                                    tint = BrandSecondary,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = "Featured Podcast & Video Sermon",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                            TextButton(onClick = onNavigateToPodcasts) {
                                Text("All Media", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = BrandSecondaryDark)
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = featuredPodcast.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "Host: ${featuredPodcast.hostName} • ${featuredPodcast.durationString}",
                            fontSize = 12.sp,
                            color = Slate500
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = onNavigateToPodcasts,
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = BrandSecondary)
                            ) {
                                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Listen & Watch", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }

                            OutlinedButton(
                                onClick = onNavigateToPodcasts,
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Upload", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }

        // Active Mentorship Connection Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) "Your Senior Mentor" else "Your Mentee",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        TextButton(onClick = onNavigateToMentors) {
                            Text(
                                text = "Directory",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = BrandPrimaryLight
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    val displayPartner = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) pairedMentor else currentUser
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) BrandSecondary else BrandPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = displayPartner.avatarInitial,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = displayPartner.name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                if (displayPartner.isVerifiedElder) {
                                    Icon(
                                        imageVector = Icons.Default.Verified,
                                        contentDescription = "Verified Elder",
                                        tint = BrandPrimaryLight,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                            Text(
                                text = displayPartner.title,
                                fontSize = 12.sp,
                                color = Slate500,
                                maxLines = 1
                            )
                            Text(
                                text = "Discipleship: ${displayPartner.discipleshipHours} hrs logged • ${displayPartner.location}",
                                fontSize = 11.sp,
                                color = Slate400
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Quick App Link Buttons (WhatsApp, Telegram, Email, Instant Call)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                if (upcomingSession != null) onStartCall(upcomingSession)
                                else {
                                    val dummy = sessions.first()
                                    onStartCall(dummy)
                                }
                            },
                            modifier = Modifier.weight(1.3f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Videocam,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Video Call", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }

                        // WhatsApp Action
                        IconButton(
                            onClick = {
                                ExternalAppHelper.openWhatsApp(
                                    context = context,
                                    phoneNumber = displayPartner.whatsappNumber,
                                    message = "Grace and peace Elder Thomas! Looking forward to our upcoming mentorship session on Phronesis Mentorship. Here is my prayer focus for this week: James 1:5."
                                )
                            },
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF25D366))
                                .size(44.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Chat,
                                contentDescription = "WhatsApp",
                                tint = PureWhite
                            )
                        }

                        // Telegram Action
                        IconButton(
                            onClick = {
                                ExternalAppHelper.openTelegram(
                                    context = context,
                                    username = displayPartner.telegramUsername,
                                    message = "Hello Elder Thomas, sharing an update on my 5-Sphere goals from Phronesis Mentorship!"
                                )
                            },
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF0088CC))
                                .size(44.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "Telegram",
                                tint = PureWhite
                            )
                        }

                        // Email Action
                        IconButton(
                            onClick = {
                                ExternalAppHelper.sendEmail(
                                    context = context,
                                    recipientEmail = displayPartner.email,
                                    subject = "Phronesis Mentorship Session Agenda & Prayer Notes",
                                    body = "Grace and peace,\n\nHere are my reflection notes and discussion topics for our upcoming session:\n1. Career offer discernment\n2. Romans chapter 8 inductive study\n\nIn Christ,\n${currentUser.name}"
                                )
                            },
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .size(44.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Email,
                                contentDescription = "Email",
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }

        // Next Upcoming Session Card with Auto-reminders
        if (upcomingSession != null) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CalendarMonth,
                                    contentDescription = null,
                                    tint = BrandSecondary,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = "Upcoming Mentorship Session",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                            SphereBadge(sphere = upcomingSession.sphereFocus)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = upcomingSession.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AccessTime,
                                contentDescription = null,
                                tint = Slate400,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "${upcomingSession.scheduledDateTime} (${upcomingSession.durationMinutes} mins)",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = BrandSecondaryDark
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Slate100,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "📖 Scripture Focus: ${upcomingSession.scriptureFocus}",
                                modifier = Modifier.padding(8.dp),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = Slate700
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = { onStartCall(upcomingSession) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                            ) {
                                Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Join Live Room", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }

                            OutlinedButton(
                                onClick = {
                                    ExternalAppHelper.addToCalendar(
                                        context = context,
                                        title = upcomingSession.title,
                                        description = "Phronesis Mentorship Session with ${upcomingSession.mentorName}. Scripture: ${upcomingSession.scriptureFocus}"
                                    )
                                },
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Event, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Sync Calendar", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }

        // 5 Life Spheres Growth Radar
        item {
            SpheresAnalyticsCard(goals = goals)
        }

        // Quick Active Milestones Checklist
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Daily Discipleship Milestones",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        TextButton(onClick = onNavigateToSpheres) {
                            Text("View All Goals", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    goals.take(3).forEach { goal ->
                        goal.milestones.take(2).forEach { milestone ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onToggleMilestone(goal.id, milestone.id) }
                                    .padding(vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = milestone.isCompleted,
                                    onCheckedChange = { onToggleMilestone(goal.id, milestone.id) },
                                    colors = CheckboxDefaults.colors(checkedColor = goal.sphere.primaryColor)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = milestone.title,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = if (milestone.isCompleted) Slate400 else MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = goal.sphere.displayName,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = goal.sphere.darkColor
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Habit Consistency Heatmap
        item {
            HabitConsistencyHeatmap()
        }

        // Quick Navigation Tiles
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateToPrayers() },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Favorite,
                            contentDescription = null,
                            tint = Color(0xFFE11D48),
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Prayer Vault",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Encrypted Journal",
                            fontSize = 10.sp,
                            color = Slate400
                        )
                    }
                }

                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateToResources() },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.MenuBook,
                            contentDescription = null,
                            tint = BrandPrimaryLight,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Resource Library",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Scripture Memory",
                            fontSize = 10.sp,
                            color = Slate400
                        )
                    }
                }
            }
        }
    }
}
