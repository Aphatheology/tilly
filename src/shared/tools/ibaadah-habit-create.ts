import { UserAccount } from "#shared/schema/user"
import { IbaadahHabit } from "#shared/schema/ibaadah"
import { co } from "jazz-tools"
import { tryCatch } from "#shared/lib/trycatch"
import type { co as CoType } from "jazz-tools"

export type IbaadahHabitData = Parameters<typeof IbaadahHabit.create>[0]

export type IbaadahHabitCreated = {
	habitID: string
	habit: CoType.loaded<typeof IbaadahHabit>
}

export let errors = {
	USER_NOT_FOUND: "User account not found",
	HABIT_CREATION_FAILED: "Failed to create Ibaadah habit",
} as const

export async function createIbaadahHabit(
	data: IbaadahHabitData,
	options: { userId: string },
): Promise<IbaadahHabitCreated> {
	let accountResult = await tryCatch(
		UserAccount.load(options.userId, {
			resolve: { root: { ibaadahHabits: true } },
		}),
	)
	if (!accountResult.ok) throw new Error(errors.USER_NOT_FOUND)

	let account = accountResult.data
	if (!account.$isLoaded) throw new Error(errors.USER_NOT_FOUND)

	let now = new Date()
	let habit = IbaadahHabit.create(
		{
			...data,
			createdAt: data.createdAt || now,
			updatedAt: now,
		},
		account.$jazz.owner,
	)

	if (!account.root.ibaadahHabits) {
		account.root.$jazz.set("ibaadahHabits", co.list(IbaadahHabit).create([]))
	}
	if (!account.root.ibaadahHabits) {
		throw new Error(errors.HABIT_CREATION_FAILED)
	}
	account.root.ibaadahHabits.$jazz.push(habit)

	return {
		habitID: habit.$jazz.id,
		habit,
	}
}
