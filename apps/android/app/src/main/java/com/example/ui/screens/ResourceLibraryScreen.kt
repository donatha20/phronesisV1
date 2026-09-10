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
import com.example.data.SampleData
import com.example.model.*
import com.example.ui.components.SphereBadge
import com.example.ui.theme.*

@Composable
fun ResourceLibraryScreen(
    resources: List<ResourceItem>,
    scriptureCards: List<ScriptureCard>,
    onToggleMemorized: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedSphere by remember { mutableStateOf<LifeSphere?>(null) }
    var selectedTab by remember { mutableIntStateOf(0) } // 0 = Study Library, 1 = Scripture Memorizer
    var activeDetailItem by remember { mutableStateOf<ResourceItem?>(null) }

    val filteredResources = remember(selectedSphere, resources) {
        if (selectedSphere == null) resources else resources.filter { it.sphere == selectedSphere }
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
                text = "Spiritual Growth & Resource Library",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Curated discipleship guides, book summaries, & Scripture memory",
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
                    text = { Text("Study Resources (${resources.size})", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Scripture Memory (${scriptureCards.size})", fontWeight = FontWeight.Bold) }
                )
            }

            if (selectedTab == 0) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = selectedSphere == null,
                        onClick = { selectedSphere = null },
                        label = { Text("All Spheres", fontSize = 11.sp) }
                    )
                    LifeSphere.entries.forEach { sphere ->
                        SphereBadge(
                            sphere = sphere,
                            isSelected = selectedSphere == sphere,
                            onClick = {
                                selectedSphere = if (selectedSphere == sphere) null else sphere
                            }
                        )
                    }
                }
            }
        }

        if (selectedTab == 0) {
            // Study Resources List
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(top = 14.dp, bottom = 80.dp)
            ) {
                items(filteredResources, key = { it.id }) { item ->
                    ResourceCardItem(
                        resource = item,
                        onClick = { activeDetailItem = item }
                    )
                }
            }
        } else {
            // Scripture Memory Mode
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(top = 14.dp, bottom = 80.dp)
            ) {
                items(scriptureCards, key = { it.reference }) { card ->
                    ScriptureMemoryCard(
                        card = card,
                        onToggleMemorized = { onToggleMemorized(card.reference) }
                    )
                }
            }
        }
    }

    // Resource Detail Sheet Modal
    if (activeDetailItem != null) {
        val res = activeDetailItem!!
        AlertDialog(
            onDismissRequest = { activeDetailItem = null },
            title = {
                Column {
                    SphereBadge(sphere = res.sphere)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(res.title, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                    Text("By ${res.author}", fontSize = 12.sp, color = Slate500)
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 380.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (res.mentorRecommendationNote != null) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFFFEF3C7),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = BrandSecondary, modifier = Modifier.size(18.dp))
                                Column {
                                    Text("Mentor Note:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = BrandSecondaryDark)
                                    Text(res.mentorRecommendationNote, fontSize = 12.sp, color = Slate800)
                                }
                            }
                        }
                    }

                    Text("Executive Summary:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text(res.contentSummary, fontSize = 13.sp, color = Slate700, lineHeight = 18.sp)

                    Text("Key Biblical Takeaways:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    res.keyTakeaways.forEach { takeaway ->
                        Row(
                            verticalAlignment = Alignment.Top,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text("•", fontWeight = FontWeight.Bold, color = BrandPrimary)
                            Text(takeaway, fontSize = 12.sp, color = Slate700)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { activeDetailItem = null },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                ) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
fun ResourceCardItem(
    resource: ResourceItem,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
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
                SphereBadge(sphere = resource.sphere)
                if (resource.isRecommendedByMentor) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFFFEF3C7)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Default.Star, contentDescription = null, tint = BrandSecondary, modifier = Modifier.size(12.dp))
                            Text("Mentor Recommended", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = BrandSecondaryDark)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = resource.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Text(
                text = "Author: ${resource.author} • ${resource.readTimeMinutes} min study",
                fontSize = 12.sp,
                color = Slate500
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = resource.description,
                fontSize = 13.sp,
                color = Slate600,
                lineHeight = 18.sp,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "📖 ${resource.scriptureReference}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = resource.sphere.darkColor
                )

                TextButton(onClick = onClick) {
                    Text("Read Summary →", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = BrandPrimaryLight)
                }
            }
        }
    }
}

@Composable
fun ScriptureMemoryCard(
    card: ScriptureCard,
    onToggleMemorized: () -> Unit
) {
    var isHidden by remember { mutableStateOf(false) }

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
                SphereBadge(sphere = card.sphere)
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (card.memorized) Color(0xFFDCFCE7) else Slate100
                ) {
                    Text(
                        text = if (card.memorized) "Memorized 🎯" else "In Practice",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (card.memorized) Color(0xFF166534) else Slate600
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = card.reference,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Verse text box with hide/reveal for practice
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = if (isHidden) Slate200 else card.sphere.backgroundColor,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { isHidden = !isHidden }
            ) {
                Box(
                    modifier = Modifier.padding(14.dp),
                    contentAlignment = Alignment.Center
                ) {
                    if (isHidden) {
                        Text(
                            text = "🙈 Verse is Hidden. Tap to Reveal & Check Your Memory!",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate600
                        )
                    } else {
                        Text(
                            text = "“${card.text}”",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate900,
                            lineHeight = 20.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = { isHidden = !isHidden }) {
                    Icon(
                        imageVector = if (isHidden) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(if (isHidden) "Show Verse" else "Hide to Test", fontSize = 12.sp)
                }

                Button(
                    onClick = onToggleMemorized,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (card.memorized) Color(0xFF059669) else BrandPrimary
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(if (card.memorized) "Memorized" else "Mark Mastered", fontSize = 12.sp)
                }
            }
        }
    }
}
