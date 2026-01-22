import { co, z } from "jazz-tools"
import { IbaadahEntry } from "#shared/schema/ibaadah"

export let IbaadahGroup = co.map({
	version: z.literal(1),
	name: z.string(),
	description: z.string().optional(),
	entries: co.list(IbaadahEntry),
	createdAt: z.date(),
	updatedAt: z.date(),
})
