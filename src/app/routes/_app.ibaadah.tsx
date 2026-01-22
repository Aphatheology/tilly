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
import { Input } from "#shared/ui/input"
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#shared/ui/empty"
import { Plus, X, Search, Calendar } from "react-bootstrap-icons"
import { useAutoFocusInput } from "#app/hooks/use-auto-focus-input"
import { useDeferredValue, useId, type ReactNode, type RefObject } from "react"
import { NewIbaadahEntry } from "#app/features/new-ibaadah-entry"
import { T, useIntl } from "#shared/intl/setup"
import { IbaadahEntry } from "#shared/schema/ibaadah"
import { co } from "jazz-tools"
import {
	defaultRangeExtractor,
	useWindowVirtualizer,
} from "@tanstack/react-virtual"
import { cn } from "#app/lib/utils"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#shared/ui/select"
import { useState } from "react"
import type { IbaadahType } from "#shared/schema/ibaadah"

export let Route = createFileRoute("/_app/ibaadah")({
	loader: async ({ context }) => {
		if (!context.me) throw notFound()
		let loadedMe = await UserAccount.load(context.me.$jazz.id, {
			resolve,
		})
		if (!loadedMe.$isLoaded) throw notFound()
		return { me: loadedMe }
	},
	component: IbaadahEntries,
})

let resolve = {
	root: {
		ibaadahEntries: { $each: true },
	},
} as const satisfies ResolveQuery<typeof UserAccount>

