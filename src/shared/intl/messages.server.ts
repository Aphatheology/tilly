import { messages, translate } from "@ccssmnn/intl"

export { baseServerMessages, deServerMessages }

let baseServerMessages = messages({
	"server.push.test-title": "Test Notification",
	"server.push.test-body":
		"This is a test push notification. Your device is configured correctly! 🚀",
	"server.push.dueReminders.title":
		".input {$count :number} .match $count one {{You have one reminder due today}} * {{You have {$count} reminders due today}}",
	"server.push.dueReminders.body":
		"A few moments to reach out could brighten someone's day ✨",
	"server.push.assistantComplete.title": "Tilly has a response for you",
	"server.push.assistantComplete.body": "Your message has been answered ✨",
	"server.push.prayerReminder.fajr.title": "Fajr Prayer Time",
	"server.push.prayerReminder.fajr.body": "It's time for Fajr prayer 🌅",
	"server.push.prayerReminder.dhuhr.title": "Dhuhr Prayer Time",
	"server.push.prayerReminder.dhuhr.body": "It's time for Dhuhr prayer ☀️",
	"server.push.prayerReminder.asr.title": "Asr Prayer Time",
	"server.push.prayerReminder.asr.body": "It's time for Asr prayer 🌤️",
	"server.push.prayerReminder.maghrib.title": "Maghrib Prayer Time",
	"server.push.prayerReminder.maghrib.body": "It's time for Maghrib prayer 🌇",
	"server.push.prayerReminder.isha.title": "Isha Prayer Time",
	"server.push.prayerReminder.isha.body": "It's time for Isha prayer 🌙",

	"server.error.notificationSettingsNotConfigured":
		"NotificationSettings not configured",
	"server.error.deviceNotInList": "the device is not in the device list.",
	"server.error.failedToSendNotification":
		"Failed to send notification to the Push Notification Server.",
})

let deServerMessages = translate(baseServerMessages, {
	"server.push.test-title": "Test-Benachrichtigung",
	"server.push.test-body":
		"Das ist eine Test-Push-Benachrichtigung. Dein Gerät ist korrekt konfiguriert!",
	"server.push.dueReminders.title":
		".input {$count :number} .match $count one {{Du hast eine Erinnerung Heute}} * {{Du hast {$count} Erinnerungen heute}}",
	"server.push.dueReminders.body":
		"Manchmal reicht ein kleiner Moment, um jemandem den Tag zu versüßen ✨",
	"server.push.assistantComplete.title": "Tilly hat eine Antwort für dich",
	"server.push.assistantComplete.body": "Deine Nachricht wurde beantwortet ✨",
	"server.push.prayerReminder.fajr.title": "Fajr Gebetszeit",
	"server.push.prayerReminder.fajr.body": "Es ist Zeit für das Fajr-Gebet 🌅",
	"server.push.prayerReminder.dhuhr.title": "Dhuhr Gebetszeit",
	"server.push.prayerReminder.dhuhr.body": "Es ist Zeit für das Dhuhr-Gebet ☀️",
	"server.push.prayerReminder.asr.title": "Asr Gebetszeit",
	"server.push.prayerReminder.asr.body": "Es ist Zeit für das Asr-Gebet 🌤️",
	"server.push.prayerReminder.maghrib.title": "Maghrib Gebetszeit",
	"server.push.prayerReminder.maghrib.body":
		"Es ist Zeit für das Maghrib-Gebet 🌇",
	"server.push.prayerReminder.isha.title": "Isha Gebetszeit",
	"server.push.prayerReminder.isha.body": "Es ist Zeit für das Isha-Gebet 🌙",

	"server.error.notificationSettingsNotConfigured":
		"Benachrichtigungseinstellungen nicht konfiguriert",
	"server.error.deviceNotInList": "Das Gerät ist nicht in der Geräteliste.",
	"server.error.failedToSendNotification":
		"Benachrichtigung konnte nicht an den Push-Benachrichtigungsserver gesendet werden.",
})
