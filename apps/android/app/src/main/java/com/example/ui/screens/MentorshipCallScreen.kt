package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.DiscipleshipSession
import com.example.model.LifeSphere
import com.example.model.UserProfile
import com.example.ui.components.SphereBadge
import com.example.ui.theme.*

enum class InCallTab {
    VIDEO_STAGE,
    SHARED_SCRIPTURE,
    PRAYER_SCRATCHPAD,
    MEETING_MINUTES,
    GUIDED_PROMPTS
}

@Composable
fun MentorshipCallScreen(
    session: DiscipleshipSession,
    currentUser: UserProfile,
    pairedPartner: UserProfile,
    onEndCall: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isMuted by remember { mutableStateOf(false) }
    var isVideoOff by remember { mutableStateOf(false) }
    var isSpeakerOn by remember { mutableStateOf(true) }
    var activeTab by remember { mutableStateOf(InCallTab.VIDEO_STAGE) }

    // In-call state
    var callSeconds by remember { mutableIntStateOf(184) } // Simulated ongoing 3m 4s
    val formattedTime = remember(callSeconds) {
        val mins = callSeconds / 60
        val secs = callSeconds % 60
        String.format("%02d:%02d", mins, secs)
    }

    var liveNotes by remember {
        mutableStateOf("Elder Thomas advised setting aside 15 minutes of silence before Bible study. Action item: Memorize Colossians 3:23.")
    }

    val livePrayerPoints = remember {
        mutableStateListOf(
            "Wisdom for job offer negotiation and alignment with God's will",
            "Patience with family conversations this upcoming weekend",
            "Elder Thomas's granddaughter's upcoming baptism"
        )
    }
    var newPrayerInput by remember { mutableStateOf("") }

    val discussionPrompts = listOf(
        "Where did you sense the Holy Spirit's conviction or comfort most clearly this past week?",
        "What is currently competing with God for your attention or affections?",
        "How is your secret-place prayer life—are you talking to God, or just fulfilling a routine?",
        "In your finances, career, or relationships, what step of faith is God inviting you to take?",
        "What specific temptation or anxiety can we bring into the light and pray over together right now?"
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate900)
    ) {
        // Top In-Call Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF10B981))
                )
                Column {
                    Text(
                        text = "Live Discipleship Room",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PureWhite
                    )
                    Text(
                        text = "Encrypted Peer-to-Peer • $formattedTime",
                        fontSize = 11.sp,
                        color = Slate400
                    )
                }
            }

            SphereBadge(sphere = session.sphereFocus)
        }

        // In-Call Tab Switcher
        ScrollableTabRow(
            selectedTabIndex = activeTab.ordinal,
            containerColor = Slate800,
            contentColor = PureWhite,
            edgePadding = 12.dp
        ) {
            Tab(
                selected = activeTab == InCallTab.VIDEO_STAGE,
                onClick = { activeTab = InCallTab.VIDEO_STAGE },
                text = { Text("Video Stage", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
            )
            Tab(
                selected = activeTab == InCallTab.SHARED_SCRIPTURE,
                onClick = { activeTab = InCallTab.SHARED_SCRIPTURE },
                text = { Text("Shared Scripture", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
            )
            Tab(
                selected = activeTab == InCallTab.PRAYER_SCRATCHPAD,
                onClick = { activeTab = InCallTab.PRAYER_SCRATCHPAD },
                text = { Text("Prayer (${livePrayerPoints.size})", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
            )
            Tab(
                selected = activeTab == InCallTab.GUIDED_PROMPTS,
                onClick = { activeTab = InCallTab.GUIDED_PROMPTS },
                text = { Text("Biblical Prompts", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
            )
            Tab(
                selected = activeTab == InCallTab.MEETING_MINUTES,
                onClick = { activeTab = InCallTab.MEETING_MINUTES },
                text = { Text("Session Minutes", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
            )
        }

        // Main In-Call Body
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            when (activeTab) {
                InCallTab.VIDEO_STAGE -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Partner's Video (Large)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1.3f)
                                .clip(RoundedCornerShape(16.dp))
                                .background(
                                    Brush.verticalGradient(
                                        listOf(Color(0xFF1E293B), Color(0xFF0F172A))
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(80.dp)
                                        .clip(CircleShape)
                                        .background(BrandSecondary),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = pairedPartner.avatarInitial,
                                        fontSize = 36.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PureWhite
                                    )
                                }
                                Text(
                                    text = pairedPartner.name,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PureWhite
                                )
                                Text(
                                    text = "Speaking • Audio HD Connected",
                                    fontSize = 12.sp,
                                    color = Color(0xFF34D399)
                                )
                            }

                            // Watermark / Scripture ticker
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0x66000000),
                                modifier = Modifier
                                    .align(Alignment.BottomCenter)
                                    .padding(8.dp)
                            ) {
                                Text(
                                    text = "📖 ${session.scriptureFocus}",
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                    fontSize = 11.sp,
                                    color = PureWhite
                                )
                            }
                        }

                        // Self Video (Small preview)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(0.7f)
                                .clip(RoundedCornerShape(14.dp))
                                .background(Color(0xFF334155)),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isVideoOff) {
                                Text(
                                    text = "Camera is Paused",
                                    fontSize = 13.sp,
                                    color = Slate400
                                )
                            } else {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .clip(CircleShape)
                                            .background(BrandPrimaryLight),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = currentUser.avatarInitial,
                                            fontSize = 20.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = PureWhite
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "You (${currentUser.name})",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = PureWhite
                                    )
                                }
                            }
                        }
                    }
                }

                InCallTab.SHARED_SCRIPTURE -> {
                    Card(
                        modifier = Modifier.fillMaxSize(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate800)
                    ) {
                        Column(
                            modifier = Modifier
                                .padding(16.dp)
                                .fillMaxSize()
                        ) {
                            Text(
                                text = "Shared Bible Passage: James 1:2-8 (NIV)",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            LazyColumn(modifier = Modifier.weight(1f)) {
                                item {
                                    Text(
                                        text = "2 Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, 3 because you know that the testing of your faith produces perseverance.\n\n4 Let perseverance finish its work so that you may be mature and complete, not lacking anything.\n\n5 If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.\n\n6 But when you ask, you must believe and not doubt, because the one who doubts is like a wave of the sea, blown and tossed by the wind.",
                                        fontSize = 14.sp,
                                        color = Slate200,
                                        lineHeight = 22.sp
                                    )
                                }
                            }
                        }
                    }
                }

                InCallTab.PRAYER_SCRATCHPAD -> {
                    Card(
                        modifier = Modifier.fillMaxSize(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate800)
                    ) {
                        Column(
                            modifier = Modifier
                                .padding(16.dp)
                                .fillMaxSize()
                        ) {
                            Text(
                                text = "Live Intercessory Prayer Points",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            LazyColumn(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                items(livePrayerPoints) { point ->
                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = Slate700,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(10.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Favorite,
                                                contentDescription = null,
                                                tint = Color(0xFFFDA4AF),
                                                modifier = Modifier.size(16.dp)
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = point,
                                                fontSize = 13.sp,
                                                color = PureWhite,
                                                modifier = Modifier.weight(1f)
                                            )
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedTextField(
                                    value = newPrayerInput,
                                    onValueChange = { newPrayerInput = it },
                                    placeholder = { Text("Add prayer request...", color = Slate400) },
                                    modifier = Modifier.weight(1f),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedTextColor = PureWhite,
                                        unfocusedTextColor = PureWhite,
                                        focusedBorderColor = BrandPrimaryLight,
                                        unfocusedBorderColor = Slate600
                                    )
                                )
                                Button(
                                    onClick = {
                                        if (newPrayerInput.isNotBlank()) {
                                            livePrayerPoints.add(newPrayerInput)
                                            newPrayerInput = ""
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimaryLight)
                                ) {
                                    Text("Add")
                                }
                            }
                        }
                    }
                }

                InCallTab.GUIDED_PROMPTS -> {
                    Card(
                        modifier = Modifier.fillMaxSize(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate800)
                    ) {
                        Column(
                            modifier = Modifier
                                .padding(16.dp)
                                .fillMaxSize()
                        ) {
                            Text(
                                text = "Biblical Spiritual Discipleship Prompts",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite
                            )
                            Text(
                                text = "Use these questions to foster deep vulnerability & gospel clarity",
                                fontSize = 11.sp,
                                color = Slate400
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                items(discussionPrompts) { prompt ->
                                    Card(
                                        shape = RoundedCornerShape(12.dp),
                                        colors = CardDefaults.cardColors(containerColor = Slate700)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            verticalAlignment = Alignment.Top,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.HelpOutline,
                                                contentDescription = null,
                                                tint = BrandSecondaryLight,
                                                modifier = Modifier.size(18.dp)
                                            )
                                            Text(
                                                text = prompt,
                                                fontSize = 13.sp,
                                                color = PureWhite,
                                                lineHeight = 18.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                InCallTab.MEETING_MINUTES -> {
                    Card(
                        modifier = Modifier.fillMaxSize(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate800)
                    ) {
                        Column(
                            modifier = Modifier
                                .padding(16.dp)
                                .fillMaxSize()
                        ) {
                            Text(
                                text = "Session Notes & Action Items",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = PureWhite
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = liveNotes,
                                onValueChange = { liveNotes = it },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = PureWhite,
                                    unfocusedTextColor = PureWhite,
                                    focusedBorderColor = BrandPrimaryLight,
                                    unfocusedBorderColor = Slate600
                                )
                            )
                        }
                    }
                }
            }
        }

        // Bottom Call Controls Bar (Mute, Camera Toggle, End Call, Speaker)
        Surface(
            color = Slate800,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Mute
                IconButton(
                    onClick = { isMuted = !isMuted },
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(if (isMuted) Color(0xFFEF4444) else Slate700)
                ) {
                    Icon(
                        imageVector = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                        contentDescription = "Mute",
                        tint = PureWhite
                    )
                }

                // Video toggle
                IconButton(
                    onClick = { isVideoOff = !isVideoOff },
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(if (isVideoOff) Color(0xFFEF4444) else Slate700)
                ) {
                    Icon(
                        imageVector = if (isVideoOff) Icons.Default.VideocamOff else Icons.Default.Videocam,
                        contentDescription = "Video",
                        tint = PureWhite
                    )
                }

                // Speaker toggle
                IconButton(
                    onClick = { isSpeakerOn = !isSpeakerOn },
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(if (isSpeakerOn) BrandPrimaryLight else Slate700)
                ) {
                    Icon(
                        imageVector = if (isSpeakerOn) Icons.Default.VolumeUp else Icons.Default.VolumeOff,
                        contentDescription = "Speaker",
                        tint = PureWhite
                    )
                }

                // End Call Button
                IconButton(
                    onClick = onEndCall,
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFDC2626))
                ) {
                    Icon(
                        imageVector = Icons.Default.CallEnd,
                        contentDescription = "End Call",
                        tint = PureWhite,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }
    }
}
