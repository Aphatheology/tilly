import { Hono } from "hono"
import { authMiddleware } from "../lib/auth-middleware"
import { initUserWorker } from "../lib/utils"
import { type ResolveQuery, type Loaded } from "jazz-tools"
import { UserAccount } from "#shared/schema/user"
import { IbaadahEntry, type IbaadahType } from "#shared/schema/ibaadah"
import { Reflection } from "#shared/schema/reflection"
import { PointsHistory } from "#shared/schema/points"
import type { ReflectionMood } from "#shared/schema/reflection"
import { getDailyInspiration } from "#shared/data/daily-inspiration"
import type { User } from "@clerk/backend"

export { hasiberAiApp }

let hasiberAiApp = new Hono()
	.use("*", authMiddleware)
	.get("/motivation", async c => {
		let user = c.get("user") as User | null
		if (!user) return c.json({ error: "unauthorized" }, 401)
		let { worker } = await initUserWorker(user)

		let account = await worker.$jazz.ensureLoaded({
			resolve: motivationResolveQuery,
		})

		let root = account.root
		if (!root) return c.json({ error: "account root missing" }, 500)

	let today = new Date()
	let todayKey = toISODate(today)
	let entries = Array.from(root.ibaadahEntries?.values() || []).filter(
		(e): e is Loaded<typeof IbaadahEntry> =>
			Boolean(e && e.$isLoaded),
	)
	let reflections = Array.from(root.reflections?.values() || []).filter(
		(r): r is Loaded<typeof Reflection> =>
			Boolean(r && r.$isLoaded),
	)

		let recentEntries = entries.filter(e => e.date >= getDateNDaysAgo(todayKey, 30))
		let stats = computeIbaadahStats(recentEntries, todayKey)

		let latestReflection = reflections
			.filter(r => r.date <= todayKey)
			.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))[0]

		let inspiration = getDailyInspiration(today, latestReflection?.mood as ReflectionMood | undefined)

		let message = buildMotivationMessage({
			streak: stats.currentStreak,
			consistency7: stats.consistency7,
			trend: stats.trend,
			mood: latestReflection?.mood,
			hasReflectionToday: reflections.some(r => r.date === todayKey),
		})

		return c.json({
			date: todayKey,
			inspiration,
			message,
			stats,
		})
	})
	.get("/insights", async c => {
		let user = c.get("user") as User | null
		if (!user) return c.json({ error: "unauthorized" }, 401)

		let rawRange = c.req.query("range")
		let range: InsightRange = rawRange === "month" ? "month" : "week"

		let { worker } = await initUserWorker(user)

		let account = await worker.$jazz.ensureLoaded({
			resolve: motivationResolveQuery,
		})

		let root = account.root
		if (!root) return c.json({ error: "account root missing" }, 500)

		let today = new Date()
		let todayKey = toISODate(today)
		let startKey =
			range === "week"
				? getDateNDaysAgo(todayKey, 7)
				: getDateNDaysAgo(todayKey, 30)

		let entries = Array.from(root.ibaadahEntries?.values() || [])
			.filter(
				(e): e is Loaded<typeof IbaadahEntry> =>
					Boolean(e && e.$isLoaded),
			)
			.filter(e => e.date >= startKey && e.date <= todayKey)
		let reflections = Array.from(root.reflections?.values() || [])
			.filter(
				(r): r is Loaded<typeof Reflection> =>
					Boolean(r && r.$isLoaded),
			)
			.filter(r => r.date >= startKey && r.date <= todayKey)
		let pointsHistory = Array.from(root.pointsHistory?.values() || [])
			.filter(
				(p): p is Loaded<typeof PointsHistory> =>
					Boolean(p && p.$isLoaded),
			)
			.filter(p => p.date >= startKey && p.date <= todayKey)

		let insights = buildInsights({
			range,
			startDate: startKey,
			endDate: todayKey,
			entries,
			reflections,
			pointsHistory,
		})

		return c.json(insights)
	})

let motivationResolveQuery = {
	root: {
		ibaadahEntries: { $each: true },
		reflections: { $each: true },
		pointsHistory: { $each: true },
	},
} as const satisfies ResolveQuery<typeof UserAccount>


function toISODate(d: Date): string {
	return d.toISOString().slice(0, 10)
}

function getDateNDaysAgo(todayIso: string, days: number): string {
	let d = new Date(todayIso + "T00:00:00")
	d.setDate(d.getDate() - days)
	return toISODate(d)
}

type Trend = "up" | "down" | "flat"

type IbaadahStats = {
	currentStreak: number
	longestStreak: number
	consistency7: number
	entriesByType: Record<IbaadahType, number>
	trend: Trend
}

