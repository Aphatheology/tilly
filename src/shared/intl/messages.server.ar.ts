import { translate } from "@ccssmnn/intl"
import { baseServerMessages } from "./messages.server"

export { arServerMessages }

const arServerMessages = translate(baseServerMessages, {
	"server.push.test-title": "إشعار تجريبي",
	"server.push.test-body": "هذا إشعار تجريبي. تم تكوين جهازك بشكل صحيح! 🚀",
	"server.push.dueReminders.title":
		".input {$count :number} .match $count one {{لديك تذكير واحد مستحق اليوم}} * {{لديك {$count} تذكيرات مستحقة اليوم}}",
	"server.push.dueReminders.body":
		"بضع لحظات للتواصل يمكن أن تبهج يوم شخص ما ✨",
	"server.push.assistantComplete.title": "تيلي لديه رد لك",
	"server.push.assistantComplete.body": "تم الرد على رسالتك ✨",
	"server.push.prayerReminder.fajr.title": "وقت صلاة الفجر",
	"server.push.prayerReminder.fajr.body": "حان وقت صلاة الفجر 🌅",
	"server.push.prayerReminder.dhuhr.title": "وقت صلاة الظهر",
	"server.push.prayerReminder.dhuhr.body": "حان وقت صلاة الظهر ☀️",
	"server.push.prayerReminder.asr.title": "وقت صلاة العصر",
	"server.push.prayerReminder.asr.body": "حان وقت صلاة العصر 🌤️",
	"server.push.prayerReminder.maghrib.title": "وقت صلاة المغرب",
	"server.push.prayerReminder.maghrib.body": "حان وقت صلاة المغرب 🌇",
	"server.push.prayerReminder.isha.title": "وقت صلاة العشاء",
	"server.push.prayerReminder.isha.body": "حان وقت صلاة العشاء 🌙",
	"server.error.notificationSettingsNotConfigured":
		"إعدادات الإشعارات غير مكونة",
	"server.error.deviceNotInList": "الجهاز غير موجود في قائمة الأجهزة.",
	"server.error.failedToSendNotification":
		"فشل إرسال الإشعار إلى خادم الإشعارات.",
})
