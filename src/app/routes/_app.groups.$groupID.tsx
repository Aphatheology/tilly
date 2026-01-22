import { createFileRoute, notFound } from "@tanstack/react-router"
import { UserAccount } from "#shared/schema/user"
import { useAccount } from "jazz-tools/react"
import { type ResolveQuery } from "jazz-tools"
import { TypographyH1 } from "#shared/ui/typography"
import { T, useIntl } from "#shared/intl/setup"
import { IbaadahEntryListItem } from "#app/features/ibaadah-entry-list-item"
import { Button } from "#shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "#shared/ui/dialog"
import {
	IbaadahForm,
	transformFormDataToIbaadahValue,
} from "#app/features/ibaadah-form"
import { tryCatch } from "#shared/lib/trycatch"
import { toast } from "sonner"
import React from "react"
import {
	createGroupIbaadahEntry,
	updateGroupIbaadahEntry,
	deleteGroupIbaadahEntry,
} from "#shared/tools/group-ibaadah-entry"
import type { IbaadahType, SalahPrayer } from "#shared/schema/ibaadah"
import { Plus } from "react-bootstrap-icons"

export let Route = createFileRoute("/_app/groups/$groupID")({
	loader: async ({ context, params }) => {
		if (!context.me) throw notFound()
		let loadedMe = await UserAccount.load(context.me.$jazz.id, {
			resolve,
		})
		if (!loadedMe.$isLoaded) throw notFound()
		let group = Array.from(loadedMe.root.ibaadahGroups?.values() || []).find(
			g => g?.$isLoaded && g.$jazz.id === params.groupID,
		)
		if (!group) throw notFound()
		return { me: loadedMe, groupId: params.groupID }
	},
	component: GroupDetail,
})

let resolve = {
	root: {
		ibaadahGroups: {
			$each: {
				entries: { $each: true },
			},
		},
	},
} as const satisfies ResolveQuery<typeof UserAccount>

function GroupDetail() {
	let { me: data, groupId } = Route.useLoaderData()
	let subscribedMe = useAccount(UserAccount, { resolve })
	let currentMe = subscribedMe.$isLoaded ? subscribedMe : data

	let group = Array.from(currentMe.root.ibaadahGroups?.values() || []).find(
		g => g?.$isLoaded && g.$jazz.id === groupId,
	)
	if (!group || !group.$isLoaded) {
		return null
	}

	let entries = Array.from(group.entries?.values() || []).filter(
		(e): e is Extract<typeof e, { $isLoaded: true }> => e?.$isLoaded === true,
	)
	let todayStr = new Date().toISOString().substring(0, 10)
	let todayCount = entries.filter(e => e.date === todayStr).length
	let typeCounts = {
		salah: entries.filter(e => e.type === "salah").length,
		quran: entries.filter(e => e.type === "quran").length,
		dhikr: entries.filter(e => e.type === "dhikr").length,
		sadaqa: entries.filter(e => e.type === "sadaqa").length,
		fasting: entries.filter(e => e.type === "fasting").length,
		custom: entries.filter(e => e.type === "custom").length,
	}

	return (
		<div className="space-y-6 pb-20 md:mt-12 md:pb-4">
			<title>{group.name}</title>
			<div className="flex items-center justify-between">
				<TypographyH1>{group.name}</TypographyH1>
				<NewGroupIbaadahEntry groupId={group.$jazz.id}>
					<Button>
						<Plus className="size-4" />
						<span className="sr-only md:not-sr-only">
							<T k="dashboard.add" />
						</span>
					</Button>
				</NewGroupIbaadahEntry>
			</div>
			{group.description ? (
				<p className="text-muted-foreground">{group.description}</p>
			) : null}

			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Total entries</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">
						{entries.length}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Today</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">{todayCount}</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>By type</CardTitle>
					</CardHeader>
					<CardContent className="text-muted-foreground text-sm">
						Salah: {typeCounts.salah}, Quran: {typeCounts.quran}, Dhikr:{" "}
						{typeCounts.dhikr}, Sadaqa: {typeCounts.sadaqa}, Fasting:{" "}
						{typeCounts.fasting}, Custom: {typeCounts.custom}
					</CardContent>
				</Card>
			</div>

			<div className="space-y-2 rounded-lg border">
				{entries.length === 0 ? (
					<div className="text-muted-foreground py-6 text-center">
						<T k="ibaadah.entries.empty" />
					</div>
				) : (
					entries.map(entry => (
						<IbaadahEntryListItem
							key={entry.$jazz.id}
							entry={entry}
							me={currentMe}
							onEdit={values =>
								updateGroupEntry(
									values,
									currentMe.$jazz.id,
									group.$jazz.id,
									entry.$jazz.id,
								)
							}
							onDelete={() =>
								deleteGroupEntry(
									currentMe.$jazz.id,
									group.$jazz.id,
									entry.$jazz.id,
								)
							}
						/>
					))
				)}
			</div>
		</div>
	)
}

async function updateGroupEntry(
	values: {
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
	},
	userId: string,
	groupId: string,
	entryId: string,
) {
	let value = transformFormDataToIbaadahValue(values)
	let result = await tryCatch(
		updateGroupIbaadahEntry(
			{
				type: values.type,
				date: values.date,
				value,
				notes: values.notes,
				reflection: values.reflection,
			},
			{ userId, groupId, entryId },
		),
	)
	if (!result.ok) {
		throw new Error(
			typeof result.error === "string" ? result.error : result.error.message,
		)
	}
}

async function deleteGroupEntry(
	userId: string,
	groupId: string,
	entryId: string,
) {
	let result = await tryCatch(
		deleteGroupIbaadahEntry({ userId, groupId, entryId }),
	)
	if (!result.ok) {
		throw new Error(
			typeof result.error === "string" ? result.error : result.error.message,
		)
	}
}

function NewGroupIbaadahEntry(props: {
	children: React.ReactNode
	groupId: string
}) {
	let t = useIntl()
	let me = useAccount(UserAccount)
	let [open, setOpen] = React.useState(false)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
						type: "salah",
						date: new Date().toISOString().substring(0, 10),
					}}
					onSubmit={async values => {
						if (!me.$isLoaded) return
						let value = transformFormDataToIbaadahValue(values)
						let now = new Date()
						let entryData: Parameters<typeof createGroupIbaadahEntry>[0] = {
							version: 1,
							type: values.type,
							date: values.date,
							value,
							notes: values.notes,
							reflection: values.reflection,
							createdAt: now,
							updatedAt: now,
						}
						let result = await tryCatch(
							createGroupIbaadahEntry(entryData, {
								userId: me.$jazz.id,
								groupId: props.groupId,
							}),
						)
						if (!result.ok) {
							toast.error(
								typeof result.error === "string"
									? result.error
									: result.error.message,
							)
							return
						}
						toast.success(t("ibaadah.created.success"))
						setOpen(false)
					}}
					onCancel={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	)
}
