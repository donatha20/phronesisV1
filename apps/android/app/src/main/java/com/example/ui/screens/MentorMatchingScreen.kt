package com.example.ui.screens

import androidx.compose.foundation.background
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
import com.example.model.LifeSphere
import com.example.model.UserProfile
import com.example.ui.components.SphereBadge
import com.example.ui.theme.*
import com.example.util.ExternalAppHelper

@Composable
fun MentorMatchingScreen(
    mentors: List<UserProfile>,
    currentPairedMentorId: String,
    onSelectMentor: (UserProfile) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var selectedSphereFilter by remember { mutableStateOf<LifeSphere?>(null) }
    var selectedProfileForDetail by remember { mutableStateOf<UserProfile?>(null) }

    val filteredMentors = remember(selectedSphereFilter, mentors) {
        if (selectedSphereFilter == null) mentors else mentors.filter { it.primarySpheres.contains(selectedSphereFilter) }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Text(
                text = "Elders & Mentors Directory",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Connecting young believers with seasoned senior saints (Titus 2)",
                fontSize = 12.sp,
                color = Slate500
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                LifeSphere.entries.forEach { sphere ->
                    SphereBadge(
                        sphere = sphere,
                        isSelected = selectedSphereFilter == sphere,
                        onClick = {
                            selectedSphereFilter = if (selectedSphereFilter == sphere) null else sphere
                        }
                    )
                }
            }
        }

        // Mentor Cards List
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(top = 14.dp, bottom = 80.dp)
        ) {
            items(filteredMentors, key = { it.id }) { mentor ->
                val isCurrentlyPaired = mentor.id == currentPairedMentorId
                MentorCardItem(
                    mentor = mentor,
                    isPaired = isCurrentlyPaired,
                    onSelect = { onSelectMentor(mentor) },
                    onViewDetail = { selectedProfileForDetail = mentor }
                )
            }
        }
    }

    if (selectedProfileForDetail != null) {
        val m = selectedProfileForDetail!!
        AlertDialog(
            onDismissRequest = { selectedProfileForDetail = null },
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(BrandSecondary),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(m.avatarInitial, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = PureWhite)
                    }
                    Column {
                        Text(m.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("${m.yearsInFaith} Years Walking with Jesus", fontSize = 12.sp, color = BrandSecondaryDark)
                    }
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 380.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("About & Ministry Testimony:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text(m.bio, fontSize = 13.sp, color = Slate700, lineHeight = 18.sp)

                    Text("Spiritual Gifts & Callings:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        m.spiritualGifts.forEach { gift ->
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Slate100
                            ) {
                                Text(gift, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp), fontSize = 11.sp, color = Slate700)
                            }
                        }
                    }

                    Text("Church & Community:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text("⛪ ${m.churchCommunity} • ${m.location}", fontSize = 12.sp, color = Slate700)

                    Text("Favorite Life Scripture:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text("📖 ${m.favoriteScripture}", fontSize = 12.sp, color = BrandPrimary, fontWeight = FontWeight.Medium)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onSelectMentor(m)
                        selectedProfileForDetail = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                ) {
                    Text("Pair as Primary Mentor")
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedProfileForDetail = null }) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
fun MentorCardItem(
    mentor: UserProfile,
    isPaired: Boolean,
    onSelect: () -> Unit,
    onViewDetail: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(BrandSecondary),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = mentor.avatarInitial,
                        fontSize = 24.sp,
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
                            text = mentor.name,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (mentor.isVerifiedElder) {
                            Icon(
                                imageVector = Icons.Default.Verified,
                                contentDescription = "Verified Elder",
                                tint = BrandPrimaryLight,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    Text(
                        text = mentor.title,
                        fontSize = 12.sp,
                        color = Slate500
                    )

                    Text(
                        text = "⛪ ${mentor.churchCommunity} • ${mentor.yearsInFaith} yrs in faith",
                        fontSize = 11.sp,
                        color = Slate400
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = mentor.bio,
                fontSize = 13.sp,
                color = Slate600,
                lineHeight = 18.sp,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Primary Spheres Badges
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                mentor.primarySpheres.forEach { sphere ->
                    SphereBadge(sphere = sphere)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = onViewDetail) {
                    Text("View Full Testimony", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = BrandPrimaryLight)
                }

                if (isPaired) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFFDCFCE7)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF166534), modifier = Modifier.size(14.dp))
                            Text("Active Partner", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF166534))
                        }
                    }
                } else {
                    Button(
                        onClick = onSelect,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                    ) {
                        Text("Connect", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
