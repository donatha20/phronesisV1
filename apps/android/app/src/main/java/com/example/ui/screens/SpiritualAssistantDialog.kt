package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.example.model.LifeSphere
import com.example.ui.components.SphereBadge
import com.example.ui.theme.*

data class SpiritualTopic(
    val title: String,
    val sphere: LifeSphere,
    val biblicalGuidance: String,
    val scripturePassage: String,
    val mentorshipDiscussionPrompt: String
)

val sampleGuidanceTopics = listOf(
    SpiritualTopic(
        title = "Discerning Career Offers & Vocation",
        sphere = LifeSphere.ACADEMIA_CAREER,
        biblicalGuidance = "Look beyond compensation to culture, integrity, and how this role positions you to serve others. God often guides through godly counsel (Prov 15:22) and inward peace that surpasses understanding (Phil 4:7).",
        scripturePassage = "Proverbs 16:3 & Colossians 3:23-24",
        mentorshipDiscussionPrompt = "Ask your mentor: 'In your career, what compromises seemed harmless at first but cost you spiritually?'"
    ),
    SpiritualTopic(
        title = "Biblical Stewardship & Financial Anxiety",
        sphere = LifeSphere.FINANCES,
        biblicalGuidance = "Remember that God is Jehovah Jireh—our Provider. Tithing is not paying God off; it is breaking the power of greed over our hearts and acknowledging His ownership over all things.",
        scripturePassage = "Matthew 6:31-33 & Proverbs 3:9-10",
        mentorshipDiscussionPrompt = "Ask your mentor: 'How did you establish a habit of radical generosity even when money was tight early in life?'"
    ),
    SpiritualTopic(
        title = "Overcoming Spiritual Dryness in Prayer",
        sphere = LifeSphere.PERSONAL_GROWTH,
        biblicalGuidance = "Feelings fluctuate, but God's covenant love remains steadfast. When words fail, pray the Psalms, practice 10 minutes of quiet adoration, and ask the Holy Spirit to intercede (Rom 8:26).",
        scripturePassage = "Psalm 42:1-2 & Romans 8:26-27",
        mentorshipDiscussionPrompt = "Ask your mentor: 'What do you do when you open the Bible and feel completely dry or distracted?'"
    ),
    SpiritualTopic(
        title = "Honoring Difficult Family Relationships",
        sphere = LifeSphere.RELATIONSHIPS,
        biblicalGuidance = "Forgiveness is a decision to release the debt, not an instant feeling. Speak the truth in love with gracious boundaries, trusting God to soften hardened hearts.",
        scripturePassage = "Romans 12:18 & Ephesians 4:31-32",
        mentorshipDiscussionPrompt = "Ask your mentor: 'How do you navigate holiday visits with family members who are hostile to your faith?'"
    ),
    SpiritualTopic(
        title = "Honoring God with Rest & Physical Well-being",
        sphere = LifeSphere.PHYSICAL_WELLBEING,
        biblicalGuidance = "Sabbath is God's gift to protect us from burnout and self-reliance. Your body is a sacred temple; sleep, hydration, and nutrition are acts of spiritual stewardship.",
        scripturePassage = "1 Corinthians 6:19-20 & Mark 2:27",
        mentorshipDiscussionPrompt = "Ask your mentor: 'What does your weekly Sabbath rhythm look like, and how do you disconnect from work anxiety?'"
    )
)

@Composable
fun SpiritualAssistantDialog(
    onDismiss: () -> Unit
) {
    var selectedTopic by remember { mutableStateOf<SpiritualTopic?>(null) }
    var customQuery by remember { mutableStateOf("") }
    var aiResponse by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = BrandSecondary)
                Text("Spiritual Wisdom & Biblical Guidance", fontWeight = FontWeight.Bold, fontSize = 17.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 420.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (selectedTopic == null && aiResponse == null) {
                    Text(
                        text = "Choose a discipleship theme or type a spiritual question:",
                        fontSize = 12.sp,
                        color = Slate600
                    )

                    OutlinedTextField(
                        value = customQuery,
                        onValueChange = { customQuery = it },
                        placeholder = { Text("e.g. How to deal with workplace gossip?") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        trailingIcon = {
                            if (customQuery.isNotBlank()) {
                                IconButton(onClick = {
                                    aiResponse = "Scripture instructs: 'Do not let any unwholesome talk come out of your mouths, but only what is helpful for building others up' (Ephesians 4:29). When gossip arises, gently redirect the conversation, praise the absent person's character, and privately ask your mentor how they handled similar office dynamics."
                                }) {
                                    Icon(Icons.Default.Send, contentDescription = "Ask", tint = BrandPrimaryLight)
                                }
                            }
                        }
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text("Curated 5-Sphere Biblical Guidance:", fontSize = 12.sp, fontWeight = FontWeight.Bold)

                    LazyColumn(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(sampleGuidanceTopics) { topic ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedTopic = topic },
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = topic.sphere.backgroundColor)
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(topic.sphere.icon, contentDescription = null, tint = topic.sphere.darkColor, modifier = Modifier.size(18.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(topic.title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Slate900)
                                        Text(topic.sphere.displayName, fontSize = 10.sp, color = topic.sphere.darkColor, fontWeight = FontWeight.Medium)
                                    }
                                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = topic.sphere.darkColor)
                                }
                            }
                        }
                    }
                } else if (selectedTopic != null) {
                    val t = selectedTopic!!
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        SphereBadge(sphere = t.sphere)
                        Text(t.title, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Slate900)

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = t.sphere.backgroundColor,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("📖 Scripture: ${t.scripturePassage}", modifier = Modifier.padding(8.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = t.sphere.darkColor)
                        }

                        Text("Biblical Principle:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Text(t.biblicalGuidance, fontSize = 13.sp, color = Slate700, lineHeight = 18.sp)

                        Text("Recommended Question for Your Mentor:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = BrandSecondaryDark)
                        Text(t.mentorshipDiscussionPrompt, fontSize = 12.sp, color = Slate800, fontWeight = FontWeight.Medium)

                        Spacer(modifier = Modifier.height(6.dp))
                        TextButton(onClick = { selectedTopic = null }) {
                            Text("← Back to Topics")
                        }
                    }
                } else if (aiResponse != null) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Biblical Guidance for Your Question:", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text(aiResponse!!, fontSize = 13.sp, color = Slate800, lineHeight = 19.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        TextButton(onClick = { aiResponse = null; customQuery = "" }) {
                            Text("← Ask Another Question")
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
            ) {
                Text("Done")
            }
        }
    )
}
