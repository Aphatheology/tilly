import { cn } from "#app/lib/utils"
import { format, subDays, isToday } from "date-fns"
import { Calendar as CalendarIcon } from "react-bootstrap-icons"
import { T } from "#shared/intl/setup"
import type { IbaadahEntry } from "#shared/schema/ibaadah"
import { co } from "jazz-tools"

interface IbaadahCalendarProps {
	entries: Array<co.loaded<typeof IbaadahEntry>>
	selectedDate: string | null
	onDateSelect: (date: string | null) => void
}

export function IbaadahCalendar({
	entries,
	selectedDate,
	onDateSelect,
}: IbaadahCalendarProps) {
	let today = new Date()
	let days = Array.from({ length: 5 }, (_, i) => {
		let date = subDays(today, 4 - i)
		return {
			date,
			dateString: format(date, "yyyy-MM-dd"),
			isToday: isToday(date),
		}
	})

	function getEntryCountForDate(dateString: string): number {
		return entries.filter(e => e.date === dateString).length
	}

	return (
		<div className="mb-6">
			<div className="mb-4 flex items-center gap-2">
				<CalendarIcon className="size-5" />
				<h2 className="text-lg font-semibold">
					<T k="ibaadah.calendar.title" />
				</h2>
			</div>
			<div className="grid grid-cols-5 gap-2">
				{days.map(day => {
					let entryCount = getEntryCountForDate(day.dateString)
					let isSelected = selectedDate === day.dateString

					return (
						<button
							key={day.dateString}
							type="button"
							onClick={() => onDateSelect(isSelected ? null : day.dateString)}
							className={cn(
								"relative flex flex-col items-center justify-center gap-1 rounded-lg border-2 p-3 transition-all",
								"hover:border-primary hover:bg-primary/5",
								isSelected
									? "border-primary bg-primary/10"
									: "border-border bg-card",
								day.isToday && "ring-primary/20 ring-2",
							)}
						>
							<div
								className={cn(
									"text-xs font-medium uppercase",
									day.isToday ? "text-primary" : "text-muted-foreground",
								)}
							>
								{format(day.date, "EEE")}
							</div>
							<div
								className={cn(
									"text-xl font-bold",
									isSelected ? "text-primary" : "text-foreground",
								)}
							>
								{format(day.date, "d")}
							</div>
							{entryCount > 0 && (
								<div
									className={cn(
										"absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-xs font-bold",
										isSelected
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground",
									)}
								>
									{entryCount > 9 ? "9+" : entryCount}
								</div>
							)}
						</button>
					)
				})}
			</div>
		</div>
	)
}
