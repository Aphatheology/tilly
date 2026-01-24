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
import { IbaadahHabitForm } from "#app/features/ibaadah-habit-form"
import { createIbaadahHabit } from "#shared/tools/ibaadah-habit-create"
import { tryCatch } from "#shared/lib/trycatch"
import { toast } from "sonner"
import { T, useIntl } from "#shared/intl/setup"
import { useState } from "react"
import type { IbaadahType } from "#shared/schema/ibaadah"

export { NewIbaadahHabit }

function NewIbaadahHabit(props: {
	children: ReactNode
	onSuccess?: (habitId: string) => void
}) {
	let me = useAccount(UserAccount)
	let t = useIntl()
	let [dialogOpen, setDialogOpen] = useState(false)

	async function handleSave(values: {
		name: string
		type: string
		description?: string
		goal?: {
			daily?: boolean
			weekly?: boolean
			monthly?: boolean
			target?: number
		}
		enabled?: boolean
	}) {
		if (!me.$isLoaded) return

		let now = new Date()
		let result = await tryCatch(
			createIbaadahHabit(
				{
					version: 2,
					name: values.name,
					type: values.type as IbaadahType,
					description: values.description,
					goal: values.goal,
					enabled: values.enabled,
					createdAt: now,
					updatedAt: now,
				},
				{
					userId: me.$jazz.id,
				},
			),
		)

		if (!result.ok) {
			toast.error(
				typeof result.error === "string" ? result.error : result.error.message,
			)
			return
		}

		props.onSuccess?.(result.data.habitID)
		toast.success(t("ibaadah.habit.created.success"))
		setDialogOpen(false)
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>{props.children}</DialogTrigger>
			<DialogContent
				titleSlot={
					<DialogHeader>
						<DialogTitle>
							<T k="ibaadah.habit.add.title" />
						</DialogTitle>
						<DialogDescription>
							<T k="ibaadah.habit.add.description" />
						</DialogDescription>
					</DialogHeader>
				}
			>
				<IbaadahHabitForm
					defaultValues={{}}
					onSubmit={handleSave}
					onCancel={() => setDialogOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	)
}
