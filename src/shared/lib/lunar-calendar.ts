export function isRamadan(): boolean {
	let now = new Date()
	let year = now.getFullYear()
	let month = now.getMonth() + 1

	let ramadanStartDates: Record<number, { month: number; day: number }> = {
		2024: { month: 3, day: 11 },
		2025: { month: 2, day: 28 },
		2026: { month: 2, day: 18 },
		2027: { month: 2, day: 7 },
		2028: { month: 1, day: 26 },
	}

	let ramadanEndDates: Record<number, { month: number; day: number }> = {
		2024: { month: 4, day: 9 },
		2025: { month: 3, day: 29 },
		2026: { month: 3, day: 19 },
		2027: { month: 3, day: 8 },
		2028: { month: 2, day: 25 },
	}

	let start = ramadanStartDates[year]
	let end = ramadanEndDates[year]

	if (!start || !end) {
		return false
	}

	let currentDate = now.getDate()

	if (month === start.month && currentDate >= start.day) {
		return true
	}

	if (month === end.month && currentDate <= end.day) {
		return true
	}

	if (month > start.month && month < end.month) {
		return true
	}

	return false
}

export function isMondayOrThursday(date: Date = new Date()): boolean {
	let dayOfWeek = date.getDay()
	return dayOfWeek === 1 || dayOfWeek === 4
}

export function isAyyaamulBeed(date: Date = new Date()): boolean {
	let lunarDate = getLunarDate(date)
	return lunarDate >= 13 && lunarDate <= 15
}

function getLunarDate(gregorianDate: Date): number {
	let julianDay = gregorianToJulian(gregorianDate)
	let hijriDate = julianToHijri(julianDay)
	return hijriDate.day
}

function gregorianToJulian(date: Date): number {
	let year = date.getFullYear()
	let month = date.getMonth() + 1
	let day = date.getDate()

	if (month <= 2) {
		year -= 1
		month += 12
	}

	let a = Math.floor(year / 100)
	let b = 2 - a + Math.floor(a / 4)

	return (
		Math.floor(365.25 * (year + 4716)) +
		Math.floor(30.6001 * (month + 1)) +
		day +
		b -
		1524.5
	)
}

function julianToHijri(julianDay: number): {
	year: number
	month: number
	day: number
} {
	julianDay = Math.floor(julianDay) + 0.5

	let hijriEpoch = 1948439.5
	let daysSinceHijriEpoch = julianDay - hijriEpoch

	if (daysSinceHijriEpoch < 0) {
		return { year: 1, month: 1, day: 1 }
	}

	let year = Math.floor((daysSinceHijriEpoch * 30) / 10631) + 1
	let remainder = daysSinceHijriEpoch - Math.floor((10631 * (year - 1)) / 30)
	let month = Math.min(12, Math.floor((remainder * 30) / 10631) + 1)
	let day = remainder - Math.floor((10631 * (month - 1)) / 30) + 1

	return { year, month, day: Math.floor(day) }
}
