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
				let dhikrText = entry.value.count.toString()
				if (entry.value.dhikrType) {
					dhikrText += ` (${entry.value.dhikrType})`
				}
				return dhikrText
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
			case "fasting":
				return entry.value.isRamadan
					? t("ibaadah.form.fasting.ramadan.label")
					: t("ibaadah.form.fasting.label")
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
							quranPages:
								entry.value.type === "quran" ? entry.value.pages : undefined,
							quranMinutes:
								entry.value.type === "quran" ? entry.value.minutes : undefined,
							dhikrCount:
								entry.value.type === "dhikr" ? entry.value.count : undefined,
							dhikrType:
								entry.value.type === "dhikr"
									? entry.value.dhikrType
									: undefined,
							sadaqaAmount:
								entry.value.type === "sadaqa" ? entry.value.amount : undefined,
							sadaqaDescription:
								entry.value.type === "sadaqa"
									? entry.value.description
									: undefined,
							fastingIsRamadan:
								entry.value.type === "fasting"
									? entry.value.isRamadan
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
