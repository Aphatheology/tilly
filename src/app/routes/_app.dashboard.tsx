import { createFileRoute, notFound } from "@tanstack/react-router"
import { useAccount } from "jazz-tools/react"
import { UserAccount } from "#shared/schema/user"
import { TypographyH1 } from "#shared/ui/typography"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#shared/ui/card"
import { Button } from "#shared/ui/button"
import { T, useIntl } from "#shared/intl/setup"
import { format } from "date-fns"
import { Calendar, Book, Heart, HandIndex, Moon } from "react-bootstrap-icons"
import type { ResolveQuery } from "jazz-tools"
import { NewIbaadahEntry } from "#app/features/new-ibaadah-entry"
import { NewIbaadahHabit } from "#app/features/new-ibaadah-habit"

export let Route = createFileRoute("/_app/dashboard")({
	loader: async ({ context }) => {
		if (!context.me) throw notFound()
		let loadedMe = await UserAccount.load(context.me.$jazz.id, {
			resolve: dashboardQuery,
		})
		if (!loadedMe.$isLoaded) throw notFound()
		return { me: loadedMe }
	},
	component: DashboardScreen,
})

let dashboardQuery = {
	root: {
		ibaadahEntries: { $each: true },
		ibaadahHabits: { $each: true },
		ibaadahSettings: true,
	},
} as const satisfies ResolveQuery<typeof UserAccount>

function DashboardScreen() {
	let t = useIntl()
	let data = Route.useLoaderData()
	let subscribedMe = useAccount(UserAccount, { resolve: dashboardQuery })
	let currentMe = subscribedMe.$isLoaded ? subscribedMe : data.me

	let today = format(new Date(), "yyyy-MM-dd")
	let allEntries = currentMe.root.ibaadahEntries
		? Array.from(currentMe.root.ibaadahEntries.values())
		: []
	let todayEntries = allEntries.filter(entry => entry && entry.date === today)

	return (
		<div className="space-y-8 pb-20 md:mt-12 md:pb-4">
			<title>{t("dashboard.pageTitle")}</title>
			<TypographyH1>
				<T k="dashboard.title" />
			</TypographyH1>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<IbaadahQuickCard
					type="salah"
					icon={Calendar}
					title={t("dashboard.salah.title")}
					description={t("dashboard.salah.description")}
					todayCount={todayEntries.filter(e => e?.type === "salah").length}
				/>
				<IbaadahQuickCard
					type="quran"
					icon={Book}
					title={t("dashboard.quran.title")}
					description={t("dashboard.quran.description")}
					todayCount={todayEntries.filter(e => e?.type === "quran").length}
				/>
				<IbaadahQuickCard
					type="dhikr"
					icon={Heart}
					title={t("dashboard.dhikr.title")}
					description={t("dashboard.dhikr.description")}
					todayCount={todayEntries.filter(e => e?.type === "dhikr").length}
				/>
				<IbaadahQuickCard
					type="sadaqa"
					icon={HandIndex}
					title={t("dashboard.sadaqa.title")}
					description={t("dashboard.sadaqa.description")}
					todayCount={todayEntries.filter(e => e?.type === "sadaqa").length}
				/>
				<IbaadahQuickCard
					type="fasting"
					icon={Moon}
					title={t("dashboard.fasting.title")}
					description={t("dashboard.fasting.description")}
					todayCount={todayEntries.filter(e => e?.type === "fasting").length}
				/>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						<T k="dashboard.todayProgress.title" />
					</CardTitle>
					<CardDescription>
						<T k="dashboard.todayProgress.description" />
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{todayEntries.length} <T k="dashboard.todayProgress.entries" />
					</div>
				</CardContent>
			</Card>

			{currentMe.root.ibaadahHabits && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>
									<T k="dashboard.customHabits.title" />
								</CardTitle>
								<CardDescription>
									<T k="dashboard.customHabits.description" />
								</CardDescription>
							</div>
							<NewIbaadahHabit>
								<Button size="sm">
									<T k="dashboard.customHabits.add" />
								</Button>
							</NewIbaadahHabit>
						</div>
					</CardHeader>
					<CardContent>
						{Array.from(currentMe.root.ibaadahHabits.values()).length === 0 ? (
							<div className="text-muted-foreground py-4 text-center">
								<T k="dashboard.customHabits.empty" />
							</div>
						) : (
							<div className="space-y-2">
								{Array.from(currentMe.root.ibaadahHabits.values())
									.filter(h => h && h.enabled !== false)
									.map(habit => (
										<div
											key={habit.$jazz.id}
											className="flex items-center justify-between rounded-lg border p-3"
										>
											<div>
												<div className="font-medium">{habit.name}</div>
												{habit.description && (
													<div className="text-muted-foreground text-sm">
														{habit.description}
													</div>
												)}
											</div>
										</div>
									))}
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	)
}

function IbaadahQuickCard({
	type,
	icon: Icon,
	title,
	description,
	todayCount,
}: {
	type: string
	icon: React.ComponentType<{ className?: string }>
	title: string
	description: string
	todayCount: number
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Icon className="size-5" />
					<CardTitle>{title}</CardTitle>
				</div>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="text-2xl font-bold">{todayCount}</div>
					<NewIbaadahEntry
						type={
							type as
								| "salah"
								| "quran"
								| "dhikr"
								| "sadaqa"
								| "fasting"
								| "custom"
						}
					>
						<Button size="sm" variant="outline">
							<T k="dashboard.add" />
						</Button>
					</NewIbaadahEntry>
				</div>
			</CardContent>
		</Card>
	)
}
