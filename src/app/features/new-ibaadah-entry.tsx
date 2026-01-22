import { useAccount } from "jazz-tools/react"
import { UserAccount } from "#shared/schema/user"
import { type ReactNode } from "react"
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
import { tryCatch } from "#shared/lib/trycatch"
import { toast } from "sonner"
import { T, useIntl } from "#shared/intl/setup"
import { useState } from "react"
import type { IbaadahType, SalahPrayer } from "#shared/schema/ibaadah"
import { transformFormDataToIbaadahValue } from "#app/features/ibaadah-form"

export { NewIbaadahEntry }

function NewIbaadahEntry(props: {
	children: ReactNode
	onSuccess?: (entryId: string) => void
	type?: IbaadahType
}) {
	let me = useAccount(UserAccount)
	let t = useIntl()
	let [dialogOpen, setDialogOpen] = useState(false)

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

		let value = transformFormDataToIbaadahValue(values)

		let now = new Date()
		let entryData: Parameters<typeof createIbaadahEntry>[0] = {
			version: 1,
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
					defaultValues={{
						type: props.type || "salah",
						date: new Date().toISOString().substring(0, 10),
					}}
					onSubmit={handleSave}
					onCancel={() => setDialogOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	)
}
