import { createFileRoute, notFound } from "@tanstack/react-router"
import { UserAccount } from "#shared/schema/user"
import { useAccount } from "jazz-tools/react"
import { co, type Loaded } from "jazz-tools"
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
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "#shared/ui/tabs"
import {
	IbaadahForm,
	transformFormDataToIbaadahValue,
} from "#app/features/ibaadah-form"
import { tryCatch } from "#shared/lib/trycatch"
import { toast } from "sonner"
import React, { useState } from "react"
import {
	createGroupIbaadahEntry,
	updateGroupIbaadahEntry,
	deleteGroupIbaadahEntry,
} from "#shared/tools/group-ibaadah-entry"
import { IbaadahGroup } from "#shared/schema/group"
import { Plus } from "react-bootstrap-icons"
import { ReflectionEditor } from "#app/features/reflection/ReflectionEditor"
import { Reflection } from "#shared/schema/reflection"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "#shared/ui/avatar"
import type { IbaadahEntry } from "#shared/schema/ibaadah"

type EntryWithOwner = Loaded<typeof IbaadahEntry> & {
	_owner?: {
		$jazz: { id: string }
		profile?: { name?: string; avatar?: string }
	}
}

type ReflectionWithOwner = Loaded<typeof Reflection> & {
	_owner?: {
		$jazz: { id: string }
		profile?: { name?: string; avatar?: string }
	}
}

export let Route = createFileRoute("/_app/groups/$groupID")({
	loader: async ({ context, params }) => {
		if (!context.me) throw notFound()
		let loadedMe = await UserAccount.load(context.me.$jazz.id, {
			resolve,
		})
		if (!loadedMe.$isLoaded || !loadedMe.root) throw notFound()
		const root = (loadedMe as Extract<typeof loadedMe, { $isLoaded: true }>).root
		// @ts-expect-error - ibaadahGroups exists at runtime via resolve query
		const groupsList = root.ibaadahGroups
		if (!groupsList || !groupsList.$isLoaded) throw notFound()
		const loadedGroupsList = groupsList as Extract<typeof groupsList, { $isLoaded: true }>
		let groups = Array.from(loadedGroupsList.values()).filter(
			(g): g is Loaded<typeof IbaadahGroup> => {
				if (!g || typeof g !== "object") return false
				const item = g as { $isLoaded?: boolean }
				return Boolean(item.$isLoaded)
			},
		)
		let group = groups.find(g => g.$jazz.id === params.groupID)
		if (!group) throw notFound()
		return { me: loadedMe, groupId: params.groupID }
	},
	component: GroupDetail,
})

