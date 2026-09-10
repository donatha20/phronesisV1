package com.example.model

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

enum class LifeSphere(
    val displayName: String,
    val biblicalTheme: String,
    val scriptureReference: String,
    val scriptureText: String,
    val primaryColor: Color,
    val backgroundColor: Color,
    val darkColor: Color,
    val description: String
) {
    PERSONAL_GROWTH(
        displayName = "Spiritual & Faith",
        biblicalTheme = "Spiritual Disciplines & Christlikeness",
        scriptureReference = "1 Timothy 4:8",
        scriptureText = "Physical training has some value, but godliness has value for all things, holding promise for both the present life and the life to come.",
        primaryColor = Color(0xFF7C3AED),
        backgroundColor = Color(0xFFF3E8FF),
        darkColor = Color(0xFF5B21B6),
        description = "Prayer routines, Scripture memorization, daily devotionals, theological foundations, and character formation."
    ),
    FINANCES(
        displayName = "Biblical Finances",
        biblicalTheme = "Kingdom Stewardship & Generosity",
        scriptureReference = "Proverbs 3:9-10",
        scriptureText = "Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing.",
        primaryColor = Color(0xFF059669),
        backgroundColor = Color(0xFFD1FAE5),
        darkColor = Color(0xFF065F46),
        description = "Tithing, debt freedom, faithful budgeting, generous giving, and ethical financial management."
    ),
    RELATIONSHIPS(
        displayName = "Relationships & Family",
        biblicalTheme = "Godly Fellowship & Covenant Love",
        scriptureReference = "1 Thessalonians 5:11",
        scriptureText = "Therefore encourage one another and build each other up, just as in fact you are doing.",
        primaryColor = Color(0xFFE11D48),
        backgroundColor = Color(0xFFFFE4E6),
        darkColor = Color(0xFF9F1239),
        description = "Family honor, biblical dating & marriage preparation, godly friendships, forgiveness, and church community."
    ),
    ACADEMIA_CAREER(
        displayName = "Academia & Career",
        biblicalTheme = "Vocation as Worship & Excellence",
        scriptureReference = "Colossians 3:23",
        scriptureText = "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
        primaryColor = Color(0xFF0284C7),
        backgroundColor = Color(0xFFE0F2FE),
        darkColor = Color(0xFF0369A1),
        description = "Academic excellence, career discernment, workplace ministry, ethical leadership, and diligence."
    ),
    PHYSICAL_WELLBEING(
        displayName = "Physical Well-being",
        biblicalTheme = "Temple of the Holy Spirit & Sabbath",
        scriptureReference = "1 Corinthians 6:19-20",
        scriptureText = "Do you not know that your bodies are temples of the Holy Spirit... therefore honor God with your bodies.",
        primaryColor = Color(0xFFD97706),
        backgroundColor = Color(0xFFFEF3C7),
        darkColor = Color(0xFF92400E),
        description = "Physical fitness, nutrition, mental peace, regular Sabbath rest, healthy sleep, and holistic wellness."
    );

    val icon: ImageVector
        get() = when (this) {
            PERSONAL_GROWTH -> Icons.Default.AutoAwesome
            FINANCES -> Icons.Default.AttachMoney
            RELATIONSHIPS -> Icons.Default.Favorite
            ACADEMIA_CAREER -> Icons.Default.School
            PHYSICAL_WELLBEING -> Icons.Default.FitnessCenter
        }
}
