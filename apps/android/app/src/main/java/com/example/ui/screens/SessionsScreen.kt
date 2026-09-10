package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.*
import com.example.ui.components.SphereBadge
import com.example.ui.theme.*
import com.example.util.ExternalAppHelper

@Composable
fun SessionsScreen(
    sessions: List<DiscipleshipSession>,
    currentUser: UserProfile,
    pairedMentor: UserProfile,
    onStartCall: (DiscipleshipSession) -> Unit,
    onAddSession: (DiscipleshipSession) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableIntStateOf(0) }
    var showScheduleDialog by remember { mutableStateOf(false) }

    val upcomingSessions = sessions.filter { it.status == SessionStatus.UPCOMING }
    val completedSessions = sessions.filter { it.status == SessionStatus.COMPLETED }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showScheduleDialog = true },
                containerColor = BrandPrimary,
                contentColor = PureWhite,
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("Schedule Session", fontWeight = FontWeight.Bold) }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Header
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Text(
                    text = "Discipleship Sessions & Meetings",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Structured spiritual mentorship & automated reminders",
                    fontSize = 12.sp,
                    color = Slate500
                )

                Spacer(modifier = Modifier.height(12.dp))

                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = BrandPrimary
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = { Text("Upcoming (${upcomingSessions.size})", fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("Past Logs (${completedSessions.size})", fontWeight = FontWeight.Bold) }
                    )
                }
            }

            // Sessions List
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(top = 14.dp, bottom = 80.dp)
            ) {
                val listToShow = if (selectedTab == 0) upcomingSessions else completedSessions

                if (listToShow.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 40.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (selectedTab == 0) "No upcoming sessions. Tap + to schedule one!" else "No past session logs found.",
                                fontSize = 14.sp,
                                color = Slate400
                            )
                        }
                    }
                }

                items(listToShow, key = { it.id }) { session ->
                    DiscipleshipSessionCard(
                        session = session,
                        pairedPartner = pairedMentor,
                        currentUser = currentUser,
                        onJoinCall = { onStartCall(session) }
                    )
                }
            }
        }
    }

    if (showScheduleDialog) {
        ScheduleSessionDialog(
            mentor = pairedMentor,
            mentee = currentUser,
            onDismiss = { showScheduleDialog = false },
            onConfirm = { newSession ->
                onAddSession(newSession)
                showScheduleDialog = false
            }
        )
    }
}

