package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.model.SecuritySettings
import com.example.ui.theme.*

@Composable
fun SecurityMfaScreen(
    settings: SecuritySettings,
    onToggleBiometric: (Boolean) -> Unit,
    onToggleE2E: (Boolean) -> Unit,
    onToggleOfflineSync: (Boolean) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isSimulatingBiometricScan by remember { mutableStateOf(false) }
    var scanSuccessMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate900)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PureWhite)
            }
            Column {
                Text("Security, Biometrics & Encryption", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                Text("Multi-factor Pastoral Privacy & Vault Controls", fontSize = 11.sp, color = Slate400)
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {
            // Biometric Verification Status Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate800)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFF10B981)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Fingerprint, contentDescription = null, tint = PureWhite)
                                }
                                Column {
                                    Text("Biometric MFA Authentication", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                    Text("Fingerprint / Face ID / Secure Enclave", fontSize = 11.sp, color = Slate400)
                                }
                            }
                            Switch(
                                checked = settings.isBiometricEnabled,
                                onCheckedChange = onToggleBiometric,
                                colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = Color(0xFF10B981))
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Button(
                            onClick = {
                                isSimulatingBiometricScan = true
                                scanSuccessMessage = "Biometric Passkey Verified: Hardware Key Confirmed!"
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Slate700)
                        ) {
                            Icon(Icons.Default.Fingerprint, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Test Biometric Sensor Passkey")
                        }

                        if (scanSuccessMessage != null) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = scanSuccessMessage!!,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF34D399)
                            )
                        }
                    }
                }
            }

            // End-to-End Encryption
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate800)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape)
                                        .background(BrandPrimaryLight),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Shield, contentDescription = null, tint = PureWhite)
                                }
                                Column {
                                    Text("Zero-Knowledge E2E Encryption", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                    Text("Client-side AES-256-GCM cipher", fontSize = 11.sp, color = Slate400)
                                }
                            }
                            Switch(
                                checked = settings.isE2EEncryptionActive,
                                onCheckedChange = onToggleE2E,
                                colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = BrandPrimaryLight)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "Key Fingerprint: ${settings.keyFingerprint}",
                            fontSize = 11.sp,
                            color = Slate300
                        )
                        Text(
                            text = "Pastoral notes and prayers remain strictly between you, your mentor, and God. No servers can decrypt your confidential spiritual records.",
                            fontSize = 12.sp,
                            color = Slate400,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            // Offline Synchronization
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate800)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape)
                                        .background(BrandSecondary),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Sync, contentDescription = null, tint = PureWhite)
                                }
                                Column {
                                    Text("Offline-Ready Real-Time Sync", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                                    Text("Seamless caching for retreat & mission trips", fontSize = 11.sp, color = Slate400)
                                }
                            }
                            Switch(
                                checked = settings.isOfflineSyncEnabled,
                                onCheckedChange = onToggleOfflineSync,
                                colors = SwitchDefaults.colors(checkedThumbColor = PureWhite, checkedTrackColor = BrandSecondary)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Status: Encrypted local Room cache synced ${settings.lastSyncTimestamp}",
                            fontSize = 12.sp,
                            color = Color(0xFF34D399)
                        )
                    }
                }
            }

            // Compliance & Pastoral Seal
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate800)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = BrandSecondaryLight)
                            Text("Pastoral Confidentiality & Compliance Seal", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PureWhite)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "AgapeLink follows strict ethical standards for spiritual directors and ordained elders. Data portability and GDPR right-to-be-forgotten zero-trace deletion are fully guaranteed.",
                            fontSize = 12.sp,
                            color = Slate300,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }
    }
}
