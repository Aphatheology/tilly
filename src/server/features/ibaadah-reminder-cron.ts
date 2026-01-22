import { CRON_SECRET, CLERK_SECRET_KEY } from "astro:env/server"
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "astro:env/client"
import { createClerkClient } from "@clerk/backend"
import type { User } from "@clerk/backend"
import { initUserWorker } from "../lib/utils"
import { tryCatch } from "#shared/lib/trycatch"
import { toZonedTime, format } from "date-fns-tz"
import { Hono } from "hono"
import { bearerAuth } from "hono/bearer-auth"
import {
	getEnabledDevices,
	sendNotificationToDevice,
	getIntl,
	ibaadahSettingsQuery,
} from "./push-shared"
import type {
	PushDevice,
	NotificationPayload,
	LoadedNotificationSettings,
	LoadedUserAccountWithIbaadahSettings,
} from "./push-shared"

export { ibaadahReminderCronApp }

let ibaadahReminderCronApp = new Hono().get(
	"/deliver-ibaadah-reminders",
	bearerAuth({ token: CRON_SECRET }),
	async c => {
		console.log("🕌 Starting Ibaadah reminder delivery cron job")
		let deliveryResults: Array<{
			userID: string
			prayer: string
			success: boolean
		}> = []
		let processingPromises: Promise<void>[] = []
		let maxConcurrentUsers = 50

		for await (let user of userGenerator()) {
			await waitForConcurrencyLimit(processingPromises, maxConcurrentUsers)

			let userPromise = loadIbaadahSettings(user)
				.then(data => checkIbaadahRemindersEnabled(data))
				.then(data => getDuePrayerReminders(data))
				.then(data => getDevices(data))
				.then(userWithDevices => processDevicesPipeline(userWithDevices))
				.then(results => {
					deliveryResults.push(...results)
				})
				.catch(error => {
					if (typeof error === "string") {
						console.log(`❌ User ${user.id}: ${error}`)
					} else {
						console.log(`❌ User ${user.id}: ${error.message || error}`)
					}
				})
				.finally(() => removeFromList(processingPromises, userPromise))

			processingPromises.push(userPromise)
		}

		await Promise.allSettled(processingPromises)

		return c.json({
			message: `Processed ${deliveryResults.length} Ibaadah reminder deliveries`,
			results: deliveryResults,
		})
	},
)

async function* userGenerator() {
	let clerkClient = createClerkClient({
		secretKey: CLERK_SECRET_KEY,
		publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY,
	})

	let offset = 0
	let limit = 500
	let totalUsers = 0
	let jazzUsers = 0

	while (true) {
		let response = await clerkClient.users.getUserList({
			limit,
			offset,
		})

		totalUsers += response.data.length

		for (let user of response.data) {
			if (
				user.unsafeMetadata.jazzAccountID &&
				user.unsafeMetadata.jazzAccountSecret
			) {
				jazzUsers++
				yield user
			}
		}

		if (response.data.length < limit) {
			break
		}

		offset += limit
	}

	console.log(
		`🚀 Found ${jazzUsers} users with Jazz accounts out of ${totalUsers} total users`,
	)
}

async function loadIbaadahSettings(user: User) {
	let workerResult = await tryCatch(initUserWorker(user))
	if (!workerResult.ok) {
		throw `Failed to init worker - ${workerResult.error}`
	}

	let workerWithSettings = await workerResult.data.worker.$jazz.ensureLoaded({
		resolve: ibaadahSettingsQuery,
	})
	let ibaadahSettings = workerWithSettings.root.ibaadahSettings
	if (!ibaadahSettings) {
		throw "No Ibaadah settings configured"
	}

	let notificationSettings = workerWithSettings.root.notificationSettings
	if (!notificationSettings) {
		throw "No notification settings configured"
	}

	console.log(`✅ User ${user.id}: Loaded Ibaadah settings`)

	return {
		user,
		ibaadahSettings,
		notificationSettings,
		worker: workerWithSettings,
		currentUtc: new Date(),
	}
}

async function checkIbaadahRemindersEnabled<
	T extends {
		ibaadahSettings: LoadedIbaadahSettings
		currentUtc: Date
		user: User
	},
>(data: T) {
	let { ibaadahSettings, user } = data

	if (!ibaadahSettings.enableReminders) {
		throw "Ibaadah reminders not enabled"
	}

	console.log(`✅ User ${user.id}: Ibaadah reminders enabled`)

	return data
}

async function getDuePrayerReminders(
	data: IbaadahProcessingContext,
): Promise<DuePrayerContext> {
	let { user, ibaadahSettings, notificationSettings, worker, currentUtc } = data

	let userTimezone = notificationSettings.timezone || "UTC"
	let userLocalTime = toZonedTime(currentUtc, userTimezone)
	let userLocalTimeStr = format(userLocalTime, "HH:mm")
	let userLocalDateStr = format(userLocalTime, "yyyy-MM-dd")

	let reminderTimes = ibaadahSettings.reminderTimes || {}
	let lastNotifiedPrayers = ibaadahSettings.lastNotifiedPrayers || {}
	let duePrayers: Array<"fajr" | "dhuhr" | "asr" | "maghrib" | "isha"> = []

	let prayers: Array<"fajr" | "dhuhr" | "asr" | "maghrib" | "isha"> = [
		"fajr",
		"dhuhr",
		"asr",
		"maghrib",
		"isha",
	]

	for (let prayer of prayers) {
		let reminderTime = reminderTimes[prayer]
		if (!reminderTime) continue

		let lastNotifiedDate = lastNotifiedPrayers[prayer]
		if (lastNotifiedDate === userLocalDateStr) continue

		let [reminderHour, reminderMinute] = reminderTime.split(":").map(Number)
		let [currentHour, currentMinute] = userLocalTimeStr.split(":").map(Number)

		let reminderMinutes = reminderHour * 60 + reminderMinute
		let currentMinutes = currentHour * 60 + currentMinute

		if (
			currentMinutes >= reminderMinutes - 5 &&
			currentMinutes <= reminderMinutes + 15
		) {
			duePrayers.push(prayer)
		}
	}

	console.log(
		`✅ User ${user.id}: Checked prayer reminders (${duePrayers.length} due)`,
	)

	return {
		user,
		ibaadahSettings,
		notificationSettings,
		worker,
		currentUtc,
		duePrayers,
		userLocalDateStr,
	}
}