let resolve = {
	root: {
		ibaadahGroups: {
			$each: {
				entries: { 
					$each: {
						_owner: { profile: true }
					} 
				},
				reflections: { 
					$each: true
				}
			},
		},
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ResolveQuery type doesn't fully support _owner resolution
} as any

function GroupDetail() {
	let { me: data, groupId } = Route.useLoaderData()
	let subscribedMe = useAccount(UserAccount, { resolve })
	let currentMe = subscribedMe.$isLoaded ? subscribedMe : data

	if (!currentMe.$isLoaded || !currentMe.root) return null

	const root = (currentMe as Extract<typeof currentMe, { $isLoaded: true }>).root
	// @ts-expect-error - ibaadahGroups exists at runtime via resolve query
	const groupsList = root.ibaadahGroups
	if (!groupsList || !groupsList.$isLoaded) return null
	const loadedGroupsList = groupsList as Extract<typeof groupsList, { $isLoaded: true }>
	let groups = Array.from(loadedGroupsList.values()).filter(
		(g): g is Loaded<typeof IbaadahGroup> => {
			if (!g || typeof g !== "object") return false
			const item = g as { $isLoaded?: boolean }
			return Boolean(item.$isLoaded)
		},
	)
	let group = groups.find(g => g.$jazz.id === groupId)
	if (!group) {
		return null
	}
 
	// Ensure reflections list exists (migration)
	if (!group.reflections) {
		// Just a safeguard, UI should handle it, 
		// but ideally we create it. 
		// Since we are in render, we can't create side effects easily without useEffect/handler.
		// We'll handle creation on add.
	}

	return (
		<div className="space-y-6 pb-20 md:mt-12 md:pb-4">
			<title>{group.name}</title>
			<div className="flex items-center justify-between">
				<div>
					<TypographyH1>{group.name}</TypographyH1>
					{group.description && (
						<p className="text-muted-foreground mt-1">{group.description}</p>
					)}
				</div>
				<InviteButton groupId={group.$jazz.id} />
			</div>

			<Tabs defaultValue="tracker" className="space-y-4">
				<TabsList>
					<TabsTrigger value="tracker">Tracker</TabsTrigger>
					<TabsTrigger value="reflections">Reflections</TabsTrigger>
					<TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
				</TabsList>
				
				<TabsContent value="tracker" className="space-y-6">
					<GroupTracker group={group} me={currentMe} />
				</TabsContent>
				
				<TabsContent value="reflections" className="space-y-6">
					<GroupReflections group={group} />
				</TabsContent>
				
				<TabsContent value="leaderboard">
					<GroupLeaderboard group={group} />
				</TabsContent>
			</Tabs>
		</div>
	)
}

function InviteButton({ groupId }: { groupId: string }) {
	return (
		<Button asChild variant="outline">
			<a href={`/app/groups/${groupId}/invite`}>
				Invite Members
			</a>
		</Button>
	)
}

function GroupTracker({ group, me }: { group: Loaded<typeof IbaadahGroup>; me: Loaded<typeof UserAccount> }) {
	if (!group.entries || !group.entries.$isLoaded) return null
	
	let entries = Array.from(group.entries.values()).filter(
		(e): e is Loaded<typeof import("#shared/schema/ibaadah").IbaadahEntry> =>
			Boolean(e && e.$isLoaded),
	)
	
	let todayStr = new Date().toISOString().substring(0, 10)
	let todayCount = entries.filter(e => e.date === todayStr).length
	
	return (
		<>
			<div className="flex justify-end">
				<NewGroupIbaadahEntry groupId={group.$jazz.id}>
					<Button>
						<Plus className="size-4 mr-2" />
						Record Ibaadah
					</Button>
				</NewGroupIbaadahEntry>
			</div>
			
			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Group Activity</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{entries.length}</div>
						<p className="text-xs text-muted-foreground">Total records shared</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Activity Today</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{todayCount}</div>
						<p className="text-xs text-muted-foreground">Records today</p>
					</CardContent>
				</Card>
			</div>

			<div className="space-y-2 rounded-lg border p-4 bg-card">
				<h3 className="font-semibold mb-4">Recent Activity</h3>
				{entries.length === 0 ? (
					<div className="text-muted-foreground py-6 text-center">
						<T k="ibaadah.entries.empty" />
					</div>
				) : (
					entries.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).map(entry => {
						const owner = (entry as EntryWithOwner)._owner
						return (
							<div key={entry.$jazz.id} className="mb-4 last:mb-0">
								<div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
									<span className="font-medium text-foreground">
										{owner?.profile?.name || "Unknown"}
									</span>
									<span>•</span>
									<span>{format(entry.createdAt, "MMM d, h:mm a")}</span>
								</div>
								<IbaadahEntryListItem
									entry={entry}
									me={me}
									onEdit={
										owner?.$jazz.id === me.$jazz.id 
										? (values) => updateGroupEntry(values, me.$jazz.id, group.$jazz.id, entry.$jazz.id)
										: undefined
									}
									onDelete={
										owner?.$jazz.id === me.$jazz.id
										? () => deleteGroupEntry(me.$jazz.id, group.$jazz.id, entry.$jazz.id)
										: undefined
									}
								/>
							</div>
						)
					})
				)}
			</div>
		</>
	)
}

