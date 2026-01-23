import {
	createFileRoute,
	notFound,
	useElementScrollRestoration,
} from "@tanstack/react-router"
import { UserAccount } from "#shared/schema/user"
import { useAccount } from "jazz-tools/react"
import { type ResolveQuery } from "jazz-tools"
import { IbaadahEntryListItem } from "#app/features/ibaadah-entry-list-item"
import { TypographyH1 } from "#shared/ui/typography"
import { Button } from "#shared/ui/button"
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#shared/ui/empty"
import { Plus, Calendar as CalendarIcon } from "react-bootstrap-icons"
import { type ReactNode } from "react"
import { NewIbaadahEntry } from "#app/features/new-ibaadah-entry"
import { T, useIntl } from "#shared/intl/setup"
import { IbaadahEntry } from "#shared/schema/ibaadah"
import { co } from "jazz-tools"
import {
	defaultRangeExtractor,
	useWindowVirtualizer,
} from "@tanstack/react-virtual"
import { cn } from "#app/lib/utils"
import { useState } from "react"
import { IbaadahCalendar } from "#app/features/ibaadah-calendar"
import { format, parseISO } from "date-fns"

export let Route = createFileRoute("/_app/ibaadah")({
	loader: async ({ context }) => {
		if (!context.me) throw notFound()
		let loadedMe = await UserAccount.load(context.me.$jazz.id, {
			resolve: ibaadahResolve,
		})
		if (!loadedMe.$isLoaded) throw notFound()
		return { me: loadedMe }
	},
	component: IbaadahEntries,
})

let ibaadahResolve = {
	root: {
		ibaadahEntries: { $each: true },
	},
} as const satisfies ResolveQuery<typeof UserAccount>

function IbaadahEntries() {
	let { me: data } = Route.useLoaderData()

	let subscribedMe = useAccount(UserAccount, { resolve: ibaadahResolve })

	let currentMe = subscribedMe.$isLoaded ? subscribedMe : data

	let today = format(new Date(), "yyyy-MM-dd")
	let [selectedDate, setSelectedDate] = useState<string | null>(today)

	let allEntries = Array.from(
		currentMe.root.ibaadahEntries?.values() || [],
	).filter(
		(e): e is Extract<typeof e, { $isLoaded: true }> => e?.$isLoaded === true,
	)

	let displayedEntries = selectedDate
		? allEntries.filter(e => e.date === selectedDate)
		: []

	let sortedEntries = [...displayedEntries].sort((a, b) => {
		return b.createdAt.getTime() - a.createdAt.getTime()
	})

	let virtualItems: Array<VirtualItem> = []
	virtualItems.push({ type: "heading" })
	virtualItems.push({ type: "calendar" })

	if (selectedDate) {
		if (sortedEntries.length === 0) {
			virtualItems.push({ type: "no-entries-for-date", date: selectedDate })
		} else {
			sortedEntries.forEach(entry => {
				virtualItems.push({
					type: "entry",
					entry,
				})
			})
		}
	} else {
		virtualItems.push({ type: "select-date" })
	}

	virtualItems.push({ type: "spacer" })

	let scrollEntry = useElementScrollRestoration({
		getElement: () => window,
	})

	let virtualizer = useWindowVirtualizer({
		count: virtualItems.length,
		rangeExtractor: range => {
			return [0, 1, ...defaultRangeExtractor(range).filter(i => i > 1)]
		},
		estimateSize: () => 100,
		overscan: 5,
		initialOffset: scrollEntry?.scrollY,
		measureElement: (element, _entry, instance) => {
			let direction = instance.scrollDirection
			if (direction === "forward" || direction === null) {
				return element.getBoundingClientRect().height
			} else {
				let indexKey = Number(element.getAttribute("data-index"))
				let cachedMeasurement =
					instance.measurementsCache[indexKey as number]?.size
				return cachedMeasurement || element.getBoundingClientRect().height
			}
		},
	})

	let virtualRows = virtualizer.getVirtualItems()

	return (
		<>
			<div
				className="md:mt-12"
				style={{
					height: virtualizer.getTotalSize(),
					width: "100%",
					position: "relative",
				}}
			>
				{virtualRows.map(virtualRow => {
					let item = virtualItems.at(virtualRow.index)
					if (!item) return null

					let itemIsEntry = item.type === "entry"
					let nextItemIsEntry =
						virtualItems.at(virtualRow.index + 1)?.type === "entry"

					return (
						<div
							key={virtualRow.key}
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							className={cn(
								"absolute top-0 left-0 w-full",
								itemIsEntry && nextItemIsEntry && "border-border border-b",
							)}
							style={{ transform: `translateY(${virtualRow.start}px)` }}
						>
							{renderVirtualItem(item, {
								me: currentMe,
								allEntries,
								selectedDate,
								setSelectedDate,
							})}
						</div>
					)
				})}
			</div>
		</>
	)
}

type VirtualItem =
	| { type: "heading" }
	| { type: "calendar" }
	| {
			type: "entry"
			entry: co.loaded<typeof IbaadahEntry>
	  }
	| { type: "no-entries-for-date"; date: string }
	| { type: "select-date" }
	| { type: "spacer" }

function renderVirtualItem(
	item: VirtualItem,
	options: {
		me: co.loaded<typeof UserAccount>
		allEntries: Array<co.loaded<typeof IbaadahEntry>>
		selectedDate: string | null
		setSelectedDate: (date: string | null) => void
	},
): ReactNode {
	switch (item.type) {
		case "heading":
			return <HeadingSection />

		case "calendar":
			return (
				<div>
					<IbaadahCalendar
						entries={options.allEntries}
						selectedDate={options.selectedDate}
						onDateSelect={options.setSelectedDate}
					/>
					{options.selectedDate && (
						<div className="mb-4 flex justify-end">
							<NewIbaadahEntry date={options.selectedDate}>
								<Button>
									<Plus className="size-4" />
									<span className="ml-2">
										<T k="ibaadah.record" />
									</span>
								</Button>
							</NewIbaadahEntry>
						</div>
					)}
				</div>
			)

		case "entry":
			return (
				<IbaadahEntryListItem
					entry={item.entry}
					me={options.me}
					searchQuery=""
				/>
			)

		case "no-entries-for-date":
			return <NoEntriesForDateState date={item.date} />

		case "select-date":
			return <SelectDateState />

		case "spacer":
			return <Spacer />

		default:
			return null
	}
}

function HeadingSection() {
	let t = useIntl()

	return (
		<>
			<title>{t("ibaadah.entries.pageTitle")}</title>
			<TypographyH1>
				<T k="ibaadah.entries.title" />
			</TypographyH1>
		</>
	)
}

function NoEntriesForDateState({ date }: { date: string }) {
	let formattedDate = format(parseISO(date), "EEEE, MMMM d, yyyy")

	return (
		<div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<CalendarIcon />
					</EmptyMedia>
					<EmptyTitle>
						<T k="ibaadah.entries.empty.forDate" />
					</EmptyTitle>
					<EmptyDescription>
						{formattedDate}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
			<NewIbaadahEntry date={date}>
				<Button>
					<Plus className="size-4" />
					<span className="ml-2">
						<T k="ibaadah.record" />
					</span>
				</Button>
			</NewIbaadahEntry>
		</div>
	)
}

function SelectDateState() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<CalendarIcon />
					</EmptyMedia>
					<EmptyTitle>
						<T k="ibaadah.calendar.selectDate" />
					</EmptyTitle>
					<EmptyDescription>
						<T k="ibaadah.calendar.selectDate.description" />
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	)
}

function Spacer() {
	return <div className="h-20" />
}