async function getDevices(
	data: DuePrayerContext,
): Promise<DevicePrayerContext> {
	let { user, notificationSettings, duePrayers } = data

	if (duePrayers.length === 0) {
		console.log(`✅ User ${user.id}: No due prayer reminders`)
		return {
			...data,
			devices: [],
		}
	}

	let enabledDevices = getEnabledDevices(notificationSettings)
	if (enabledDevices.length === 0) {
		console.log(`✅ User ${user.id}: No enabled devices`)
		return {
			...data,
			devices: [],
		}
	}

	console.log(
		`✅ User ${data.user.id}: Ready to send prayer reminders for ${duePrayers.join(", ")} to ${enabledDevices.length} devices`,
	)

	return {
		...data,
		devices: enabledDevices,
	}
}

async function processDevicesPipeline(userWithDevices: DevicePrayerContext) {
	let { user, devices, duePrayers, ibaadahSettings, worker, userLocalDateStr } =
		userWithDevices

	if (devices.length === 0) {
		markPrayersAsNotified(ibaadahSettings, duePrayers, userLocalDateStr)
		await worker.$jazz.waitForSync()
		console.log(
			`✅ User ${user.id}: Marked prayers as notified (skipped - no devices)`,
		)
		return duePrayers.map(prayer => ({
			userID: user.id,
			prayer,
			success: true,
		}))
	}

	let results: Array<{
		userID: string
		prayer: string
		success: boolean
	}> = []

	for (let prayer of duePrayers) {
		let payload = createPrayerReminderPayload(prayer, user.id, worker)

		let devicePromises = devices.map((device: PushDevice) =>
			sendNotificationToDevice(device, payload),
		)

		let deviceResults = await Promise.allSettled(devicePromises)

		let userSuccess = deviceResults.some(
			r => r.status === "fulfilled" && r.value?.ok === true,
		)

		if (userSuccess) {
			console.log(
				`✅ User ${user.id}: Successfully sent ${prayer} reminder to devices`,
			)
		} else {
			console.error(`❌ User ${user.id}: Failed to send ${prayer} reminder`)
		}

		results.push({
			userID: user.id,
			prayer,
			success: userSuccess,
		})
	}

	markPrayersAsNotified(ibaadahSettings, duePrayers, userLocalDateStr)
	await worker.$jazz.waitForSync()

	console.log(`✅ User ${user.id}: Completed prayer reminder delivery`)

	return results
}

function markPrayersAsNotified(
	ibaadahSettings: LoadedIbaadahSettings,
	prayers: Array<"fajr" | "dhuhr" | "asr" | "maghrib" | "isha">,
	dateStr: string,
) {
	let lastNotifiedPrayers = ibaadahSettings.lastNotifiedPrayers || {}
	let updated = { ...lastNotifiedPrayers }
	for (let prayer of prayers) {
		updated[prayer] = dateStr
	}
	ibaadahSettings.$jazz.set("lastNotifiedPrayers", updated)
}

function createPrayerReminderPayload(
	prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha",
	userId: string,
	worker: LoadedUserAccountWithIbaadahSettings,
): NotificationPayload {
	let t = getIntl(worker) as (
		key: string,
		params?: Record<string, unknown>,
	) => string
	let prayerKey = `server.push.prayerReminder.${prayer}`
	return {
		title: t(`${prayerKey}.title`),
		body: t(`${prayerKey}.body`),
		icon: "/favicon.ico",
		badge: "/favicon.ico",
		url: "/app/dashboard",
		userId,
	}
}

async function waitForConcurrencyLimit(
	promises: Promise<void>[],
	maxConcurrency: number,
) {
	if (promises.length >= maxConcurrency) {
		await Promise.race(promises)
	}
}

function removeFromList<T>(list: T[], item: T) {
	let index = list.indexOf(item)
	if (index > -1) list.splice(index, 1)
}

type IbaadahProcessingContext = {
	user: User
	ibaadahSettings: LoadedIbaadahSettings
	notificationSettings: LoadedNotificationSettings
	worker: LoadedUserAccountWithIbaadahSettings
	currentUtc: Date
}

type DuePrayerContext = IbaadahProcessingContext & {
	duePrayers: Array<"fajr" | "dhuhr" | "asr" | "maghrib" | "isha">
	userLocalDateStr: string
}

type DevicePrayerContext = DuePrayerContext & {
	devices: PushDevice[]
}

type LoadedIbaadahSettings = NonNullable<
	LoadedUserAccountWithIbaadahSettings["root"]["ibaadahSettings"]
>