function computeIbaadahStats(
	entries: Loaded<typeof IbaadahEntry>[],
	todayKey: string,
): IbaadahStats {
	let byDate = new Map<string, Loaded<typeof IbaadahEntry>[]>()
	for (let e of entries) {
		if (!byDate.has(e.date)) byDate.set(e.date, [])
		byDate.get(e.date)!.push(e)
	}

	let entriesByType: Record<IbaadahType, number> = {
		salah: 0,
		quran: 0,
		dhikr: 0,
		sadaqa: 0,
		fasting: 0,
		nawaafil: 0,
		custom: 0,
	}
	for (let e of entries) {
		entriesByType[e.type]++
	}

	let currentStreak = 0
	let longestStreak = 0
	let cursor = todayKey
	for (let i = 0; i < 60; i++) {
		if (byDate.has(cursor)) {
			currentStreak++
			longestStreak = Math.max(longestStreak, currentStreak)
		} else {
			if (currentStreak > 0) break
		}
		let d = new Date(cursor + "T00:00:00")
		d.setDate(d.getDate() - 1)
		cursor = toISODate(d)
	}

	let last7Keys: string[] = []
	{
		let d = new Date(todayKey + "T00:00:00")
		for (let i = 0; i < 7; i++) {
			last7Keys.unshift(toISODate(d))
			d.setDate(d.getDate() - 1)
		}
	}
	let daysWithEntries = last7Keys.filter(k => byDate.has(k)).length
	let consistency7 = last7Keys.length === 0 ? 0 : daysWithEntries / last7Keys.length

	let recent3 = last7Keys.slice(-3).filter(k => byDate.has(k)).length
	let prev3 = last7Keys.slice(0, 3).filter(k => byDate.has(k)).length
	let trend: Trend =
		recent3 > prev3 ? "up" : recent3 < prev3 ? "down" : "flat"

	return {
		currentStreak,
		longestStreak,
		consistency7,
		entriesByType,
		trend,
	}
}

function buildMotivationMessage(input: {
	streak: number
	consistency7: number
	trend: Trend
	mood?: ReflectionMood
	hasReflectionToday: boolean
}) {
	let parts: string[] = []

	if (input.streak >= 5) {
		parts.push(`You are on a ${input.streak}-day streak. Keep this beautiful consistency going.`)
	} else if (input.streak >= 1) {
		parts.push(`You have started a ${input.streak}-day streak. This is a great time to build the habit.`)
	} else {
		parts.push("Today is a fresh page. Even one small act of worship counts.")
	}

	if (input.consistency7 >= 0.8) {
		parts.push("Over the last week you were consistent on most days. May Allah keep you firm.")
	} else if (input.consistency7 >= 0.4) {
		parts.push("Your last week had a mix of active and quiet days. Choose one small action to anchor today.")
	} else {
		parts.push("The last days were lighter. Starting again with a single sincere act is already success.")
	}

	if (input.trend === "up") {
		parts.push("Your recent days show an upward trend compared to the start of the week.")
	} else if (input.trend === "down") {
		parts.push("Things slowed down a bit recently. Returning with humility is itself an act of worship.")
	}

	if (input.mood === "stressed" || input.mood === "sad") {
		parts.push("Lean on short, gentle acts today: a sincere du'a, a few verses, or simple morning adhkaar.")
	} else if (input.mood === "grateful" || input.mood === "happy") {
		parts.push("Channel your gratitude into a little extra: a voluntary rak'ah, a page of Qur'an, or quiet dhikr.")
	}

	if (!input.hasReflectionToday) {
		parts.push("After your Ibaadah today, write a short reflection so future you can remember how this day felt.")
	}

	return parts.join(" ")
}

type InsightRange = "week" | "month"

function buildInsights(input: {
	range: InsightRange
	startDate: string
	endDate: string
	entries: Loaded<typeof IbaadahEntry>[]
	reflections: Loaded<typeof Reflection>[]
	pointsHistory: Loaded<typeof PointsHistory>[]
}) {
	let totalEntries = input.entries.length
	let entriesByType: Record<IbaadahType, number> = {
		salah: 0,
		quran: 0,
		dhikr: 0,
		sadaqa: 0,
		fasting: 0,
		nawaafil: 0,
		custom: 0,
	}
	for (let e of input.entries) {
		let type = e.type as IbaadahType
		entriesByType[type]++
	}

	let reflectionsCount = input.reflections.length
	let moodsCount: Partial<Record<ReflectionMood, number>> = {}
	for (let r of input.reflections) {
		if (!r.mood) continue
		let mood = r.mood as ReflectionMood
		moodsCount[mood] = (moodsCount[mood] || 0) + 1
	}

	let pointsTotal = input.pointsHistory.reduce((sum, p) => sum + p.amount, 0)
	let pointsByCategory: Record<string, number> = {}
	for (let p of input.pointsHistory) {
		pointsByCategory[p.category] = (pointsByCategory[p.category] || 0) + p.amount
	}

	let byDate = new Map<string, number>()
	for (let e of input.entries) {
		byDate.set(e.date, (byDate.get(e.date) || 0) + 1)
	}
	let bestDay = null as null | { date: string; count: number }
	for (let [date, count] of byDate.entries()) {
		if (!bestDay || count > bestDay.count) bestDay = { date, count }
	}

	return {
		range: input.range,
		startDate: input.startDate,
		endDate: input.endDate,
		totalEntries,
		entriesByType,
		reflectionsCount,
		moodsCount,
		pointsTotal,
		pointsByCategory,
		bestDay,
	}
}

