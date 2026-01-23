import type { ReflectionMood } from "#shared/schema/reflection"

export type InspirationType = "verse" | "hadith"

export type Inspiration = {
	id: string
	type: InspirationType
	text: string
	reference: string
	tags?: ReflectionMood[]
}

let inspirations: Inspiration[] = [
	{
		id: "verse-1",
		type: "verse",
		text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
		reference: "Qur'an 2:152",
		tags: ["grateful", "happy"],
	},
	{
		id: "verse-2",
		type: "verse",
		text: "Indeed, with hardship comes ease.",
		reference: "Qur'an 94:6",
		tags: ["stressed", "sad"],
	},
	{
		id: "verse-3",
		type: "verse",
		text: "And those who strive for Us – We will surely guide them to Our ways.",
		reference: "Qur'an 29:69",
		tags: ["inspired", "neutral"],
	},
	{
		id: "hadith-1",
		type: "hadith",
		text: "The most beloved deeds to Allah are those that are most consistent, even if they are small.",
		reference: "Bukhari",
		tags: ["inspired", "neutral", "grateful"],
	},
	{
		id: "hadith-2",
		type: "hadith",
		text: "Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your busyness, and your life before your death.",
		reference: "Hakim",
		tags: ["inspired", "stressed"],
	},
]

export function getDailyInspiration(date: Date, mood?: ReflectionMood): Inspiration {
	let candidates = inspirations
	if (mood) {
		let tagged = inspirations.filter(i => i.tags && i.tags.includes(mood))
		if (tagged.length > 0) candidates = tagged
	}
	let dayOfYear = getDayOfYear(date)
	let index = dayOfYear % candidates.length
	return candidates[index]
}

function getDayOfYear(date: Date): number {
	let start = new Date(date.getFullYear(), 0, 0)
	let diff = date.getTime() - start.getTime()
	let oneDay = 1000 * 60 * 60 * 24
	return Math.floor(diff / oneDay)
}

