import { co, z } from "jazz-tools"

export type PointCategory =
	| "salah"
	| "quran"
	| "dhikr"
	| "consistency"
	| "bonus"
	| "other"

export let PointsHistory = co.map({
	version: z.literal(1),
	amount: z.number(),
	reason: z.string(),
	category: z.enum([
		"salah",
		"quran",
		"dhikr",
		"consistency",
		"bonus",
		"other",
	]),
	date: z.string(), // ISO Date YYYY-MM-DD
	createdAt: z.date(),
})
