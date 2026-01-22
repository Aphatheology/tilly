import { UserAccount } from "#shared/schema/user"
import { IbaadahEntry } from "#shared/schema/ibaadah"
import { co } from "jazz-tools"
import { tryCatch } from "#shared/lib/trycatch"
import type { co as CoType } from "jazz-tools"

export type IbaadahEntryData = Parameters<typeof IbaadahEntry.create>[0]

export type IbaadahEntryCreated = {
	entryID: string
	entry: CoType.loaded<typeof IbaadahEntry>
}

export let errors = {
	USER_NOT_FOUND: "User account not found",
	ENTRY_CREATION_FAILED: "Failed to create Ibaadah entry",
} as const

export async function createIbaadahEntry(
	data: IbaadahEntryData,
	options: { userId: string },
): Promise<IbaadahEntryCreated> {
	let accountResult = await tryCatch(
		UserAccount.load(options.userId, {
			resolve: { root: { ibaadahEntries: true } },
		}),
	)
	if (!accountResult.ok) throw new Error(errors.USER_NOT_FOUND)

	let account = accountResult.data
	if (!account.$isLoaded) throw new Error(errors.USER_NOT_FOUND)

	let now = new Date()
	let entry = IbaadahEntry.create(
		{
			...data,
			createdAt: data.createdAt || now,
			updatedAt: now,
		},
		account.$jazz.owner,
	)

	if (!account.root.ibaadahEntries) {
		account.root.$jazz.set("ibaadahEntries", co.list(IbaadahEntry).create([]))
	}
	if (!account.root.ibaadahEntries) {
		throw new Error(errors.ENTRY_CREATION_FAILED)
	}
	account.root.ibaadahEntries.$jazz.push(entry)

	return {
		entryID: entry.$jazz.id,
		entry,
	}
}
