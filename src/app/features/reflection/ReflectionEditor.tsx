import { useState } from "react"
import type { ReflectionMood } from "#shared/schema/reflection"
import { Button } from "#app/components/ui/button"
import { Textarea } from "#app/components/ui/textarea"
import { Badge } from "#app/components/ui/badge"
import { Label } from "#app/components/ui/label"
import { cn } from "#app/utils"

interface ReflectionEditorProps {
	initialContent?: string
	initialMood?: ReflectionMood
	initialTags?: string[]
	onSubmit: (data: {
		content: string
		mood?: ReflectionMood
		tags: string[]
	}) => void
	onCancel: () => void
}

const MOODS: { type: ReflectionMood; emoji: string; label: string }[] = [
	{ type: "happy", emoji: "😊", label: "Happy" },
	{ type: "grateful", emoji: "🥰", label: "Grateful" },
	{ type: "inspired", emoji: "🤩", label: "Inspired" },
	{ type: "neutral", emoji: "😐", label: "Neutral" },
	{ type: "stressed", emoji: "😓", label: "Stressed" },
	{ type: "sad", emoji: "😢", label: "Sad" },
]

export function ReflectionEditor({
	initialContent = "",
	initialMood,
	initialTags = [],
	onSubmit,
	onCancel,
}: ReflectionEditorProps) {
	const [content, setContent] = useState(initialContent)
	const [mood, setMood] = useState<ReflectionMood | undefined>(initialMood)
	const [tags, setTags] = useState<string[]>(initialTags)
	const [tagInput, setTagInput] = useState("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSubmit({ content, mood, tags })
	}

	const addTag = () => {
		if (tagInput.trim() && !tags.includes(tagInput.trim())) {
			setTags([...tags, tagInput.trim()])
			setTagInput("")
		}
	}

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter(tag => tag !== tagToRemove))
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-2">
				<Label>How are you feeling?</Label>
				<div className="flex flex-wrap gap-4">
					{MOODS.map(m => (
						<button
							key={m.type}
							type="button"
							onClick={() => setMood(m.type)}
							className={cn(
								"group relative flex flex-col items-center justify-center p-2 transition-all hover:scale-110 focus:outline-none",
								mood === m.type
									? "scale-110 transform"
									: "opacity-70 hover:opacity-100",
							)}
						>
							<span
								className="text-4xl drop-shadow-md filter transition-all group-hover:drop-shadow-xl"
								style={{
									filter:
										mood === m.type
											? "drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
											: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
								}}
							>
								{m.emoji}
							</span>
							<span className="text-muted-foreground mt-1 text-xs font-medium">
								{m.label}
							</span>
							{mood === m.type && (
								<div className="bg-primary absolute -bottom-1 h-1 w-1 rounded-full" />
							)}
						</button>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="content">Your Reflection</Label>
				<Textarea
					id="content"
					placeholder="What's on your mind today? Reflect on your Ibaadah, your state, or your gratitude..."
					value={content}
					onChange={e => setContent(e.target.value)}
					className="min-h-[150px] resize-y text-lg"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="tags">Tags</Label>
				<div className="mb-2 flex flex-wrap gap-2">
					{tags.map(tag => (
						<Badge key={tag} variant="secondary" className="px-2 py-1">
							{tag}
							<button
								type="button"
								onClick={() => removeTag(tag)}
								className="hover:text-destructive ml-2"
							>
								×
							</button>
						</Badge>
					))}
				</div>
				<div className="flex gap-2">
					<input
						id="tags"
						type="text"
						value={tagInput}
						onChange={e => setTagInput(e.target.value)}
						onKeyDown={e => {
							if (e.key === "Enter") {
								e.preventDefault()
								addTag()
							}
						}}
						placeholder="Add a tag..."
						className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					/>
					<Button type="button" variant="outline" onClick={addTag}>
						Add
					</Button>
				</div>
			</div>

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={!content.trim()}>
					Save Reflection
				</Button>
			</div>
		</form>
	)
}
