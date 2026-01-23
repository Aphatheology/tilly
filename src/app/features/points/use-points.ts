import { useAccount } from "#app/context/jazz-provider"
import { PointsHistory, type PointCategory } from "#shared/schema/points"
import { co } from "jazz-tools"

export function usePoints() {
	const { me } = useAccount()

	const awardPoints = (
		amount: number,
		reason: string,
		category: PointCategory,
	) => {
		if (!me.$isLoaded || !me.root) return

		const loadedMe = me as Extract<typeof me, { $isLoaded: true }>
		if (!loadedMe.root.$isLoaded) return
		const root = loadedMe.root as Extract<typeof loadedMe.root, { $isLoaded: true }>

		// Update balance
		const currentBalance = root.pointsBalance || 0
		root.$jazz.set("pointsBalance", currentBalance + amount)

		// Add history
		if (!root.pointsHistory) {
			root.$jazz.set(
				"pointsHistory",
				co.list(PointsHistory).create([], loadedMe.$jazz.owner),
			)
		}

		if (!root.pointsHistory || !root.pointsHistory.$isLoaded) return

		const historyEntry = PointsHistory.create(
			{
				version: 1,
				amount,
				reason,
				category,
				date: new Date().toISOString().split("T")[0],
				createdAt: new Date(),
			},
			loadedMe.$jazz.owner,
		)

		root.pointsHistory.$jazz.push(historyEntry)
	}

	const loadedMe = me.$isLoaded ? (me as Extract<typeof me, { $isLoaded: true }>) : null
	const root = loadedMe?.root?.$isLoaded 
		? (loadedMe.root as Extract<typeof loadedMe.root, { $isLoaded: true }>)
		: null
	const balance = root?.pointsBalance || 0
	const history = root?.pointsHistory

	return {
		balance,
		history,
		awardPoints,
	}
}
