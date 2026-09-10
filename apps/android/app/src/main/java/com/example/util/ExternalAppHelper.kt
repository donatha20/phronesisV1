package com.example.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.CalendarContract
import android.widget.Toast
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

object ExternalAppHelper {

    fun openWhatsApp(context: Context, phoneNumber: String, message: String) {
        try {
            val encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8.toString())
            val cleanNumber = phoneNumber.replace(Regex("[^0-9]"), "")
            val url = if (cleanNumber.isNotEmpty()) {
                "https://wa.me/$cleanNumber?text=$encodedMessage"
            } else {
                "https://wa.me/?text=$encodedMessage"
            }
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Could not open WhatsApp: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    fun shareViaWhatsApp(context: Context, text: String) {
        openWhatsApp(context, "", text)
    }

    fun openTelegram(context: Context, username: String, message: String) {
        try {
            val encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8.toString())
            val url = if (username.isNotEmpty()) {
                "https://t.me/$username?text=$encodedMessage"
            } else {
                "https://t.me/share/url?url=&text=$encodedMessage"
            }
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Could not open Telegram: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    fun shareViaTelegram(context: Context, text: String) {
        openTelegram(context, "", text)
    }

    fun sendEmail(context: Context, recipientEmail: String, subject: String, body: String) {
        try {
            val intent = Intent(Intent.ACTION_SENDTO).apply {
                data = Uri.parse("mailto:")
                putExtra(Intent.EXTRA_EMAIL, arrayOf(recipientEmail))
                putExtra(Intent.EXTRA_SUBJECT, subject)
                putExtra(Intent.EXTRA_TEXT, body)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(Intent.createChooser(intent, "Send Email via"))
        } catch (e: Exception) {
            Toast.makeText(context, "Could not open Email client: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    fun addToCalendar(
        context: Context,
        title: String,
        description: String,
        location: String = "Phronesis Discipleship Room"
    ) {
        try {
            val beginTime = System.currentTimeMillis() + 86400000L // 24 hours from now
            val endTime = beginTime + (45 * 60 * 1000L) // 45 mins

            val intent = Intent(Intent.ACTION_INSERT).apply {
                data = CalendarContract.Events.CONTENT_URI
                putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, beginTime)
                putExtra(CalendarContract.EXTRA_EVENT_END_TIME, endTime)
                putExtra(CalendarContract.Events.TITLE, title)
                putExtra(CalendarContract.Events.DESCRIPTION, description)
                putExtra(CalendarContract.Events.EVENT_LOCATION, location)
                putExtra(CalendarContract.Events.AVAILABILITY, CalendarContract.Events.AVAILABILITY_BUSY)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Could not open Calendar: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
}