@Composable
fun DiscipleshipSessionCard(
    session: DiscipleshipSession,
    pairedPartner: UserProfile,
    currentUser: UserProfile,
    onJoinCall: () -> Unit
) {
    val context = LocalContext.current

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
                SphereBadge(sphere = session.sphereFocus)
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (session.status == SessionStatus.UPCOMING) Color(0xFFDCFCE7) else Slate100
                ) {
                    Text(
                        text = if (session.status == SessionStatus.UPCOMING) "Active Upcoming" else "Completed",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (session.status == SessionStatus.UPCOMING) Color(0xFF166534) else Slate600
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = session.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Schedule,
                    contentDescription = null,
                    tint = BrandSecondary,
                    modifier = Modifier.size(15.dp)
                )
                Text(
                    text = "${session.scheduledDateTime} • ${session.durationMinutes} Minutes",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = BrandSecondaryDark
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Scripture Focus
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = session.sphereFocus.backgroundColor,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "📖 Focus: ${session.scriptureFocus}",
                    modifier = Modifier.padding(8.dp),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = session.sphereFocus.darkColor
                )
            }

            if (session.agenda.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "Session Agenda & Discussion Points:",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    session.agenda.forEach { item ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(5.dp)
                                    .clip(CircleShape)
                                    .background(BrandPrimaryLight)
                            )
                            Text(
                                text = item,
                                fontSize = 12.sp,
                                color = Slate600
                            )
                        }
                    }
                }
            }

            if (session.sessionNotes.isNotBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Slate100,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "Pastoral Notes & Minutes:",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate700
                        )
                        Text(
                            text = session.sessionNotes,
                            fontSize = 12.sp,
                            color = Slate800
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons
            if (session.status == SessionStatus.UPCOMING) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onJoinCall,
                        modifier = Modifier.weight(1.2f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                    ) {
                        Icon(Icons.Default.Videocam, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Join Call", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    // WhatsApp Quick Message
                    IconButton(
                        onClick = {
                            ExternalAppHelper.openWhatsApp(
                                context = context,
                                phoneNumber = pairedPartner.whatsappNumber,
                                message = "Hi ${pairedPartner.name}! Reminder for our AgapeLink session: '${session.title}' scheduled for ${session.scheduledDateTime}. Scripture Focus: ${session.scriptureFocus}"
                            )
                        },
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFF25D366))
                            .size(40.dp)
                    ) {
                        Icon(Icons.Default.Chat, contentDescription = "WhatsApp", tint = PureWhite, modifier = Modifier.size(18.dp))
                    }

                    // Telegram Quick Message
                    IconButton(
                        onClick = {
                            ExternalAppHelper.openTelegram(
                                context = context,
                                username = pairedPartner.telegramUsername,
                                message = "Discipleship Session Reminder: ${session.title} on ${session.scheduledDateTime}"
                            )
                        },
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFF0088CC))
                            .size(40.dp)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Telegram", tint = PureWhite, modifier = Modifier.size(18.dp))
                    }

                    // Calendar Sync
                    IconButton(
                        onClick = {
                            ExternalAppHelper.addToCalendar(
                                context = context,
                                title = session.title,
                                description = "Mentorship Session with ${pairedPartner.name}. Focus: ${session.scriptureFocus}\nAgenda: ${session.agenda.joinToString("; ")}"
                            )
                        },
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .size(40.dp)
                    ) {
                        Icon(Icons.Default.Event, contentDescription = "Add to Calendar", tint = MaterialTheme.colorScheme.onSurface, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun ScheduleSessionDialog(
    mentor: UserProfile,
    mentee: UserProfile,
    onDismiss: () -> Unit,
    onConfirm: (DiscipleshipSession) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var sphere by remember { mutableStateOf(LifeSphere.PERSONAL_GROWTH) }
    var dateTime by remember { mutableStateOf("This Thursday, 7:00 PM EST") }
    var durationMinutes by remember { mutableIntStateOf(45) }
    var scripture by remember { mutableStateOf("Romans 8:1-2") }
    var agendaPoint1 by remember { mutableStateOf("Review daily devotional consistency") }
    var agendaPoint2 by remember { mutableStateOf("Pray over life sphere goals") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Schedule Mentorship Session", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 420.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Session Topic") },
                    placeholder = { Text("e.g. Life in the Spirit & Stewardship") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Life Sphere Focus:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    LifeSphere.entries.take(3).forEach { s ->
                        SphereBadge(
                            sphere = s,
                            isSelected = sphere == s,
                            onClick = { sphere = s }
                        )
                    }
                }

                OutlinedTextField(
                    value = dateTime,
                    onValueChange = { dateTime = it },
                    label = { Text("Date & Time") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = scripture,
                    onValueChange = { scripture = it },
                    label = { Text("Scripture Focus") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = agendaPoint1,
                    onValueChange = { agendaPoint1 = it },
                    label = { Text("Agenda Point 1") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = agendaPoint2,
                    onValueChange = { agendaPoint2 = it },
                    label = { Text("Agenda Point 2") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val newSession = DiscipleshipSession(
                        id = "session_${System.currentTimeMillis()}",
                        title = title.ifBlank { "Spiritual Mentorship Session" },
                        mentorId = mentor.id,
                        mentorName = mentor.name,
                        menteeId = mentee.id,
                        menteeName = mentee.name,
                        scheduledDateTime = dateTime,
                        durationMinutes = durationMinutes,
                        sphereFocus = sphere,
                        scriptureFocus = scripture,
                        agenda = listOf(agendaPoint1, agendaPoint2).filter { it.isNotBlank() },
                        platform = SessionPlatform.IN_APP_VIDEO,
                        status = SessionStatus.UPCOMING
                    )
                    onConfirm(newSession)
                },
                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
            ) {
                Text("Confirm Schedule", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
