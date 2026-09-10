package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.GoalItem
import com.example.model.LifeSphere
import com.example.ui.theme.*

@Composable
fun SpheresAnalyticsCard(
    goals: List<GoalItem>,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.TrendingUp,
                        contentDescription = null,
                        tint = BrandPrimaryLight
                    )
                    Text(
                        text = "5-Sphere Growth Radar",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFDCFCE7)
                ) {
                    Text(
                        text = "Overall: 64% Flourishing",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF166534)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            LifeSphere.entries.forEach { sphere ->
                val sphereGoals = goals.filter { it.sphere == sphere }
                val completedMilestones = sphereGoals.flatMap { it.milestones }.count { it.isCompleted }
                val totalMilestones = sphereGoals.flatMap { it.milestones }.size.coerceAtLeast(1)
                val percent = if (totalMilestones > 0) ((completedMilestones.toFloat() / totalMilestones) * 100).toInt() else 0

                SphereProgressBar(
                    sphere = sphere,
                    progress = (percent.toFloat() / 100f).coerceIn(0.1f, 1f),
                    percentText = "$percent%"
                )
                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }
}

@Composable
fun SphereProgressBar(
    sphere: LifeSphere,
    progress: Float,
    percentText: String
) {
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(durationMillis = 800),
        label = "progress"
    )

    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(sphere.primaryColor)
                )
                Text(
                    text = sphere.displayName,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            Text(
                text = percentText,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = sphere.darkColor
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(sphere.backgroundColor)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(animatedProgress)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(4.dp))
                    .background(sphere.primaryColor)
            )
        }
    }
}

@Composable
fun HabitConsistencyHeatmap(
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "30-Day Discipleship Consistency",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "24-Day Streak 🔥",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = BrandSecondary
                )
            }
            Spacer(modifier = Modifier.height(12.dp))

            // 4 rows x 7 days heatmap grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                val days = listOf("M", "T", "W", "T", "F", "S", "S")
                days.forEach { day ->
                    Text(
                        text = day,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate400
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Sample 4 weeks matrix
            val activityLevels = listOf(
                listOf(3, 4, 3, 2, 4, 3, 4),
                listOf(4, 3, 4, 4, 3, 4, 4),
                listOf(3, 4, 4, 3, 4, 2, 4),
                listOf(4, 4, 4, 4, 3, 4, 0)
            )

            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                activityLevels.forEach { week ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        week.forEach { level ->
                            val color = when (level) {
                                4 -> Color(0xFF10B981) // High
                                3 -> Color(0xFF34D399) // Medium
                                2 -> Color(0xFF6EE7B7) // Light
                                else -> Slate200
                            }
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(color)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Less", fontSize = 10.sp, color = Slate400)
                Spacer(modifier = Modifier.width(4.dp))
                Box(modifier = Modifier.size(10.dp).clip(RoundedCornerShape(2.dp)).background(Slate200))
                Spacer(modifier = Modifier.width(3.dp))
                Box(modifier = Modifier.size(10.dp).clip(RoundedCornerShape(2.dp)).background(Color(0xFF6EE7B7)))
                Spacer(modifier = Modifier.width(3.dp))
                Box(modifier = Modifier.size(10.dp).clip(RoundedCornerShape(2.dp)).background(Color(0xFF10B981)))
                Spacer(modifier = Modifier.width(4.dp))
                Text(text = "More", fontSize = 10.sp, color = Slate400)
            }
        }
    }
}
