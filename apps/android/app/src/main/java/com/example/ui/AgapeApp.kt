package com.example.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.SampleData
import com.example.model.*
import com.example.ui.components.UserRolePill
import com.example.ui.screens.*
import com.example.ui.theme.*

enum class AppNavDestination(
    val title: String,
    val icon: ImageVector
) {
    DASHBOARD("Home", Icons.Default.Home),
    DEVOTIONS("Devotions", Icons.Default.MenuBook),
    PODCASTS("Podcasts", Icons.Default.Podcasts),
    SPHERES("5 Spheres", Icons.Default.PieChart),
    SESSIONS("Sessions", Icons.Default.CalendarMonth),
    PRAYER_VAULT("Prayers", Icons.Default.Favorite)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AgapeApp() {
    var currentRole by remember { mutableStateOf(UserRole.YOUNG_BELIEVER_MENTEE) }
    var currentNavDestination by remember { mutableStateOf(AppNavDestination.DASHBOARD) }

    // Active session for live video call
    var activeCallSession by remember { mutableStateOf<DiscipleshipSession?>(null) }
    var isShowingSecurityScreen by remember { mutableStateOf(false) }
    var isShowingAiAssistant by remember { mutableStateOf(false) }

    // State data
    val mentorsList = remember { mutableStateListOf(*SampleData.allMentors.toTypedArray()) }
    var pairedMentor by remember { mutableStateOf(SampleData.mentorThomas) }
    val currentUser by remember { mutableStateOf(SampleData.menteeJoshua) }

    val goalsList = remember { mutableStateListOf(*SampleData.sampleGoals.toTypedArray()) }
    val sessionsList = remember { mutableStateListOf(*SampleData.sampleSessions.toTypedArray()) }
    val prayersList = remember { mutableStateListOf(*SampleData.samplePrayers.toTypedArray()) }
    val scriptureCardsList = remember { mutableStateListOf(*SampleData.sampleScriptureCards.toTypedArray()) }
    val resourcesList = remember { mutableStateListOf(*SampleData.sampleResources.toTypedArray()) }
    val devotionsList = remember { mutableStateListOf(*SampleData.sampleDevotions.toTypedArray()) }
    val podcastsList = remember { mutableStateListOf(*SampleData.samplePodcasts.toTypedArray()) }

    var securitySettings by remember { mutableStateOf(SecuritySettings()) }

    // If an active call is ongoing, display the Call Screen full screen
    if (activeCallSession != null) {
        MentorshipCallScreen(
            session = activeCallSession!!,
            currentUser = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) currentUser else pairedMentor,
            pairedPartner = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) pairedMentor else currentUser,
            onEndCall = { activeCallSession = null }
        )
        return
    }

    // If Security Screen is opened
    if (isShowingSecurityScreen) {
        SecurityMfaScreen(
            settings = securitySettings,
            onToggleBiometric = { securitySettings = securitySettings.copy(isBiometricEnabled = it) },
            onToggleE2E = { securitySettings = securitySettings.copy(isE2EEncryptionActive = it) },
            onToggleOfflineSync = { securitySettings = securitySettings.copy(isOfflineSyncEnabled = it) },
            onBack = { isShowingSecurityScreen = false }
        )
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(BrandSecondary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = "Phronesis Logo",
                                tint = PureWhite,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Phronesis",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Christian Mentorship & Wisdom",
                                fontSize = 10.sp,
                                color = BrandSecondaryDark,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                },
                actions = {
                    UserRolePill(
                        role = currentRole,
                        onSwitchRole = {
                            currentRole = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) {
                                UserRole.MENTOR_ELDER
                            } else {
                                UserRole.YOUNG_BELIEVER_MENTEE
                            }
                        }
                    )

                    IconButton(onClick = { isShowingSecurityScreen = true }) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = "Security Vault",
                            tint = if (securitySettings.isVaultUnlocked) Color(0xFF10B981) else Slate400
                        )
                    }

                    IconButton(onClick = { isShowingAiAssistant = true }) {
                        Icon(
                            imageVector = Icons.Default.Psychology,
                            contentDescription = "Spiritual Discernment AI",
                            tint = BrandSecondary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                AppNavDestination.entries.forEach { destination ->
                    val isSelected = currentNavDestination == destination
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { currentNavDestination = destination },
                        icon = {
                            Icon(
                                imageVector = destination.icon,
                                contentDescription = destination.title,
                                modifier = Modifier.size(22.dp)
                            )
                        },
                        label = {
                            Text(
                                text = destination.title,
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = BrandPrimary,
                            selectedTextColor = BrandPrimary,
                            indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                            unselectedIconColor = Slate400,
                            unselectedTextColor = Slate400
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (currentNavDestination) {
                AppNavDestination.DASHBOARD -> {
                    DashboardScreen(
                        currentRole = currentRole,
                        currentUser = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) currentUser else pairedMentor,
                        pairedMentor = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) pairedMentor else currentUser,
                        goals = goalsList,
                        sessions = sessionsList,
                        devotions = devotionsList,
                        podcasts = podcastsList,
                        onToggleMilestone = { goalId, milestoneId ->
                            val gIdx = goalsList.indexOfFirst { it.id == goalId }
                            if (gIdx >= 0) {
                                val g = goalsList[gIdx]
                                val updatedMilestones = g.milestones.map { m ->
                                    if (m.id == milestoneId) m.copy(isCompleted = !m.isCompleted) else m
                                }
                                val completedCount = updatedMilestones.count { it.isCompleted }
                                val percent = if (updatedMilestones.isNotEmpty()) ((completedCount.toFloat() / updatedMilestones.size) * 100).toInt() else 0
                                goalsList[gIdx] = g.copy(milestones = updatedMilestones, progressPercent = percent)
                            }
                        },
                        onStartCall = { session -> activeCallSession = session },
                        onNavigateToSpheres = { currentNavDestination = AppNavDestination.SPHERES },
                        onNavigateToSessions = { currentNavDestination = AppNavDestination.SESSIONS },
                        onNavigateToPrayers = { currentNavDestination = AppNavDestination.PRAYER_VAULT },
                        onNavigateToResources = { currentNavDestination = AppNavDestination.DEVOTIONS },
                        onNavigateToMentors = { currentNavDestination = AppNavDestination.DASHBOARD },
                        onNavigateToDevotions = { currentNavDestination = AppNavDestination.DEVOTIONS },
                        onNavigateToPodcasts = { currentNavDestination = AppNavDestination.PODCASTS },
                        onOpenSecurity = { isShowingSecurityScreen = true },
                        onOpenAiAssistant = { isShowingAiAssistant = true },
                        securitySettings = securitySettings
                    )
                }

                AppNavDestination.DEVOTIONS -> {
                    DailyDevotionsScreen(
                        devotions = devotionsList,
                        currentUser = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) currentUser else pairedMentor,
                        onAddDevotion = { newDevotion ->
                            devotionsList.add(0, newDevotion)
                        },
                        onToggleAmen = { devotionId ->
                            val dIdx = devotionsList.indexOfFirst { it.id == devotionId }
                            if (dIdx >= 0) {
                                val d = devotionsList[dIdx]
                                val newIsAmen = !d.isAmendedByCurrentUser
                                val newAmenCount = if (newIsAmen) d.amenCount + 1 else maxOf(0, d.amenCount - 1)
                                devotionsList[dIdx] = d.copy(isAmendedByCurrentUser = newIsAmen, amenCount = newAmenCount)
                            }
                        },
                        onAddComment = { devotionId, comment ->
                            val dIdx = devotionsList.indexOfFirst { it.id == devotionId }
                            if (dIdx >= 0) {
                                val d = devotionsList[dIdx]
                                devotionsList[dIdx] = d.copy(comments = d.comments + comment)
                            }
                        }
                    )
                }

                AppNavDestination.PODCASTS -> {
                    PodcastMediaHubScreen(
                        episodes = podcastsList,
                        currentUser = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) currentUser else pairedMentor,
                        onAddEpisode = { newEpisode ->
                            podcastsList.add(0, newEpisode)
                        },
                        onToggleLike = { podcastId ->
                            val pIdx = podcastsList.indexOfFirst { it.id == podcastId }
                            if (pIdx >= 0) {
                                val p = podcastsList[pIdx]
                                val newIsLiked = !p.hasLiked
                                val newLikes = if (newIsLiked) p.likesCount + 1 else maxOf(0, p.likesCount - 1)
                                podcastsList[pIdx] = p.copy(hasLiked = newIsLiked, likesCount = newLikes)
                            }
                        }
                    )
                }

                AppNavDestination.SPHERES -> {
                    SpheresGoalsScreen(
                        goals = goalsList,
                        onToggleMilestone = { goalId, milestoneId ->
                            val gIdx = goalsList.indexOfFirst { it.id == goalId }
                            if (gIdx >= 0) {
                                val g = goalsList[gIdx]
                                val updatedMilestones = g.milestones.map { m ->
                                    if (m.id == milestoneId) m.copy(isCompleted = !m.isCompleted) else m
                                }
                                val completedCount = updatedMilestones.count { it.isCompleted }
                                val percent = if (updatedMilestones.isNotEmpty()) ((completedCount.toFloat() / updatedMilestones.size) * 100).toInt() else 0
                                goalsList[gIdx] = g.copy(milestones = updatedMilestones, progressPercent = percent)
                            }
                        },
                        onAddGoal = { newGoal ->
                            goalsList.add(0, newGoal)
                        }
                    )
                }

                AppNavDestination.SESSIONS -> {
                    SessionsScreen(
                        sessions = sessionsList,
                        currentUser = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) currentUser else pairedMentor,
                        pairedMentor = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) pairedMentor else currentUser,
                        onStartCall = { session -> activeCallSession = session },
                        onAddSession = { newSession ->
                            sessionsList.add(0, newSession)
                        }
                    )
                }

                AppNavDestination.PRAYER_VAULT -> {
                    PrayerVaultScreen(
                        prayers = prayersList,
                        currentUser = if (currentRole == UserRole.YOUNG_BELIEVER_MENTEE) currentUser else pairedMentor,
                        isVaultUnlocked = securitySettings.isVaultUnlocked,
                        onUnlockVault = { securitySettings = securitySettings.copy(isVaultUnlocked = true) },
                        onAddPrayer = { newPrayer ->
                            prayersList.add(0, newPrayer)
                        },
                        onMarkAnswered = { prayerId, praiseText ->
                            val pIdx = prayersList.indexOfFirst { it.id == prayerId }
                            if (pIdx >= 0) {
                                val p = prayersList[pIdx]
                                prayersList[pIdx] = p.copy(isAnswered = true, praiseReport = praiseText)
                            }
                        },
                        onIncrementPrayerCount = { prayerId ->
                            val pIdx = prayersList.indexOfFirst { it.id == prayerId }
                            if (pIdx >= 0) {
                                val p = prayersList[pIdx]
                                prayersList[pIdx] = p.copy(prayerCount = p.prayerCount + 1)
                            }
                        }
                    )
                }
            }
        }
    }

    if (isShowingAiAssistant) {
        SpiritualAssistantDialog(
            onDismiss = { isShowingAiAssistant = false }
        )
    }
}
