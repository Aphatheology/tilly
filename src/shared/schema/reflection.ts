import { co, z } from "jazz-tools"

export type ReflectionMood =
	| "happy"
	| "grateful"
	| "neutral"
	| "sad"
	| "stressed"
	| "inspired"

export let Reflection = co.map({
	version: z.literal(1),
	date: z.string(), // ISO Date YYYY-MM-DD
	content: z.string(),
	mood: z
		.enum(["happy", "grateful", "neutral", "sad", "stressed", "inspired"])
		.optional(),
	tags: co.list(z.string()),
	linkedIbaadahEntryId: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
})
