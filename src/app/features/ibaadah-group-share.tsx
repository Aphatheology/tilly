import { Button } from "#shared/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#shared/ui/dialog"
import { T, useIntl } from "#shared/intl/setup"
import { useState } from "react"
import { IbaadahGroup } from "#shared/schema/group"
import { co } from "jazz-tools"
import { createIbaadahGroupInviteLink } from "#shared/tools/group-invite"
import { toast } from "sonner"
import { Input } from "#shared/ui/input"
import { Label } from "#shared/ui/label"
import { Copy } from "react-bootstrap-icons"

export { IbaadahGroupShare }

function IbaadahGroupShare({
	group,
	children,
}: {
	group: co.loaded<typeof IbaadahGroup>
	children: React.ReactNode
}) {
	let t = useIntl()
	let [dialogOpen, setDialogOpen] = useState(false)
	let [inviteLink, setInviteLink] = useState("")

	async function generateLink() {
		try {
			let link = await createIbaadahGroupInviteLink(group)
			setInviteLink(link)
			await navigator.clipboard.writeText(link)
			toast.success(t("invite.success.copy"))
		} catch (error) {
			let message =
				error instanceof Error ? error.message : t("invite.error.failed")
			toast.error(message)
		}
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				titleSlot={
					<DialogHeader>
						<DialogTitle>
							<T k="invite.group.title" />
						</DialogTitle>
					</DialogHeader>
				}
			>
				<div className="space-y-3">
					<Button onClick={generateLink}>
						<T k="invite.generate" />
					</Button>
					{inviteLink ? (
						<div className="space-y-2">
							<Label>
								<T k="invite.link" />
							</Label>
							<div className="flex items-center gap-2">
								<Input readOnly value={inviteLink} />
								<Button
									variant="outline"
									onClick={async () => {
										await navigator.clipboard.writeText(inviteLink)
										toast.success(t("invite.success.copy"))
									}}
								>
									<Copy className="size-4" />
								</Button>
							</div>
						</div>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	)
}