function IbaadahEntries() {
	let { me: data } = Route.useLoaderData()

	let subscribedMe = useAccount(UserAccount, { resolve })

	let currentMe = subscribedMe.$isLoaded ? subscribedMe : data

	let [searchQuery, setSearchQuery] = useState("")
	let [typeFilter, setTypeFilter] = useState<IbaadahType | "all">("all")
	let [dateFilter, setDateFilter] = useState("")
	let deferredSearchQuery = useDeferredValue(searchQuery)

	let allEntries = Array.from(
		currentMe.root.ibaadahEntries?.values() || [],
	).filter(
		(e): e is Extract<typeof e, { $isLoaded: true }> => e?.$isLoaded === true,
	)

	let filteredEntries = allEntries.filter(entry => {
		if (typeFilter !== "all" && entry.type !== typeFilter) return false

		if (dateFilter && entry.date !== dateFilter) return false

		if (deferredSearchQuery) {
			let query = deferredSearchQuery.toLowerCase()
			let matchesType = entry.type.toLowerCase().includes(query)
			let matchesNotes = entry.notes?.toLowerCase().includes(query)
			let matchesReflection = entry.reflection?.toLowerCase().includes(query)

			let matchesValue = false
			switch (entry.value.type) {
				case "salah":
					matchesValue = entry.value.prayers.some(p =>
						p.toLowerCase().includes(query),
					)
					break
				case "quran":
					matchesValue =
						entry.value.pages?.toString().includes(query) ||
						entry.value.minutes?.toString().includes(query) ||
						false
					break
				case "dhikr":
					matchesValue =
						entry.value.count.toString().includes(query) ||
						entry.value.dhikrType?.toLowerCase().includes(query) ||
						false
					break
				case "sadaqa":
					matchesValue =
						entry.value.amount?.toString().includes(query) ||
						entry.value.description?.toLowerCase().includes(query) ||
						false
					break
				case "fasting":
					matchesValue = query.includes("fasting") || query.includes("ramadan")
					break
				case "custom":
					matchesValue = entry.value.value.toLowerCase().includes(query)
					break
			}

			if (
				!matchesType &&
				!matchesNotes &&
				!matchesReflection &&
				!matchesValue
			) {
				return false
			}
		}

		return true
	})

	let sortedEntries = [...filteredEntries].sort((a, b) => {
		if (a.date !== b.date) {
			return b.date.localeCompare(a.date)
		}
		return b.createdAt.getTime() - a.createdAt.getTime()
	})

	let virtualItems: Array<VirtualItem> = []
	virtualItems.push({ type: "heading" })

	if (allEntries.length > 0) {
		virtualItems.push({ type: "filters" })
	} else {
		virtualItems.push({ type: "no-entries" })
	}

	if (allEntries.length > 0) {
		if (sortedEntries.length === 0) {
			virtualItems.push({
				type: "no-results",
				searchQuery: deferredSearchQuery,
			})
		} else {
			sortedEntries.forEach(entry => {
				virtualItems.push({
					type: "entry",
					entry,
				})
			})
			virtualItems.push({ type: "spacer" })
		}
	}

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
								searchQuery: deferredSearchQuery,
								me: currentMe,
								setSearchQuery,
								typeFilter,
								setTypeFilter,
								dateFilter,
								setDateFilter,
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
	| { type: "filters" }
	| {
			type: "entry"
			entry: co.loaded<typeof IbaadahEntry>
	  }
	| { type: "no-results"; searchQuery: string }
	| { type: "no-entries" }
	| { type: "spacer" }

function renderVirtualItem(
	item: VirtualItem,
	options: {
		searchQuery: string
		me: co.loaded<typeof UserAccount>
		setSearchQuery: (query: string) => void
		typeFilter: IbaadahType | "all"
		setTypeFilter: (filter: IbaadahType | "all") => void
		dateFilter: string
		setDateFilter: (filter: string) => void
	},
): ReactNode {
	switch (item.type) {
		case "heading":
			return <HeadingSection />

		case "filters":
			return (
				<FiltersSection
					searchQuery={options.searchQuery}
					setSearchQuery={options.setSearchQuery}
					typeFilter={options.typeFilter}
					setTypeFilter={options.setTypeFilter}
					dateFilter={options.dateFilter}
					setDateFilter={options.setDateFilter}
				/>
			)

		case "entry":
			return (
				<IbaadahEntryListItem
					entry={item.entry}
					me={options.me}
					searchQuery={options.searchQuery}
				/>
			)

		case "no-results":
			return <NoSearchResultsState searchQuery={item.searchQuery} />

		case "no-entries":
			return <NoEntriesState />

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

function FiltersSection({
	searchQuery,
	setSearchQuery,
	typeFilter,
	setTypeFilter,
	dateFilter,
	setDateFilter,
}: {
	searchQuery: string
	setSearchQuery: (query: string) => void
	typeFilter: IbaadahType | "all"
	setTypeFilter: (filter: IbaadahType | "all") => void
	dateFilter: string
	setDateFilter: (filter: string) => void
}) {
	let autoFocusRef = useAutoFocusInput() as RefObject<HTMLInputElement>
	let t = useIntl()
	let searchInputId = useId()

	return (
		<div className="mt-6 mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
			<div className="relative w-full md:w-auto md:flex-1">
				<label htmlFor={searchInputId} className="sr-only">
					{t("reminders.search.placeholder")}
				</label>
				<Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2 transform" />
				<Input
					ref={autoFocusRef}
					id={searchInputId}
					name="ibaadah-search"
					type="search"
					enterKeyHint="search"
					placeholder={t("reminders.search.placeholder")}
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className="w-full pl-10"
				/>
			</div>
			{searchQuery !== "" ? (
				<Button variant="outline" onClick={() => setSearchQuery("")}>
					<X className="size-4" />
					<span className="sr-only md:not-sr-only">
						<T k="common.clear" />
					</span>
				</Button>
			) : null}
			<Select
				value={typeFilter}
				onValueChange={v => setTypeFilter(v as IbaadahType | "all")}
			>
				<SelectTrigger className="w-full md:w-[180px]">
					<SelectValue placeholder={t("ibaadah.entries.filter.type")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">
						<T k="common.all" />
					</SelectItem>
					<SelectItem value="salah">
						<T k="dashboard.salah.title" />
					</SelectItem>
					<SelectItem value="quran">
						<T k="dashboard.quran.title" />
					</SelectItem>
					<SelectItem value="dhikr">
						<T k="dashboard.dhikr.title" />
					</SelectItem>
					<SelectItem value="sadaqa">
						<T k="dashboard.sadaqa.title" />
					</SelectItem>
					<SelectItem value="fasting">
						<T k="dashboard.fasting.title" />
					</SelectItem>
					<SelectItem value="custom">
						<T k="ibaadah.habit.form.type.custom" />
					</SelectItem>
				</SelectContent>
			</Select>
			<Input
				type="date"
				value={dateFilter}
				onChange={e => setDateFilter(e.target.value)}
				className="w-full md:w-[180px]"
				placeholder={t("ibaadah.entries.filter.date")}
			/>
			{dateFilter !== "" ? (
				<Button variant="outline" onClick={() => setDateFilter("")}>
					<X className="size-4" />
				</Button>
			) : null}
			<NewIbaadahEntry>
				<Button>
					<Plus className="size-4" />
					<span className="sr-only md:not-sr-only">
						<T k="dashboard.add" />
					</span>
				</Button>
			</NewIbaadahEntry>
		</div>
	)
}

function NoEntriesState() {
	return (
		<div className="flex flex-col items-center justify-center gap-8 py-12 text-center">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Calendar />
					</EmptyMedia>
					<EmptyTitle>
						<T k="ibaadah.entries.empty" />
					</EmptyTitle>
					<EmptyDescription>
						<T k="ibaadah.entries.empty.description" />
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	)
}

function NoSearchResultsState({ searchQuery }: { searchQuery: string }) {
	return (
		<div className="container mx-auto max-w-6xl px-3 py-6">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Search />
					</EmptyMedia>
					<EmptyTitle>
						<T
							k="reminders.noResults.message"
							params={{ query: searchQuery }}
						/>
					</EmptyTitle>
					<EmptyDescription>
						<T k="reminders.noResults.suggestion" />
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	)
}

function Spacer() {
	return <div className="h-20" />
}
