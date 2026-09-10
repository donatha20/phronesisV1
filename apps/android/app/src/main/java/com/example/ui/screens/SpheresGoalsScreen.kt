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
fun SpheresGoalsScreen(
    goals: List<GoalItem>,
    onToggleMilestone: (goalId: String, milestoneId: String) -> Unit,
    onAddGoal: (GoalItem) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedSphere by remember { mutableStateOf<LifeSphere?>(null) }
    var showAddGoalDialog by remember { mutableStateOf(false) }

    val filteredGoals = remember(selectedSphere, goals) {
        if (selectedSphere == null) goals else goals.filter { it.sphere == selectedSphere }
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showAddGoalDialog = true },
                containerColor = BrandPrimary,
                contentColor = PureWhite,
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("New Life Goal", fontWeight = FontWeight.Bold) }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Header & Sphere Filters
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Text(
                    text = "5 Life Spheres & Goal Tracker",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Aligning all of life under the Lordship of Jesus Christ",
                    fontSize = 12.sp,
                    color = Slate500
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Horizontal scrollable sphere selector chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = selectedSphere == null,
                        onClick = { selectedSphere = null },
                        label = { Text("All Spheres (${goals.size})", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = BrandPrimary,
                            selectedLabelColor = PureWhite
                        )
                    )

                    LifeSphere.entries.forEach { sphere ->
                        val count = goals.count { it.sphere == sphere }
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

            // Sphere Info Banner when a sphere is selected
            if (selectedSphere != null) {
                val sphere = selectedSphere!!
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = sphere.backgroundColor)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(sphere.icon, contentDescription = null, tint = sphere.darkColor, modifier = Modifier.size(18.dp))
                            Text(sphere.biblicalTheme, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = sphere.darkColor)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "“${sphere.scriptureText}” — ${sphere.scriptureReference}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate800
                        )
                    }
                }
            }

            // Goals List
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(top = 8.dp, bottom = 80.dp)
            ) {
                items(filteredGoals, key = { it.id }) { goal ->
                    GoalCardItem(
                        goal = goal,
                        onToggleMilestone = { mId -> onToggleMilestone(goal.id, mId) }
                    )
                }
            }
        }
    }

    if (showAddGoalDialog) {
        AddGoalDialog(
            initialSphere = selectedSphere ?: LifeSphere.PERSONAL_GROWTH,
            onDismiss = { showAddGoalDialog = false },
            onConfirm = { newGoal ->
                onAddGoal(newGoal)
                showAddGoalDialog = false
            }
        )
    }
}

@Composable
fun GoalCardItem(
    goal: GoalItem,
    onToggleMilestone: (String) -> Unit
) {
    var expandedMilestones by remember { mutableStateOf(true) }
    val completedCount = goal.milestones.count { it.isCompleted }
    val totalCount = goal.milestones.size
    val progress = if (totalCount > 0) completedCount.toFloat() / totalCount else 0f

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                SphereBadge(sphere = goal.sphere)
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (goal.mentorApproved) Color(0xFFDCFCE7) else Color(0xFFFEF3C7)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = if (goal.mentorApproved) Icons.Default.CheckCircle else Icons.Default.Schedule,
                            contentDescription = null,
                            tint = if (goal.mentorApproved) Color(0xFF166534) else Color(0xFF92400E),
                            modifier = Modifier.size(12.dp)
                        )
                        Text(
                            text = if (goal.mentorApproved) "Mentor Approved" else "In Review",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (goal.mentorApproved) Color(0xFF166534) else Color(0xFF92400E)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = goal.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = goal.description,
                fontSize = 13.sp,
                color = Slate600,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Scripture Anchor Pill
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = goal.sphere.backgroundColor,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "📖 ${goal.scriptureAnchor}",
                    modifier = Modifier.padding(8.dp),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = goal.sphere.darkColor
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Progress Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Milestones: $completedCount of $totalCount done",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Slate500
                )
                Text(
                    text = "${(progress * 100).toInt()}%",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = goal.sphere.darkColor
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = goal.sphere.primaryColor,
                trackColor = goal.sphere.backgroundColor
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Milestones Toggle Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expandedMilestones = !expandedMilestones }
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Accountability Checkpoints",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Icon(
                    imageVector = if (expandedMilestones) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = Slate500
                )
            }

            if (expandedMilestones) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    goal.milestones.forEach { milestone ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { onToggleMilestone(milestone.id) }
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = milestone.isCompleted,
                                onCheckedChange = { onToggleMilestone(milestone.id) },
                                colors = CheckboxDefaults.colors(checkedColor = goal.sphere.primaryColor)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = milestone.title,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                color = if (milestone.isCompleted) Slate400 else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }

            // Mentor Feedback Note
            if (goal.mentorFeedback != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = Slate100,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.RateReview,
                            contentDescription = null,
                            tint = BrandSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Column {
                            Text(
                                text = "Elder Mentor Note:",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = BrandSecondaryDark
                            )
                            Text(
                                text = goal.mentorFeedback,
                                fontSize = 12.sp,
                                color = Slate700
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AddGoalDialog(
    initialSphere: LifeSphere,
    onDismiss: () -> Unit,
    onConfirm: (GoalItem) -> Unit
) {
    var selectedSphere by remember { mutableStateOf(initialSphere) }
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var scripture by remember { mutableStateOf("") }
    var milestone1 by remember { mutableStateOf("") }
    var milestone2 by remember { mutableStateOf("") }
    var milestone3 by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Set Spiritual & Life Goal", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 420.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Select Life Sphere:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    LifeSphere.entries.forEach { sphere ->
                        SphereBadge(
                            sphere = sphere,
                            isSelected = selectedSphere == sphere,
                            onClick = { selectedSphere = sphere }
                        )
                    }
                }

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Goal Title") },
                    placeholder = { Text("e.g., Romans Inductive Study") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Purpose & Discipleship Vision") },
                    maxLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = scripture,
                    onValueChange = { scripture = it },
                    label = { Text("Biblical Anchor Scripture") },
                    placeholder = { Text("e.g., Psalm 119:105") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Milestones & Action Steps:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = milestone1,
                    onValueChange = { milestone1 = it },
                    label = { Text("Milestone 1") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = milestone2,
                    onValueChange = { milestone2 = it },
                    label = { Text("Milestone 2 (Optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank()) {
                        val mList = mutableListOf<MilestoneItem>()
                        if (milestone1.isNotBlank()) mList.add(MilestoneItem("m_${System.currentTimeMillis()}_1", milestone1))
                        if (milestone2.isNotBlank()) mList.add(MilestoneItem("m_${System.currentTimeMillis()}_2", milestone2))
                        if (milestone3.isNotBlank()) mList.add(MilestoneItem("m_${System.currentTimeMillis()}_3", milestone3))
                        if (mList.isEmpty()) mList.add(MilestoneItem("m_def", "Complete initial action step"))

                        val newGoal = GoalItem(
                            id = "goal_${System.currentTimeMillis()}",
                            sphere = selectedSphere,
                            title = title,
                            description = description.ifBlank { "Personal discipleship goal in ${selectedSphere.displayName}" },
                            scriptureAnchor = scripture.ifBlank { selectedSphere.scriptureReference },
                            targetDate = "30 Days from now",
                            milestones = mList,
                            status = GoalStatus.ACTIVE,
                            mentorApproved = false,
                            createdBy = "You",
                            assignedTo = "Elder Mentor"
                        )
                        onConfirm(newGoal)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
            ) {
                Text("Save Goal", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
