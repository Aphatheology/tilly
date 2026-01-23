import { useState } from "react"
import { useAccount } from "#app/context/jazz-provider"
import { PageHeader } from "#app/components/page-header"
import { Button } from "#app/components/ui/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "#app/components/ui/card"
import { ReflectionEditor } from "#app/features/reflection/ReflectionEditor"
import { Reflection, type ReflectionMood } from "#shared/schema/reflection"
import type { Loaded } from "jazz-tools"
import { format } from "date-fns"
import { Plus } from "react-bootstrap-icons"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/reflections")({
	component: ReflectionsPage,
})

function ReflectionsPage() {
	const { me } = useAccount()
	const [isCreating, setIsCreating] = useState(false)

	const handleCreate = (data: {
		content: string
		mood?: ReflectionMood
		tags: string[]
	}) => {
		if (!me.$isLoaded || !me.root?.$isLoaded) return
		const loadedMe = me as Extract<typeof me, { $isLoaded: true }>
		const root = loadedMe.root as Extract<
			typeof loadedMe.root,
			{ $isLoaded: true }
		>
		if (!root.reflections?.$isLoaded) return

		const reflection = Reflection.create(
			{
				version: 1,
				content: data.content,
				mood: data.mood,
				tags: data.tags,
				date: new Date().toISOString().split("T")[0],
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			loadedMe.$jazz.owner,
		)

		root.reflections.$jazz.push(reflection)
		setIsCreating(false)
	}

	const reflections =
		me.$isLoaded && me.root?.$isLoaded && me.root.reflections?.$isLoaded
			? Array.from(me.root.reflections.values()).filter(
					(r): r is Loaded<typeof Reflection> => Boolean(r && r.$isLoaded),
				)
			: []

	return (
		<div className="space-y-8">
			<PageHeader
				title="Reflections"
				description="Track your spiritual state and thoughts."
				actions={
					!isCreating && (
						<Button onClick={() => setIsCreating(true)}>
							<Plus className="mr-2 h-4 w-4" />
							New Reflection
						</Button>
					)
				}
			/>

			{isCreating && (
				<Card>
					<CardHeader>
						<CardTitle>New Reflection</CardTitle>
					</CardHeader>
					<CardContent>
						<ReflectionEditor
							onSubmit={handleCreate}
							onCancel={() => setIsCreating(false)}
						/>
					</CardContent>
				</Card>
			)}

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{reflections.map(reflection => (
					<Card key={reflection.$jazz.id} className="flex flex-col">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="text-muted-foreground text-sm font-medium">
								{format(new Date(reflection.date), "PPP")}
							</div>
							{reflection.mood && (
								<span className="text-2xl" title={reflection.mood}>
									{{
										happy: "😊",
										grateful: "🥰",
										inspired: "🤩",
										neutral: "😐",
										stressed: "😓",
										sad: "😢",
									}[reflection.mood] || "😐"}
								</span>
							)}
						</CardHeader>
						<CardContent className="flex-1">
							<p className="line-clamp-4 text-sm whitespace-pre-wrap">
								{reflection.content}
							</p>
							{reflection.tags?.$isLoaded &&
							Array.from(reflection.tags.values()).length > 0 ? (
								<div className="mt-4 flex flex-wrap gap-1">
									{Array.from(reflection.tags.values()).map(tag => (
										<span
											key={tag}
											className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs"
										>
											#{tag}
										</span>
									))}
								</div>
							) : null}
						</CardContent>
					</Card>
				))}
				{reflections.length === 0 && !isCreating && (
					<div className="text-muted-foreground col-span-full flex flex-col items-center justify-center p-8 text-center">
						<p>No reflections yet. Start by adding one!</p>
					</div>
				)}
			</div>
		</div>
	)
}
