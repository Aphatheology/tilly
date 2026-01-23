import { useAccount } from "jazz-tools/react"
import { UserAccount } from "#shared/schema/user"
import { type ReactNode, useMemo } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#shared/ui/dialog"
import { IbaadahForm } from "#app/features/ibaadah-form"
import { createIbaadahEntry } from "#shared/tools/ibaadah-create"
import { updateIbaadahEntry } from "#shared/tools/ibaadah-update"
import { tryCatch } from "#shared/lib/trycatch"
import { toast } from "sonner"
import { T, useIntl } from "#shared/intl/setup"
import { useState } from "react"
import type { IbaadahType, SalahPrayer } from "#shared/schema/ibaadah"
import {
	transformFormDataToIbaadahValue,
	type IbaadahFormValues,
} from "#app/features/ibaadah-form"
import { usePoints } from "#app/features/points/use-points"

export { NewIbaadahEntry }

let nonRepeatableTypes: IbaadahType[] = [
	"salah",
	"fasting",
	"dhikr",
	"nawaafil",
]

function NewIbaadahEntry(props: {
	children: ReactNode
	onSuccess?: (entryId: string) => void
	type?: IbaadahType
	date?: string
}) {
	let me = useAccount(UserAccount, {
		resolve: { root: { ibaadahEntries: { $each: true } } },
	})
	let t = useIntl()
	let [dialogOpen, setDialogOpen] = useState(false)
	let { awardPoints } = usePoints()

	let existingEntry = useMemo(() => {
		if (!me.$isLoaded || !props.date) return null
		let root = (me as Extract<typeof me, { $isLoaded: true }>).root
		if (!root) return null

		if (props.type && nonRepeatableTypes.includes(props.type)) {
			let entries = Array.from(root.ibaadahEntries?.values() || []).filter(
				(e): e is Extract<typeof e, { $isLoaded: true }> =>
					e?.$isLoaded === true &&
					e.type === props.type &&
					e.date === props.date,
			)
			return entries[0] || null
		}

		if (!props.type) {
			let allEntries = Array.from(root.ibaadahEntries?.values() || []).filter(
				(e): e is Extract<typeof e, { $isLoaded: true }> =>
					e?.$isLoaded === true && e.date === props.date,
			)
			return allEntries[0] || null
		}

		return null
	}, [me, props.date, props.type])

	let defaultFormValues = useMemo(() => {
		let base = {
			type: props.type || "salah",
			date: props.date || new Date().toISOString().substring(0, 10),
		}

		if (existingEntry) {
			let prefill: Partial<IbaadahFormValues> = {
				...base,
				type: existingEntry.type,
				notes: existingEntry.notes,
				reflection: existingEntry.reflection,
			}

			if (existingEntry.value.type === "salah") {
				prefill.salahPrayers = existingEntry.value.prayers || []
			} else if (existingEntry.value.type === "quran") {
				prefill.quranUnit = existingEntry.value.unit
				prefill.quranValues =
					"values" in existingEntry.value && existingEntry.value.values
						? existingEntry.value.values
						: "value" in existingEntry.value &&
							  existingEntry.value.value !== undefined
							? [existingEntry.value.value as number]
							: []
				prefill.quranPages = existingEntry.value.pages
				prefill.quranMinutes = existingEntry.value.minutes
			} else if (existingEntry.value.type === "dhikr") {
				prefill.adhkaarIds = existingEntry.value.adhkaarIds || []
				prefill.customDhikr = existingEntry.value.customDhikr
				prefill.dhikrCount = existingEntry.value.count
			} else if (existingEntry.value.type === "nawaafil") {
				prefill.nawaafilIds = existingEntry.value.nawaafilIds || []
				prefill.customNawaafil = existingEntry.value.customNawaafil || []
			} else if (existingEntry.value.type === "fasting") {
				prefill.fastingType = existingEntry.value.fastingType
				prefill.fastingCustomDescription = existingEntry.value.customDescription
			} else if (existingEntry.value.type === "sadaqa") {
				prefill.sadaqaAmount = existingEntry.value.amount
				prefill.sadaqaDescription = existingEntry.value.description
			} else if (existingEntry.value.type === "custom") {
				prefill.customValue = existingEntry.value.value
			}

			return prefill
		}

		return base
	}, [existingEntry, props.type, props.date])

	async function handleSave(values: {
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

		if (
			existingEntry &&
			existingEntry.type === values.type &&
			existingEntry.date === values.date
		) {
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
						entryId: existingEntry.$jazz.id,
					},
				),
			)

			if (!result.ok) {
				toast.error(
					typeof result.error === "string"
						? result.error
						: result.error.message,
				)
				return
			}

			props.onSuccess?.(existingEntry.$jazz.id)
			toast.success(t("ibaadah.updated.success"))
			setDialogOpen(false)
			return
		}

		let value = transformFormDataToIbaadahValue(values)

		let now = new Date()
		let entryData: Parameters<typeof createIbaadahEntry>[0] = {
			version: 2,
			type: values.type,
			date: values.date,
			value: value,
			notes: values.notes,
			reflection: values.reflection,
			createdAt: now,
			updatedAt: now,
		}

		let result = await tryCatch(
			createIbaadahEntry(entryData, {
				userId: me.$jazz.id,
			}),
		)

		if (!result.ok) {
			toast.error(
				typeof result.error === "string" ? result.error : result.error.message,
			)
			return
		}

		props.onSuccess?.(result.data.entryID)

		// Award points for creating an entry
		awardPoints(
			10,
			`Logged ${values.type}`,
			values.type === "salah" ||
				values.type === "quran" ||
				values.type === "dhikr"
				? values.type
				: "other",
		)

		toast.success(t("ibaadah.created.success"))
		setDialogOpen(false)
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>{props.children}</DialogTrigger>
			<DialogContent
				titleSlot={
					<DialogHeader>
						<DialogTitle>
							<T k="ibaadah.add.title" />
						</DialogTitle>
						<DialogDescription>
							<T k="ibaadah.add.description" />
						</DialogDescription>
					</DialogHeader>
				}
			>
				<IbaadahForm
					defaultValues={defaultFormValues}
					onSubmit={handleSave}
					onCancel={() => setDialogOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	)
}
