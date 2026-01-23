export type NawaafilType =
	| "sunan-rawatib"
	| "witr"
	| "tahajud"
	| "duhaa"
	| "ishrooq"
	| "custom"

export interface Nawaafil {
	id: string
	type: NawaafilType
	name: string
	nameArabic: string
	description: string
	rakaat: number
	time?:
		| "before-fajr"
		| "after-dhuhr"
		| "after-maghrib"
		| "after-isha"
		| "night"
		| "morning"
		| "after-sunrise"
}

export const nawaafil: Nawaafil[] = [
	{
		id: "sunan-rawatib-fajr",
		type: "sunan-rawatib",
		name: "Sunnah before Fajr",
		nameArabic: "سنة الفجر",
		description: "2 rakaat before Fajr prayer",
		rakaat: 2,
		time: "before-fajr",
	},
	{
		id: "sunan-rawatib-dhuhr-before",
		type: "sunan-rawatib",
		name: "Sunnah before Dhuhr",
		nameArabic: "سنة الظهر قبل",
		description: "4 rakaat before Dhuhr prayer",
		rakaat: 4,
		time: "before-fajr",
	},
	{
		id: "sunan-rawatib-dhuhr-after",
		type: "sunan-rawatib",
		name: "Sunnah after Dhuhr",
		nameArabic: "سنة الظهر بعد",
		description: "2 rakaat after Dhuhr prayer",
		rakaat: 2,
		time: "after-dhuhr",
	},
	{
		id: "sunan-rawatib-maghrib",
		type: "sunan-rawatib",
		name: "Sunnah after Maghrib",
		nameArabic: "سنة المغرب",
		description: "2 rakaat after Maghrib prayer",
		rakaat: 2,
		time: "after-maghrib",
	},
	{
		id: "sunan-rawatib-isha",
		type: "sunan-rawatib",
		name: "Sunnah after Isha",
		nameArabic: "سنة العشاء",
		description: "2 rakaat after Isha prayer",
		rakaat: 2,
		time: "after-isha",
	},
	{
		id: "witr",
		type: "witr",
		name: "Witr",
		nameArabic: "الوتر",
		description: "Witr prayer (odd-numbered rakaat, usually 1 or 3)",
		rakaat: 1,
		time: "after-isha",
	},
	{
		id: "tahajud",
		type: "tahajud",
		name: "Tahajud",
		nameArabic: "التهجد",
		description: "Night prayer performed after sleeping",
		rakaat: 2,
		time: "night",
	},
	{
		id: "duhaa",
		type: "duhaa",
		name: "Duhaa",
		nameArabic: "الضحى",
		description: "Forenoon prayer (after sunrise, before Dhuhr)",
		rakaat: 2,
		time: "morning",
	},
	{
		id: "ishrooq",
		type: "ishrooq",
		name: "Ishrooq",
		nameArabic: "الإشراق",
		description:
			"Prayer performed after sunrise (about 15-20 minutes after Fajr)",
		rakaat: 2,
		time: "after-sunrise",
	},
]

export function getNawaafilByType(type: NawaafilType): Nawaafil[] {
	return nawaafil.filter(n => n.type === type)
}

export function getNawaafilById(id: string): Nawaafil | undefined {
	return nawaafil.find(n => n.id === id)
}

export function getSunanRawatib(): Nawaafil[] {
	return nawaafil.filter(n => n.type === "sunan-rawatib")
}
