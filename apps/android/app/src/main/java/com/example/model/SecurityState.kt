package com.example.model

enum class BiometricAuthType {
    FINGERPRINT,
    FACE_ID,
    SECURE_PIN
}

data class SecuritySettings(
    val isBiometricEnabled: Boolean = true,
    val isE2EEncryptionActive: Boolean = true,
    val encryptionAlgorithm: String = "AES-256-GCM Zero-Knowledge",
    val keyFingerprint: String = "SHA256:4a8f9c1b3e7d...99aa",
    val isOfflineSyncEnabled: Boolean = true,
    val lastSyncTimestamp: String = "Just now",
    val complianceStandard: String = "Pastoral Confidentiality & GDPR/HIPAA Vault Compliant",
    val isVaultUnlocked: Boolean = true
)
