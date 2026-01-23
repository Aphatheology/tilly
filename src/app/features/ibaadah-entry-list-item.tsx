import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#shared/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from "#shared/ui/dropdown-menu"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#shared/ui/alert-dialog"
import { IbaadahEntry } from "#shared/schema/ibaadah"
import { UserAccount } from "#shared/schema/user"
import { co, type Loaded } from "jazz-tools"
import { PencilSquare, Trash, ThreeDotsVertical } from "react-bootstrap-icons"
import { useState } from "react"
import { IbaadahForm } from "./ibaadah-form"
import { format } from "date-fns"
import { toast } from "sonner"
import { de as dfnsDe } from "date-fns/locale"
import { useLocale, useIntl, T } from "#shared/intl/setup"
import {
	updateIbaadahEntry,
	deleteIbaadahEntry,
} from "#shared/tools/ibaadah-update"
import { tryCatch } from "#shared/lib/trycatch"
import { TextHighlight } from "#shared/ui/text-highlight"
import { transformFormDataToIbaadahValue } from "./ibaadah-form"
import type { IbaadahType, SalahPrayer } from "#shared/schema/ibaadah"
import { getSurahByNumber } from "#shared/data/quran-data"

export { IbaadahEntryListItem }

function IbaadahEntryListItem({
	entry,
	me,
	searchQuery,
	onEdit,
	onDelete,
}: {
	entry: co.loaded<typeof IbaadahEntry>
	me: Loaded<typeof UserAccount>
	searchQuery?: string
	onEdit?: (values: {
		type: IbaadahType
		date: string
		salahPrayers?: SalahPrayer[]
		quranPages?: number
		quranMinutes?: number
		dhikrCount?: number
		dhikrType?: string
		sadaqaAmount?: number
		sadaqaDescription?: string
		fastingIsRamadan?: boolean
		customValue?: string
		notes?: string
		reflection?: string
	}) => Promise<void>
	onDelete?: () => Promise<void>
}) {
	let t = useIntl()
	let locale = useLocale()
	let dfnsLocale = locale === "de" ? dfnsDe : undefined
	let [dialogOpen, setDialogOpen] = useState<"edit" | "delete" | undefined>()
	let [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
	let operations = useIbaadahEntryOperations({ entry, me, onEdit, onDelete })

	let entryDate = new Date(entry.date + "T00:00:00")
	let formattedDate = format(entryDate, "PPP", { locale: dfnsLocale })

	function formatEntryValue() {
		switch (entry.value.type) {
			case "salah": {
				return entry.value.prayers
					.map(p => t(`ibaadah.form.salah.${p}`))
					.join(", ")
			}
			case "quran": {
				let parts: string[] = []
				if ("values" in entry.value && entry.value.values) {
					if (entry.value.unit === "suurah") {
						let surahParts = entry.value.values.map(v => {
							let surah = getSurahByNumber(v)
							return surah
								? `${surah.number}. ${surah.nameArabic}`
								: `Surah ${v}`
						})
						parts.push(...surahParts)
					} else if (entry.value.unit === "jizu") {
						let juzParts = entry.value.values.map(v => `Juz ${v}`)
						parts.push(...juzParts)
					} else if (entry.value.unit === "hizbu") {
						let hizbParts = entry.value.values.map(v => `Hizb ${v}`)
						parts.push(...hizbParts)
					} else if (entry.value.unit === "pages") {
						let pageParts = entry.value.values.map(v => `${v} pages`)
						parts.push(...pageParts)
					}
				} else if ("value" in entry.value && entry.value.value !== undefined) {
					if (entry.value.unit === "suurah") {
						let surah = getSurahByNumber(entry.value.value)
						parts.push(
							surah
								? `${surah.number}. ${surah.nameArabic}`
								: `Surah ${entry.value.value}`,
						)
					} else if (entry.value.unit === "jizu") {
						parts.push(`Juz ${entry.value.value}`)
					} else if (entry.value.unit === "hizbu") {
						parts.push(`Hizb ${entry.value.value}`)
					} else if (entry.value.unit === "pages") {
						parts.push(`${entry.value.value} pages`)
					}
				}
				if (entry.value.pages) {
					parts.push(
						t("ibaadah.form.quran.pages.label") + ": " + entry.value.pages,
					)
				}
				if (entry.value.minutes) {
					parts.push(
						t("ibaadah.form.quran.minutes.label") + ": " + entry.value.minutes,
					)
				}
				return parts.join(", ") || "-"
			}
			case "dhikr": {
				let dhikrParts: string[] = []
				if (entry.value.adhkaarIds && entry.value.adhkaarIds.length > 0) {
					dhikrParts.push(`${entry.value.adhkaarIds.length} adhkaar`)
				}
				if (entry.value.customDhikr) {
					dhikrParts.push(entry.value.customDhikr)
				}
				if (entry.value.count) {
					dhikrParts.push(`Count: ${entry.value.count}`)
				}
				return dhikrParts.join(", ") || "-"
			}
			case "nawaafil": {
				let nawaafilParts: string[] = []
				if (entry.value.nawaafilIds && entry.value.nawaafilIds.length > 0) {
					nawaafilParts.push(`${entry.value.nawaafilIds.length} nawaafil`)
				}
				if (entry.value.customNawaafil) {
					if (Array.isArray(entry.value.customNawaafil)) {
						if (entry.value.customNawaafil.length > 0) {
							let customParts = entry.value.customNawaafil.map(
								c => `${c.name}${c.rakaat ? ` (${c.rakaat} rakaat)` : ""}`,
							)
							nawaafilParts.push(...customParts)
						}
					} else if (typeof entry.value.customNawaafil === "string") {
						if (entry.value.customNawaafil) {
							nawaafilParts.push(entry.value.customNawaafil)
						}
					}
				}
				return nawaafilParts.join(", ") || "-"
			}
			case "sadaqa": {
				let sadaqaParts: string[] = []
				if (entry.value.amount) {
					sadaqaParts.push(entry.value.amount.toString())
				}
				if (entry.value.description) {
					sadaqaParts.push(entry.value.description)
				}
				return sadaqaParts.join(" - ") || "-"
			}
			case "fasting": {
				let fastingParts: string[] = []
				if (entry.value.fastingType === "ramadan") {
					fastingParts.push(t("ibaadah.form.fasting.type.ramadan"))
				} else if (entry.value.fastingType === "monday-thursday") {
					fastingParts.push(t("ibaadah.form.fasting.type.mondayThursday"))
				} else if (entry.value.fastingType === "ayyaamul-beed") {
					fastingParts.push(t("ibaadah.form.fasting.type.ayyaamulBeed"))
				} else if (entry.value.fastingType === "custom") {
					fastingParts.push(
						entry.value.customDescription ||
							t("ibaadah.form.fasting.type.custom"),
					)
				}
				return fastingParts.join(", ") || "-"
			}
			case "custom":
				return entry.value.value
		}
	}

	let typeLabelMap: Record<IbaadahType, string> = {
		salah: t("dashboard.salah.title"),
		quran: t("dashboard.quran.title"),
		dhikr: t("dashboard.dhikr.title"),
		sadaqa: t("dashboard.sadaqa.title"),
		fasting: t("dashboard.fasting.title"),
		nawaafil: t("ibaadah.form.type.nawaafil"),
		custom: t("ibaadah.habit.form.type.custom"),
	}
	let typeLabel = typeLabelMap[entry.type]

	return (
		<>
			<div className="hover:bg-accent/50 flex items-start justify-between gap-3 p-4 transition-colors">
				<div className="min-w-0 flex-1 space-y-1">
					<div className="flex items-center gap-2 text-sm">
						<span className="font-medium">{typeLabel}</span>
						<span className="text-muted-foreground">•</span>
						<span className="text-muted-foreground">{formattedDate}</span>
					</div>
					<div className="text-sm">
						<TextHighlight text={formatEntryValue()} query={searchQuery} />
					</div>
					{entry.notes && (
						<div className="text-muted-foreground text-sm">
							<TextHighlight text={entry.notes} query={searchQuery} />
						</div>
					)}
					{entry.reflection && (
						<div className="text-muted-foreground text-sm italic">
							<TextHighlight text={entry.reflection} query={searchQuery} />
						</div>
					)}
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button className="hover:bg-accent rounded p-1">
							<ThreeDotsVertical className="size-4" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setDialogOpen("edit")}>
							<PencilSquare className="size-4" />
							<T k="common.edit" />
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setConfirmDeleteOpen(true)}
							className="text-destructive"
						>
							<Trash className="size-4" />
							<T k="common.delete" />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Dialog
				open={dialogOpen === "edit"}
				onOpenChange={open => setDialogOpen(open ? "edit" : undefined)}
			>
				<DialogContent
					titleSlot={
						<DialogHeader>
							<DialogTitle>
								<T k="ibaadah.edit.title" />
							</DialogTitle>
							<DialogDescription>
								<T k="ibaadah.edit.description" />
							</DialogDescription>
						</DialogHeader>
					}
				>
					<IbaadahForm
						defaultValues={{
							type: entry.type,
							date: entry.date,
							salahPrayers:
								entry.value.type === "salah"
									? (entry.value.prayers as SalahPrayer[])
									: undefined,
							quranUnit:
								entry.value.type === "quran" ? entry.value.unit : undefined,
							quranValues:
								entry.value.type === "quran"
									? "values" in entry.value && entry.value.values
										? entry.value.values
										: "value" in entry.value && entry.value.value !== undefined
											? [entry.value.value as number]
											: []
									: undefined,
							quranPages:
								entry.value.type === "quran" ? entry.value.pages : undefined,
							quranMinutes:
								entry.value.type === "quran" ? entry.value.minutes : undefined,
							adhkaarIds:
								entry.value.type === "dhikr"
									? entry.value.adhkaarIds
									: undefined,
							customDhikr:
								entry.value.type === "dhikr"
									? entry.value.customDhikr
									: undefined,
							dhikrCount:
								entry.value.type === "dhikr" ? entry.value.count : undefined,
							sadaqaAmount:
								entry.value.type === "sadaqa" ? entry.value.amount : undefined,
							sadaqaDescription:
								entry.value.type === "sadaqa"
									? entry.value.description
									: undefined,
							fastingType:
								entry.value.type === "fasting"
									? entry.value.fastingType
									: undefined,
							fastingCustomDescription:
								entry.value.type === "fasting"
									? entry.value.customDescription
									: undefined,
							nawaafilIds:
								entry.value.type === "nawaafil"
									? entry.value.nawaafilIds
									: undefined,
							customNawaafil:
								entry.value.type === "nawaafil" && entry.value.customNawaafil
									? Array.isArray(entry.value.customNawaafil)
										? entry.value.customNawaafil
										: typeof entry.value.customNawaafil === "string"
											? [
													{
														name: entry.value.customNawaafil,
														rakaat: entry.value.rakaat,
													},
												]
											: []
									: undefined,
							customValue:
								entry.value.type === "custom" ? entry.value.value : undefined,
							notes: entry.notes,
							reflection: entry.reflection,
						}}
						onSubmit={async values => {
							await operations.editEntry(values)
							setDialogOpen(undefined)
						}}
						onCancel={() => setDialogOpen(undefined)}
					/>
				</DialogContent>
			</Dialog>

			<AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<T k="ibaadah.delete.title" />
						</AlertDialogTitle>
						<AlertDialogDescription>
							<T k="ibaadah.delete.description" />
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<T k="common.cancel" />
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={async () => {
								await operations.deleteEntry()
								setConfirmDeleteOpen(false)
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							<T k="common.delete" />
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}

function useIbaadahEntryOperations({
	entry,
	me,
	onEdit,
	onDelete,
}: {
	entry: co.loaded<typeof IbaadahEntry>
	me: Loaded<typeof UserAccount>
	onEdit?: (values: {
		type: IbaadahType
		date: string
		salahPrayers?: SalahPrayer[]
		quranPages?: number
		quranMinutes?: number
		dhikrCount?: number
		dhikrType?: string
		sadaqaAmount?: number
		sadaqaDescription?: string
		fastingIsRamadan?: boolean
		customValue?: string
		notes?: string
		reflection?: string
	}) => Promise<void>
	onDelete?: () => Promise<void>
}) {
	let t = useIntl()

	async function editEntry(values: {
		type: IbaadahType
		date: string
		salahPrayers?: SalahPrayer[]
		quranPages?: number
		quranMinutes?: number
		dhikrCount?: number
		dhikrType?: string
		sadaqaAmount?: number
		sadaqaDescription?: string
		fastingIsRamadan?: boolean
		customValue?: string
		notes?: string
		reflection?: string
	}) {
		if (!me.$isLoaded) return

		if (onEdit) {
			await onEdit(values)
			toast.success(t("ibaadah.updated.success"))
			return
		}

		let value = transformFormDataToIbaadahValue(values)

		let result = await tryCatch(
			updateIbaadahEntry(
				{
					type: values.type,
					date: values.date,
					value: value,
					notes: values.notes,
					reflection: values.reflection,
				},
				{
					userId: me.$jazz.id,
					entryId: entry.$jazz.id,
				},
			),
		)

		if (!result.ok) {
			toast.error(
				typeof result.error === "string" ? result.error : result.error.message,
			)
			return
		}

		toast.success(t("ibaadah.updated.success"))
	}

	async function deleteEntry() {
		if (!me.$isLoaded) return

		if (onDelete) {
			await onDelete()
			toast.success(t("ibaadah.deleted.success"), {
				action: {
					label: t("common.undo"),
					onClick: async () => {
						toast.info(t("ibaadah.delete.undoNotAvailable"))
					},
				},
			})
			return
		}

		let result = await tryCatch(
			deleteIbaadahEntry({
				userId: me.$jazz.id,
				entryId: entry.$jazz.id,
			}),
		)

		if (!result.ok) {
			toast.error(
				typeof result.error === "string" ? result.error : result.error.message,
			)
			return
		}

		toast.success(t("ibaadah.deleted.success"), {
			action: {
				label: t("common.undo"),
				onClick: async () => {
					// Note: Undo would require recreating the entry
					// For now, we'll just show a message
					toast.info(t("ibaadah.delete.undoNotAvailable"))
				},
			},
		})
	}

	return { editEntry, deleteEntry }
}
