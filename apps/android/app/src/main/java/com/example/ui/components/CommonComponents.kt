package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.*
import com.example.ui.theme.*

@Composable
fun LifeSphereBadge(
    sphere: LifeSphere,
    modifier: Modifier = Modifier,
    isSelected: Boolean = false,
    onClick: (() -> Unit)? = null
) {
    SphereBadge(sphere = sphere, modifier = modifier, isSelected = isSelected, onClick = onClick)
}

@Composable
fun SphereBadge(
    sphere: LifeSphere,
    modifier: Modifier = Modifier,
    isSelected: Boolean = false,
    onClick: (() -> Unit)? = null
) {
    val bg = if (isSelected) sphere.primaryColor else sphere.backgroundColor
    val textAndIconColor = if (isSelected) PureWhite else sphere.darkColor

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(bg)
            .then(
                if (onClick != null) Modifier.clickable { onClick() } else Modifier
            )
            .padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Icon(
            imageVector = sphere.icon,
            contentDescription = sphere.displayName,
            tint = textAndIconColor,
            modifier = Modifier.size(16.dp)
        )
        Text(
            text = sphere.displayName,
            color = textAndIconColor,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1
        )
    }
}

@Composable
fun UserRolePill(
    role: UserRole,
    onSwitchRole: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
        modifier = modifier.clickable { onSwitchRole() }
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = if (role == UserRole.MENTOR_ELDER) Icons.Default.VerifiedUser else Icons.Default.Person,
                contentDescription = null,
                tint = if (role == UserRole.MENTOR_ELDER) BrandSecondary else BrandPrimaryLight,
                modifier = Modifier.size(16.dp)
            )
            Text(
                text = if (role == UserRole.MENTOR_ELDER) "Role: Senior Mentor" else "Role: Young Believer",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            Icon(
                imageVector = Icons.Default.SwapHoriz,
                contentDescription = "Switch Role",
                tint = MaterialTheme.colorScheme.outline,
                modifier = Modifier.size(14.dp)
            )
        }
    }
}

@Composable
fun SecurityStatusBar(
    securitySettings: SecuritySettings,
    onOpenSecurity: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Slate800)
            .clickable { onOpenSecurity() }
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Lock,
                contentDescription = "E2E Encrypted",
                tint = Color(0xFF10B981),
                modifier = Modifier.size(16.dp)
            )
            Column {
                Text(
                    text = "End-to-End Encrypted Vault Active",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = PureWhite
                )
                Text(
                    text = "Biometric MFA • Pastoral Confidentiality • Zero-Knowledge",
                    fontSize = 10.sp,
                    color = Slate300
                )
            }
        }
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF10B981))
            )
            Text(
                text = "Synced",
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium,
                color = Slate300
            )
        }
    }
}

@Composable
fun ScriptureQuoteCard(
    verseText: String,
    reference: String,
    sphere: LifeSphere,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = sphere.backgroundColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.MenuBook,
                    contentDescription = null,
                    tint = sphere.darkColor,
                    modifier = Modifier.size(18.dp)
                )
                Text(
                    text = "Daily Spiritual Anchor",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = sphere.darkColor
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "“$verseText”",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Slate900,
                lineHeight = 20.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "— $reference",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = sphere.darkColor
            )
        }
    }
}
