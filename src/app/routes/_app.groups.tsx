import { createFileRoute, notFound } from "@tanstack/react-router"
import { UserAccount } from "#shared/schema/user"
import { useAccount } from "jazz-tools/react"
import { type ResolveQuery } from "jazz-tools"
import { TypographyH1 } from "#shared/ui/typography"
import { Button } from "#shared/ui/button"
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#shared/ui/empty"
import { Plus, People } from "react-bootstrap-icons"
import { NewIbaadahGroup } from "#app/features/new-ibaadah-group"
import { T, useIntl } from "#shared/intl/setup"
import { IbaadahGroup } from "#shared/schema/group"
import { co } from "jazz-tools"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#shared/ui/card"
import { IbaadahGroupShare } from "#app/features/ibaadah-group-share"

export let Route = createFileRoute("/_app/groups")({
	loader: async ({ context }) => {
		if (!context.me) throw notFound()
		let loadedMe = await UserAccount.load(context.me.$jazz.id, {
			resolve,
		})
		if (!loadedMe.$isLoaded) throw notFound()
		return { me: loadedMe }
	},
	component: GroupsScreen,
})

let resolve = {
	root: {
		ibaadahGroups: { $each: true },
	},
} as const satisfies ResolveQuery<typeof UserAccount>

function GroupsScreen() {
	let { me: data } = Route.useLoaderData()
	let subscribedMe = useAccount(UserAccount, { resolve })
	let currentMe = subscribedMe.$isLoaded ? subscribedMe : data
	let t = useIntl()

	let groups = Array.from(currentMe.root.ibaadahGroups?.values() || []).filter(
		(g): g is Extract<typeof g, { $isLoaded: true }> => g?.$isLoaded === true,
	)

	return (
		<div className="space-y-8 pb-20 md:mt-12 md:pb-4">
			<title>{t("ibaadah.groups.pageTitle")}</title>
			<div className="flex items-center justify-between">
				<TypographyH1>
					<T k="ibaadah.groups.title" />
				</TypographyH1>
				<NewIbaadahGroup>
					<Button>
						<Plus className="size-4" />
						<span className="sr-only md:not-sr-only">
							<T k="ibaadah.groups.add" />
						</span>
					</Button>
				</NewIbaadahGroup>
			</div>

			{groups.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<People />
						</EmptyMedia>
						<EmptyTitle>
							<T k="ibaadah.groups.empty" />
						</EmptyTitle>
						<EmptyDescription>
							<T k="ibaadah.groups.empty.description" />
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{groups.map(group => (
						<GroupCard key={group.$jazz.id} group={group} />
					))}
				</div>
			)}
		</div>
	)
}

function GroupCard({ group }: { group: co.loaded<typeof IbaadahGroup> }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{group.name}</CardTitle>
				{group.description && (
					<CardDescription>{group.description}</CardDescription>
				)}
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-2">
					<Button variant="outline" className="w-full" asChild>
						<a href={`/app/groups/${group.$jazz.id}`}>
							<T k="ibaadah.groups.view" />
						</a>
					</Button>
					<IbaadahGroupShare group={group}>
						<Button variant="secondary" className="w-full">
							<T k="invite.share" />
						</Button>
					</IbaadahGroupShare>
				</div>
			</CardContent>
		</Card>
	)
}
