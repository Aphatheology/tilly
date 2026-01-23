import { co, z } from "jazz-tools"

export type IbaadahType =
	| "salah"
	| "quran"
	| "dhikr"
	| "sadaqa"
	| "fasting"
	| "nawaafil"
	| "custom"

export type SalahPrayer = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"

export type QuranUnit = "suurah" | "jizu" | "hizbu" | "pages"

export type FastingType =
	| "ramadan"
	| "monday-thursday"
	| "ayyaamul-beed"
	| "custom"

export let IbaadahValue = z.union([
	z.object({
		type: z.literal("salah"),
		prayers: z.array(z.enum(["fajr", "dhuhr", "asr", "maghrib", "isha"])),
	}),
	z.object({
		type: z.literal("quran"),
		unit: z.enum(["suurah", "jizu", "hizbu", "pages"]),
		values: z.array(z.number()),
		pages: z.number().optional(),
		minutes: z.number().optional(),
	}),
	z.object({
		type: z.literal("dhikr"),
		adhkaarIds: z.array(z.string()).optional(),
		customDhikr: z.string().optional(),
		count: z.number().optional(),
	}),
	z.object({
		type: z.literal("sadaqa"),
		amount: z.number().optional(),
		description: z.string().optional(),
	}),
	z.object({
		type: z.literal("fasting"),
		fastingType: z.enum([
			"ramadan",
			"monday-thursday",
			"ayyaamul-beed",
			"custom",
		]),
		customDescription: z.string().optional(),
	}),
	z.object({
		type: z.literal("nawaafil"),
		nawaafilIds: z.array(z.string()).optional(),
		customNawaafil: z
			.array(
				z.object({
					name: z.string(),
					rakaat: z.number().optional(),
				}),
			)
			.optional(),
	}),
	z.object({
		type: z.literal("custom"),
		value: z.string(),
	}),
])

export let IbaadahEntry = co.map({
	version: z.literal(2),
	type: z.enum([
		"salah",
		"quran",
		"dhikr",
		"sadaqa",
		"fasting",
		"nawaafil",
		"custom",
	]),
	date: z.string(),
	value: IbaadahValue,
	notes: z.string().optional(),
	reflection: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export let IbaadahHabit = co.map({
	version: z.literal(2),
	name: z.string(),
	type: z.enum([
		"salah",
		"quran",
		"dhikr",
		"sadaqa",
		"fasting",
		"nawaafil",
		"custom",
	]),
	description: z.string().optional(),
	goal: z
		.object({
			daily: z.boolean().optional(),
			weekly: z.boolean().optional(),
			monthly: z.boolean().optional(),
			target: z.number().optional(),
		})
		.optional(),
	enabled: z.boolean().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export let CustomNawaafilTemplate = co.map({
	version: z.literal(1),
	name: z.string(),
	rakaat: z.number().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export let CustomDhikrTemplate = co.map({
	version: z.literal(1),
	name: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export let IbaadahSettings = co.map({
	version: z.literal(1),
	dailyGoals: z
		.object({
			salah: z.number().optional(),
			quranPages: z.number().optional(),
			quranMinutes: z.number().optional(),
			dhikrCount: z.number().optional(),
		})
		.optional(),
	reminderTimes: z
		.object({
			fajr: z.string().optional(),
			dhuhr: z.string().optional(),
			asr: z.string().optional(),
			maghrib: z.string().optional(),
			isha: z.string().optional(),
		})
		.optional(),
	enableReminders: z.boolean().optional(),
	lastNotifiedPrayers: z
		.object({
			fajr: z.string().optional(),
			dhuhr: z.string().optional(),
			asr: z.string().optional(),
			maghrib: z.string().optional(),
			isha: z.string().optional(),
		})
		.optional(),
})
