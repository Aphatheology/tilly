import { UserAccount } from "#shared/schema/user"
import { IbaadahEntry } from "#shared/schema/ibaadah"
import { co } from "jazz-tools"
import { tryCatch } from "#shared/lib/trycatch"

export { updateIbaadahEntry, deleteIbaadahEntry }
export type { IbaadahEntryUpdated, IbaadahEntryDeleted }

async function updateIbaadahEntry(
	updates: Partial<{
		type: Parameters<typeof IbaadahEntry.create>[0]["type"]
		date: string
		value: Parameters<typeof IbaadahEntry.create>[0]["value"]
		notes?: string
		reflection?: string
	}>,
	options: {
		userId: string
		entryId: string
	},
): Promise<IbaadahEntryUpdated> {
	let accountResult = await tryCatch(
		UserAccount.load(options.userId, {
			resolve: { root: { ibaadahEntries: { $each: true } } },
		}),
	)
	if (!accountResult.ok) throw new Error(errors.USER_NOT_FOUND)

	let account = accountResult.data
	if (!account.$isLoaded) throw new Error(errors.USER_NOT_FOUND)

	let entry = await IbaadahEntry.load(options.entryId)
	if (!entry.$isLoaded) throw new Error(errors.ENTRY_NOT_FOUND)

	let previous = {
		type: entry.type,
		date: entry.date,
		value: entry.value,
		notes: entry.notes,
		reflection: entry.reflection,
		createdAt: entry.createdAt,
		updatedAt: entry.updatedAt,
	}

	if (updates.type !== undefined) {
		entry.$jazz.set("type", updates.type)
	}
	if (updates.date !== undefined) {
		entry.$jazz.set("date", updates.date)
	}
	if (updates.value !== undefined) {
		entry.$jazz.set("value", updates.value)
	}
	if (updates.notes !== undefined) {
		if (updates.notes === "") {
			entry.$jazz.delete("notes")
		} else {
			entry.$jazz.set("notes", updates.notes)
		}
	}
	if (updates.reflection !== undefined) {
		if (updates.reflection === "") {
			entry.$jazz.delete("reflection")
		} else {
			entry.$jazz.set("reflection", updates.reflection)
		}
	}

	entry.$jazz.set("updatedAt", new Date())

	return {
		operation: "update",
		entryID: options.entryId,
		current: {
			type: entry.type,
			date: entry.date,
			value: entry.value,
			notes: entry.notes,
			reflection: entry.reflection,
			createdAt: entry.createdAt,
			updatedAt: entry.updatedAt,
		},
		previous,
		_ref: entry,
	}
}

async function deleteIbaadahEntry(options: {
	userId: string
	entryId: string
}): Promise<IbaadahEntryDeleted> {
	let accountResult = await tryCatch(
		UserAccount.load(options.userId, {
			resolve: { root: { ibaadahEntries: { $each: true } } },
		}),
	)
	if (!accountResult.ok) throw new Error(errors.USER_NOT_FOUND)

	let account = accountResult.data
	if (!account.$isLoaded) throw new Error(errors.USER_NOT_FOUND)

	if (!account.root.ibaadahEntries) {
		throw new Error(errors.ENTRY_NOT_FOUND)
	}

	let entries = Array.from(account.root.ibaadahEntries.values())
	let entryIdx = entries.findIndex(e => e?.$jazz.id === options.entryId)

	if (entryIdx === -1) {
		throw new Error(errors.ENTRY_NOT_FOUND)
	}

	let entry = entries[entryIdx]
	if (!entry || !entry.$isLoaded) {
		throw new Error(errors.ENTRY_NOT_FOUND)
	}

	account.root.ibaadahEntries.$jazz.splice(entryIdx, 1)

	return {
		operation: "delete",
		entryID: options.entryId,
	}
}

let errors = {
	USER_NOT_FOUND: "User account not found",
	ENTRY_NOT_FOUND: "Ibaadah entry not found",
} as const

type IbaadahEntryUpdated = {
	operation: "update"
	entryID: string
	current: {
		type: Parameters<typeof IbaadahEntry.create>[0]["type"]
		date: string
		value: Parameters<typeof IbaadahEntry.create>[0]["value"]
		notes?: string
		reflection?: string
		createdAt: Date
		updatedAt: Date
	}
	previous: {
		type: Parameters<typeof IbaadahEntry.create>[0]["type"]
		date: string
		value: Parameters<typeof IbaadahEntry.create>[0]["value"]
		notes?: string
		reflection?: string
		createdAt: Date
		updatedAt: Date
	}
	_ref: co.loaded<typeof IbaadahEntry>
}

type IbaadahEntryDeleted = {
	operation: "delete"
	entryID: string
}
