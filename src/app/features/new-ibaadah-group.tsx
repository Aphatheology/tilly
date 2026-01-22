import { useAccount } from "jazz-tools/react"
import { UserAccount } from "#shared/schema/user"
import { type ReactNode, useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#shared/ui/dialog"
import { IbaadahGroupForm } from "./ibaadah-group-form"
import { createIbaadahGroup } from "#shared/tools/group-create"
import { tryCatch } from "#shared/lib/trycatch"
import { toast } from "sonner"
import { T, useIntl } from "#shared/intl/setup"

export { NewIbaadahGroup }

function NewIbaadahGroup(props: {
	children: ReactNode
	onSuccess?: (groupId: string) => void
}) {
	let me = useAccount(UserAccount)
	let t = useIntl()
	let [dialogOpen, setDialogOpen] = useState(false)

	async function handleSave(values: { name: string; description?: string }) {
		if (!me.$isLoaded) return

		let result = await tryCatch(
			createIbaadahGroup(
				{
					name: values.name,
					description: values.description,
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

		props.onSuccess?.(result.data.groupID)
		toast.success(t("ibaadah.group.created.success"))
		setDialogOpen(false)
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>{props.children}</DialogTrigger>
			<DialogContent
				titleSlot={
					<DialogHeader>
						<DialogTitle>
							<T k="ibaadah.group.add.title" />
						</DialogTitle>
						<DialogDescription>
							<T k="ibaadah.group.add.description" />
						</DialogDescription>
					</DialogHeader>
				}
			>
				<IbaadahGroupForm
					onSubmit={handleSave}
					onCancel={() => setDialogOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	)
}
