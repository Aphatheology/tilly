import { usePoints } from "#app/features/points/use-points"
import { PageHeader } from "#app/components/page-header"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "#app/components/ui/card"
import { format } from "date-fns"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#shared/ui/table"
import type { Loaded } from "jazz-tools"
import { createFileRoute } from "@tanstack/react-router"
import { PointsHistory } from "#shared/schema/points"

export const Route = createFileRoute("/_app/points")({
	component: PointsPage,
})

function PointsPage() {
	const { balance, history } = usePoints()

	const sortedHistory =
		history && history.$isLoaded
			? Array.from(history.values())
					.filter((e): e is Loaded<typeof PointsHistory> =>
						Boolean(e && e.$isLoaded),
					)
					.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			: []

	return (
		<div className="space-y-8">
			<PageHeader
				title="Points & Rewards"
				description="Your spiritual journey gamified."
			/>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Balance</CardTitle>
						<span className="text-2xl">✨</span>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{balance}</div>
						<p className="text-muted-foreground text-xs">
							Keep up the consistency!
						</p>
					</CardContent>
				</Card>
				{/* Future cards for Streak, Level, etc. */}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>History</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Reason</TableHead>
								<TableHead>Category</TableHead>
								<TableHead className="text-right">Points</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedHistory.map(entry => (
								<TableRow key={entry.$jazz.id}>
									<TableCell>
										{format(entry.createdAt, "MMM d, h:mm a")}
									</TableCell>
									<TableCell>{entry.reason}</TableCell>
									<TableCell className="capitalize">{entry.category}</TableCell>
									<TableCell className="text-right font-medium text-green-600">
										+{entry.amount}
									</TableCell>
								</TableRow>
							))}
							{sortedHistory.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-muted-foreground h-24 text-center"
									>
										No points yet. Start logging Ibaadah!
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