function GroupReflections({ group }: { group: Loaded<typeof IbaadahGroup> }) {
	const [isCreating, setIsCreating] = useState(false)
	
	const handleCreate = (data: { content: string; mood?: string; tags: string[] }) => {
		if (!group.reflections) {
			const owner = group.$jazz.owner
			if (!owner) return
			group.$jazz.set("reflections", co.list(Reflection).create([], owner))
		}
		
		if (!group.reflections || !group.reflections.$isLoaded) return
		
		const reflection = Reflection.create({
			version: 1,
			content: data.content,
			mood: data.mood as "happy" | "grateful" | "neutral" | "sad" | "stressed" | "inspired" | undefined,
			tags: data.tags,
			date: new Date().toISOString().split("T")[0],
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		
		group.reflections.$jazz.push(reflection)
		setIsCreating(false)
	}

	if (!group.reflections || !group.reflections.$isLoaded) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-semibold">Shared Reflections</h3>
				</div>
				<div className="text-center py-8 text-muted-foreground">
					No reflections shared yet.
				</div>
			</div>
		)
	}

	const reflections = Array.from(group.reflections.values())
		.filter((r): r is Loaded<typeof Reflection> =>
			Boolean(r && r.$isLoaded),
		)
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Shared Reflections</h3>
				{!isCreating && (
					<Button onClick={() => setIsCreating(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Share Reflection
					</Button>
				)}
			</div>

			{isCreating && (
				<Card>
					<CardContent className="pt-6">
						<ReflectionEditor
							onSubmit={handleCreate}
							onCancel={() => setIsCreating(false)}
						/>
					</CardContent>
				</Card>
			)}

			<div className="space-y-4">
				{reflections.map((reflection) => {
					const owner = (reflection as ReflectionWithOwner)._owner
					return (
					<Card key={reflection.$jazz.id}>
						<CardHeader className="flex flex-row items-center gap-3 space-y-0 py-3">
							<Avatar className="h-8 w-8">
								<AvatarImage src={owner?.profile?.avatar} />
								<AvatarFallback>{owner?.profile?.name?.[0] || "?"}</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<span className="text-sm font-medium">
									{owner?.profile?.name || "Unknown"}
								</span>
								<span className="text-xs text-muted-foreground">
									{format(new Date(reflection.createdAt), "PPP")}
								</span>
							</div>
							{reflection.mood && (
								<div className="ml-auto text-2xl">
									{{
										happy: "😊",
										grateful: "🥰",
										inspired: "🤩",
										neutral: "😐",
										stressed: "😓",
										sad: "😢",
									}[reflection.mood as string] || "😐"}
								</div>
							)}
						</CardHeader>
						<CardContent className="pb-4">
							<p className="text-sm whitespace-pre-wrap">{reflection.content}</p>
							{reflection.tags && reflection.tags.$isLoaded && Array.from(reflection.tags.values()).length > 0 && (
								<div className="mt-2 flex flex-wrap gap-1">
									{Array.from(reflection.tags.values()).map((tag: string) => (
										<span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded">
											#{tag}
										</span>
									))}
								</div>
							)}
						</CardContent>
					</Card>
					)
				})}
				{reflections.length === 0 && !isCreating && (
					<div className="text-center py-8 text-muted-foreground">
						No reflections shared yet.
					</div>
				)}
			</div>
		</div>
	)
}

function GroupLeaderboard({ group }: { group: Loaded<typeof IbaadahGroup> }) {
	if (!group.entries || !group.entries.$isLoaded) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Leaderboard</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center text-muted-foreground py-4">
						No activity yet.
					</p>
				</CardContent>
			</Card>
		)
	}
	
	const entries = Array.from(group.entries.values())
		.filter((e): e is Loaded<typeof import("#shared/schema/ibaadah").IbaadahEntry> =>
			Boolean(e && e.$isLoaded),
		)
	
	const scores: Record<string, { name: string; score: number; updates: number }> = {}
	
	entries.forEach((entry) => {
		const owner = (entry as EntryWithOwner)._owner
		const ownerId = owner?.$jazz.id
		if (!ownerId) return
		
		if (!scores[ownerId]) {
			scores[ownerId] = {
				name: owner?.profile?.name || "Unknown",
				score: 0,
				updates: 0
			}
		}
		
		scores[ownerId].score += 10 // Mock points
		scores[ownerId].updates += 1
	})
	
	const leaderboard = Object.values(scores).sort((a,b) => b.score - a.score)
	
	return (
		<Card>
			<CardHeader>
				<CardTitle>Leaderboard</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{leaderboard.map((user, index) => (
						<div key={user.name} className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold">
									{index + 1}
								</div>
								<div>
									<p className="font-medium">{user.name}</p>
									<p className="text-xs text-muted-foreground">
										{user.updates} entries
									</p>
								</div>
							</div>
							<div className="font-bold">
								{user.score} pts
							</div>
						</div>
					))}
					{leaderboard.length === 0 && (
						<p className="text-center text-muted-foreground py-4">
							No activity yet.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

async function updateGroupEntry(
	values: Parameters<typeof transformFormDataToIbaadahValue>[0],
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
							version: 2,
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
