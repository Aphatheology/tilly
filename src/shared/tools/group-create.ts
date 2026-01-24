import { UserAccount } from "#shared/schema/user"
import { IbaadahGroup } from "#shared/schema/group"
import { Group, co } from "jazz-tools"
import { IbaadahEntry } from "#shared/schema/ibaadah"
import { Reflection } from "#shared/schema/reflection"
import { tryCatch } from "#shared/lib/trycatch"
import type { co as CoType } from "jazz-tools"

export type IbaadahGroupData = Parameters<typeof IbaadahGroup.create>[0]

export type IbaadahGroupCreated = {
	groupID: string
	group: CoType.loaded<typeof IbaadahGroup>
}

export let errors = {
	USER_NOT_FOUND: "User account not found",
	GROUP_CREATION_FAILED: "Failed to create Ibaadah group",
} as const

export async function createIbaadahGroup(
	data: Omit<
		IbaadahGroupData,
		"version" | "createdAt" | "updatedAt" | "entries" | "reflections"
	>,
	options: { userId: string },
): Promise<IbaadahGroupCreated> {
	let accountResult = await tryCatch(
		UserAccount.load(options.userId, {
			resolve: { root: { ibaadahGroups: true } },
		}),
	)
	if (!accountResult.ok) throw new Error(errors.USER_NOT_FOUND)

	let account = accountResult.data
	if (!account.$isLoaded) throw new Error(errors.USER_NOT_FOUND)

	let now = new Date()
	let jazzGroup = Group.create()
	let group = IbaadahGroup.create(
		{
			version: 1,
			name: data.name,
			description: data.description,
			entries: co.list(IbaadahEntry).create([], jazzGroup),
			reflections: co.list(Reflection).create([], jazzGroup),
			createdAt: now,
			updatedAt: now,
		},
		jazzGroup,
	)

	if (!account.root.ibaadahGroups) {
		account.root.$jazz.set("ibaadahGroups", co.list(IbaadahGroup).create([]))
	}
	if (!account.root.ibaadahGroups) {
		throw new Error(errors.GROUP_CREATION_FAILED)
	}
	account.root.ibaadahGroups.$jazz.push(group)

	return {
		groupID: group.$jazz.id,
		group,
	}
}
