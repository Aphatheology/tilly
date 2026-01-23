import { createFileRoute, Link } from "@tanstack/react-router"
import { useAccount } from "jazz-tools/react"
import { UserAccount } from "#shared/schema/user"
import type { ResolveQuery, Loaded } from "jazz-tools"
import { PageHeader } from "#app/components/page-header"
import { Button } from "#app/components/ui/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "#app/components/ui/card"
import { PointsBadge } from "#app/components/points/PointsBadge"
import { ReflectionEditor } from "#app/features/reflection/ReflectionEditor"
import { usePoints } from "#app/features/points/use-points"
import { format } from "date-fns"
import { useState } from "react"
import { Reflection, type ReflectionMood } from "#shared/schema/reflection"
import { ArrowRight, CheckCircle } from "react-bootstrap-icons"

let dashboardResolve = {
	root: {
		reflections: { $each: true },
	},
} as const satisfies ResolveQuery<typeof UserAccount>

export const Route = createFileRoute("/_app/dashboard")({
	component: DashboardPage,
})

function DashboardPage() {
	const me = useAccount(UserAccount, { resolve: dashboardResolve })
	const { balance } = usePoints()

	const [todaysReflection, setTodaysReflection] = useState<boolean>(() => {
		if (!me.$isLoaded || !me.root?.reflections) return false
		const today = new Date().toISOString().split("T")[0]
		let reflections = Array.from(me.root.reflections.values()).filter(
			(r): r is Loaded<typeof Reflection> => Boolean(r && r.$isLoaded),
		)
		return reflections.some(r => r.date === today && r.content)
	})

	const todayDate = format(new Date(), "EEEE, MMMM d")

	const handleReflectionSubmit = (data: {
		content: string
		mood?: ReflectionMood
		tags: string[]
	}) => {
		if (!me.$isLoaded || !me.root?.reflections) return
		if (!me.root.reflections.$isLoaded) return

		const reflection = Reflection.create({
			version: 1,
			content: data.content,
			mood: data.mood,
			tags: data.tags,
			date: new Date().toISOString().split("T")[0],
			createdAt: new Date(),
			updatedAt: new Date(),
		})

		me.root.reflections.$jazz.push(reflection)
		setTodaysReflection(true)
	}

	return (
		<div className="space-y-8 pb-12">
			<PageHeader
				title="Welcome Back"
				description={todayDate}
				actions={<PointsBadge />}
			/>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Ibaadah Summary Card */}
				<Card className="col-span-full md:col-span-2 lg:col-span-2">
					<CardHeader>
						<CardTitle>Today&apos;s Ibaadah</CardTitle>
						<CardDescription>
							Keep up your spiritual consistency.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-4">
							<p className="text-muted-foreground">
								Track your prayers, reading, and charity.
							</p>
							<div className="flex gap-4">
								<Button asChild>
									<Link to="/ibaadah">
										<CheckCircle className="mr-2 h-4 w-4" />
										Go to Tracker
									</Link>
								</Button>
								<Button variant="outline" asChild>
									<a href="/app/points">
										<ArrowRight className="mr-2 h-4 w-4" />
										View Points History
									</a>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Points Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Your Journey
							<span className="text-2xl">✨</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{balance} Pts</div>
						<p className="text-muted-foreground mt-2 text-sm">
							You&apos;re doing great!
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Daily Reflection Section */}
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold tracking-tight">
						Daily Reflection
					</h2>
					<Button asChild variant="ghost" size="sm">
						<a href="/app/reflections">
							View All
							<ArrowRight className="ml-2 h-4 w-4" />
						</a>
					</Button>
				</div>

				<Card className="bg-muted/30">
					<CardContent className="pt-6">
						{todaysReflection ? (
							<div className="flex flex-col items-center justify-center p-6 text-center">
								<div className="rounded-full bg-green-100 p-3">
									<CheckCircle className="h-6 w-6 text-green-600" />
								</div>
								<h3 className="mt-4 text-lg font-semibold">
									Reflection Completed
								</h3>
								<p className="text-muted-foreground">
									You&apos;ve captured your thoughts for today. MashaAllah!
								</p>
								<Button asChild variant="outline" className="mt-4">
									<a href="/app/reflections">Read Reflections</a>
								</Button>
							</div>
						) : (
							<ReflectionEditor
								onSubmit={handleReflectionSubmit}
								onCancel={() => {}}
							/>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	)
}
