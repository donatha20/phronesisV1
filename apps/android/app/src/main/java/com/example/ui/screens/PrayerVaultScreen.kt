package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.*
import com.example.ui.components.SphereBadge
import com.example.ui.theme.*

@Composable
fun PrayerVaultScreen(
    prayers: List<PrayerRequest>,
    currentUser: UserProfile,
    isVaultUnlocked: Boolean,
    onUnlockVault: () -> Unit,
    onAddPrayer: (PrayerRequest) -> Unit,
    onMarkAnswered: (String, String) -> Unit,
    onIncrementPrayerCount: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedPrivacy by remember { mutableStateOf<PrayerPrivacyLevel?>(null) }
    var showAddDialog by remember { mutableStateOf(false) }
    var showPraiseDialogForId by remember { mutableStateOf<String?>(null) }

    val filteredPrayers = remember(selectedPrivacy, prayers) {
        if (selectedPrivacy == null) prayers else prayers.filter { it.privacyLevel == selectedPrivacy }
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = BrandPrimary,
                contentColor = PureWhite,
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("New Prayer / Praise", fontWeight = FontWeight.Bold) }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Header & Security Pill
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Encrypted Prayer Vault",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "AES-256 Confidential Intercession & Praise Journal",
                            fontSize = 12.sp,
                            color = Slate500
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isVaultUnlocked) Color(0xFFDCFCE7) else Color(0xFFFEE2E2),
                        modifier = Modifier.clickable { if (!isVaultUnlocked) onUnlockVault() }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = if (isVaultUnlocked) Icons.Default.LockOpen else Icons.Default.Lock,
                                contentDescription = null,
                                tint = if (isVaultUnlocked) Color(0xFF166534) else Color(0xFF991B1B),
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = if (isVaultUnlocked) "Unlocked" else "Tap to Unlock",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isVaultUnlocked) Color(0xFF166534) else Color(0xFF991B1B)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Privacy Filters
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = selectedPrivacy == null,
                        onClick = { selectedPrivacy = null },
                        label = { Text("All Prayers (${prayers.size})", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                    )
                    FilterChip(
                        selected = selectedPrivacy == PrayerPrivacyLevel.CONFIDENTIAL_MENTOR_PAIR_ONLY,
                        onClick = {
                            selectedPrivacy = if (selectedPrivacy == PrayerPrivacyLevel.CONFIDENTIAL_MENTOR_PAIR_ONLY) null else PrayerPrivacyLevel.CONFIDENTIAL_MENTOR_PAIR_ONLY
                        },
                        label = { Text("👥 Mentor Confidential", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                    )
                    FilterChip(
                        selected = selectedPrivacy == PrayerPrivacyLevel.ENCRYPTED_PRIVATE_WITH_GOD,
                        onClick = {
                            selectedPrivacy = if (selectedPrivacy == PrayerPrivacyLevel.ENCRYPTED_PRIVATE_WITH_GOD) null else PrayerPrivacyLevel.ENCRYPTED_PRIVATE_WITH_GOD
                        },
                        label = { Text("🔒 Private with God", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                    )
                    FilterChip(
                        selected = selectedPrivacy == PrayerPrivacyLevel.CHURCH_FELLOWSHIP_CIRCLE,
                        onClick = {
                            selectedPrivacy = if (selectedPrivacy == PrayerPrivacyLevel.CHURCH_FELLOWSHIP_CIRCLE) null else PrayerPrivacyLevel.CHURCH_FELLOWSHIP_CIRCLE
                        },
                        label = { Text("🌐 Fellowship Circle", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                    )
                }
            }

            // List of Prayers
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(top = 14.dp, bottom = 80.dp)
            ) {
                items(filteredPrayers, key = { it.id }) { prayer ->
                    PrayerCardItem(
                        prayer = prayer,
                        onMarkAnswered = { showPraiseDialogForId = prayer.id },
                        onPray = { onIncrementPrayerCount(prayer.id) }
                    )
                }
            }
        }
    }

    // Add Prayer Dialog
    if (showAddDialog) {
        AddPrayerDialog(
            currentUser = currentUser,
            onDismiss = { showAddDialog = false },
            onConfirm = { newReq ->
                onAddPrayer(newReq)
                showAddDialog = false
            }
        )
    }

    // Praise Report Dialog
    if (showPraiseDialogForId != null) {
        val prayerId = showPraiseDialogForId!!
        var praiseText by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showPraiseDialogForId = null },
            title = { Text("Celebrate Answered Prayer 🎉", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Give glory to God! How did the Lord answer this prayer?", fontSize = 13.sp, color = Slate600)
                    OutlinedTextField(
                        value = praiseText,
                        onValueChange = { praiseText = it },
                        placeholder = { Text("Praise report details...") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onMarkAnswered(prayerId, praiseText.ifBlank { "Answered by the grace of God!" })
                        showPraiseDialogForId = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669))
                ) {
                    Text("Publish Praise Report", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showPraiseDialogForId = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun PrayerCardItem(
    prayer: PrayerRequest,
    onMarkAnswered: () -> Unit,
    onPray: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (prayer.isAnswered) Color(0xFFF0FDF4) else MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                SphereBadge(sphere = prayer.sphere)

                val privacyBadgeText = when (prayer.privacyLevel) {
                    PrayerPrivacyLevel.ENCRYPTED_PRIVATE_WITH_GOD -> "🔒 Encrypted Private"
                    PrayerPrivacyLevel.CONFIDENTIAL_MENTOR_PAIR_ONLY -> "👥 Mentor Confidential"
                    PrayerPrivacyLevel.CHURCH_FELLOWSHIP_CIRCLE -> "🌐 Church Circle"
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Slate100
                ) {
                    Text(
                        text = privacyBadgeText,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate700
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = prayer.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = prayer.description,
                fontSize = 13.sp,
                color = Slate600,
                lineHeight = 18.sp
            )

            if (prayer.scripturePromise != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = prayer.sphere.backgroundColor,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "📖 Promise: ${prayer.scripturePromise}",
                        modifier = Modifier.padding(8.dp),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = prayer.sphere.darkColor
                    )
                }
            }

            // If Answered: Praise Report Callout
            if (prayer.isAnswered && prayer.praiseReport != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFDCFCE7),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF166534),
                            modifier = Modifier.size(18.dp)
                        )
                        Column {
                            Text(
                                text = "Answered Prayer & Praise Report:",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF166534)
                            )
                            Text(
                                text = prayer.praiseReport,
                                fontSize = 12.sp,
                                color = Slate800
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Created ${prayer.dateCreated} by ${prayer.authorName}",
                    fontSize = 11.sp,
                    color = Slate400
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (!prayer.isAnswered) {
                        OutlinedButton(
                            onClick = onMarkAnswered,
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text("Mark Answered", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = onPray,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimaryLight),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Default.Favorite, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Prayed (${prayer.prayerCount})", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun AddPrayerDialog(
    currentUser: UserProfile,
    onDismiss: () -> Unit,
    onConfirm: (PrayerRequest) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var sphere by remember { mutableStateOf(LifeSphere.PERSONAL_GROWTH) }
    var privacy by remember { mutableStateOf(PrayerPrivacyLevel.CONFIDENTIAL_MENTOR_PAIR_ONLY) }
    var scripturePromise by remember { mutableStateOf("Philippians 4:6-7") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Log Prayer Request", fontWeight = FontWeight.Bold) },
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
                    label = { Text("Prayer Request Title") },
                    placeholder = { Text("e.g. Guidance on Career Decision") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Life Sphere Category:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    LifeSphere.entries.forEach { s ->
                        SphereBadge(
                            sphere = s,
                            isSelected = sphere == s,
                            onClick = { sphere = s }
                        )
                    }
                }

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Heart Cry & Details") },
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Confidentiality & Encryption Level:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    FilterChip(
                        selected = privacy == PrayerPrivacyLevel.CONFIDENTIAL_MENTOR_PAIR_ONLY,
                        onClick = { privacy = PrayerPrivacyLevel.CONFIDENTIAL_MENTOR_PAIR_ONLY },
                        label = { Text("👥 Mentor Only", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = privacy == PrayerPrivacyLevel.ENCRYPTED_PRIVATE_WITH_GOD,
                        onClick = { privacy = PrayerPrivacyLevel.ENCRYPTED_PRIVATE_WITH_GOD },
                        label = { Text("🔒 Private with God", fontSize = 11.sp) }
                    )
                }

                OutlinedTextField(
                    value = scripturePromise,
                    onValueChange = { scripturePromise = it },
                    label = { Text("Scripture Promise to Stand On") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank()) {
                        val req = PrayerRequest(
                            id = "prayer_${System.currentTimeMillis()}",
                            title = title,
                            description = description,
                            sphere = sphere,
                            authorId = currentUser.id,
                            authorName = currentUser.name,
                            authorRole = currentUser.role,
                            dateCreated = "Today",
                            privacyLevel = privacy,
                            isAnswered = false,
                            praiseReport = null,
                            prayerCount = 1,
                            scripturePromise = scripturePromise.ifBlank { null }
                        )
                        onConfirm(req)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
            ) {
                Text("Save Prayer", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
