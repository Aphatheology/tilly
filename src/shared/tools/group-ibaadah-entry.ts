import { UserAccount } from "#shared/schema/user"
import { IbaadahEntry } from "#shared/schema/ibaadah"
import { co } from "jazz-tools"
import { tryCatch } from "#shared/lib/trycatch"
import type { co as CoType } from "jazz-tools"
import { IbaadahGroup } from "#shared/schema/group"

export {
	createGroupIbaadahEntry,
	updateGroupIbaadahEntry,
	deleteGroupIbaadahEntry,
}
export type {
	GroupIbaadahEntryData,
	GroupIbaadahEntryCreated,
	GroupIbaadahEntryUpdated,
	GroupIbaadahEntryDeleted,
}

type GroupIbaadahEntryData = Parameters<typeof IbaadahEntry.create>[0]

type GroupIbaadahEntryCreated = {
	entryID: string
	entry: CoType.loaded<typeof IbaadahEntry>
}

type GroupIbaadahEntryUpdated = {
	operation: "update"
	entryID: string
	current: GroupIbaadahEntryData
	previous: GroupIbaadahEntryData
	_ref: co.loaded<typeof IbaadahEntry>
}

type GroupIbaadahEntryDeleted = {
	operation: "delete"
	entryID: string
}

let errors = {
	USER_NOT_FOUND: "User account not found",
	GROUP_NOT_FOUND: "Group not found",
	ENTRY_NOT_FOUND: "Ibaadah entry not found",
} as const

let groupResolve = { entries: { $each: true } } as const

type LoadedGroup = co.loaded<typeof IbaadahGroup, typeof groupResolve>

async function loadGroup(
	userId: string,
	groupId: string,
): Promise<LoadedGroup> {
	let accountResult = await tryCatch(
		UserAccount.load(userId, {
			resolve: { root: { ibaadahGroups: { $each: true } } },
		}),
	)
	if (!accountResult.ok) throw new Error(errors.USER_NOT_FOUND)
	let account = accountResult.data
	if (!account.$isLoaded) throw new Error(errors.USER_NOT_FOUND)

	let group = await IbaadahGroup.load(groupId, {
		resolve: groupResolve,
		loadAs: account,
	})
	if (!group.$isLoaded) throw new Error(errors.GROUP_NOT_FOUND)
	if (!group.entries.$isLoaded) throw new Error(errors.GROUP_NOT_FOUND)
	return group
}

async function createGroupIbaadahEntry(
	data: GroupIbaadahEntryData,
	options: { userId: string; groupId: string },
): Promise<GroupIbaadahEntryCreated> {
	let group = await loadGroup(options.userId, options.groupId)
	let now = new Date()
	let entry = IbaadahEntry.create(
		{
			...data,
			createdAt: data.createdAt || now,
			updatedAt: now,
		},
		group.$jazz.owner,
	)
	group.entries.$jazz.push(entry)
	group.$jazz.set("updatedAt", now)
	return { entryID: entry.$jazz.id, entry }
}

async function updateGroupIbaadahEntry(
	updates: Partial<GroupIbaadahEntryData>,
	options: { userId: string; groupId: string; entryId: string },
): Promise<GroupIbaadahEntryUpdated> {
	let group = await loadGroup(options.userId, options.groupId)
	let entries = group.entries
	let entryIdx = Array.from(entries.values()).findIndex(
		e => e?.$jazz.id === options.entryId,
	)
	if (entryIdx === -1) throw new Error(errors.ENTRY_NOT_FOUND)
	let entry = Array.from(entries.values()).at(entryIdx)
	if (!entry || !entry.$isLoaded) throw new Error(errors.ENTRY_NOT_FOUND)

	let previous = {
		version: entry.version,
		type: entry.type,
		date: entry.date,
		value: entry.value,
		notes: entry.notes,
		reflection: entry.reflection,
		createdAt: entry.createdAt,
		updatedAt: entry.updatedAt,
	}

	if (updates.type !== undefined) entry.$jazz.set("type", updates.type)
	if (updates.date !== undefined) entry.$jazz.set("date", updates.date)
	if (updates.value !== undefined) entry.$jazz.set("value", updates.value)
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

	let now = new Date()
	entry.$jazz.set("updatedAt", now)
	group.$jazz.set("updatedAt", now)

	return {
		operation: "update",
		entryID: entry.$jazz.id,
		current: {
			version: entry.version,
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

async function deleteGroupIbaadahEntry(options: {
	userId: string
	groupId: string
	entryId: string
}): Promise<GroupIbaadahEntryDeleted> {
	let group = await loadGroup(options.userId, options.groupId)
	let entries = group.entries
	let entryIdx = Array.from(entries.values()).findIndex(
		e => e?.$jazz.id === options.entryId,
	)
	if (entryIdx === -1) throw new Error(errors.ENTRY_NOT_FOUND)
	entries.$jazz.splice(entryIdx, 1)
	group.$jazz.set("updatedAt", new Date())
	return { operation: "delete", entryID: options.entryId }
}
