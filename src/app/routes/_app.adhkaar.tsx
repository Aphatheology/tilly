import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { T, useIntl } from "#shared/intl/setup"
import { TypographyH1 } from "#shared/ui/typography"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#shared/ui/tabs"
import {
	adhkaar,
	getAdhkaarByCategory,
	type AdhkaarCategory,
} from "#shared/data/adhkaar-data"
import { Card } from "#shared/ui/card"
import { Button } from "#shared/ui/button"
import { Copy, Share } from "react-bootstrap-icons"
import { toast } from "sonner"

export let Route = createFileRoute("/_app/adhkaar")({
	component: AdhkaarReader,
})

function AdhkaarReader() {
	let t = useIntl()
	let [selectedCategory, setSelectedCategory] =
		useState<AdhkaarCategory>("morning")
	let [fontSize, setFontSize] = useState(16)

	let categories: AdhkaarCategory[] = [
		"awakening",
		"morning",
		"after-prayer",
		"evening",
		"sleep",
		"ruqyah",
	]

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text)
		toast.success(t("adhkaar.copied"))
	}

	function shareAdhkar(adhkar: typeof adhkaar[0]) {
		if (navigator.share) {
			navigator.share({
				title: adhkar.translation.substring(0, 50),
				text: `${adhkar.arabic}\n\n${adhkar.translation}`,
			})
		} else {
			copyToClipboard(`${adhkar.arabic}\n\n${adhkar.translation}`)
		}
	}

	return (
		<div className="space-y-6">
			<TypographyH1>
				<T k="adhkaar.title" />
			</TypographyH1>

			<Tabs
				value={selectedCategory}
				onValueChange={v => setSelectedCategory(v as AdhkaarCategory)}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
					{categories.map(category => (
						<TabsTrigger key={category} value={category}>
							<T k={`adhkaar.category.${category}`} />
						</TabsTrigger>
					))}
				</TabsList>

				{categories.map(category => (
					<TabsContent key={category} value={category} className="mt-6">
						<div className="space-y-4">
							{getAdhkaarByCategory(category).map(adhkar => (
								<Card
									key={adhkar.id}
									className="relative p-6"
									style={{ fontSize: `${fontSize}px` }}
								>
									<div className="space-y-4">
										<div
											className="text-2xl leading-relaxed text-right"
											dir="rtl"
											lang="ar"
										>
											{adhkar.arabic}
										</div>
										{adhkar.transliteration && (
											<div className="text-muted-foreground italic text-sm">
												{adhkar.transliteration}
											</div>
										)}
										<div className="text-foreground">{adhkar.translation}</div>
										{adhkar.reference && (
											<div className="text-muted-foreground text-xs">
												Reference: {adhkar.reference}
											</div>
										)}
									</div>
									<div className="absolute bottom-4 left-4 right-4 flex justify-end gap-2">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => copyToClipboard(adhkar.arabic)}
											className="size-8"
										>
											<Copy className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => shareAdhkar(adhkar)}
											className="size-8"
										>
											<Share className="size-4" />
										</Button>
									</div>
								</Card>
							))}
						</div>
					</TabsContent>
				))}
			</Tabs>

			<div className="fixed bottom-4 right-4 flex gap-2 rounded-lg border bg-background p-2 shadow-lg">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setFontSize(Math.max(12, fontSize - 2))}
					className="size-8"
				>
					<span className="text-sm">A-</span>
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setFontSize(Math.min(24, fontSize + 2))}
					className="size-8"
				>
					<span className="text-sm">A+</span>
				</Button>
			</div>
		</div>
	)
}
