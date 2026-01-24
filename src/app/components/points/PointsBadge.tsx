import { usePoints } from "#app/features/points/use-points"
import { Badge } from "#shared/ui/badge"
import { cn } from "#app/lib/utils"

export function PointsBadge({ className }: { className?: string }) {
	const { balance } = usePoints()

	return (
		<Badge
			variant="secondary"
			className={cn(
				"flex items-center gap-1 font-mono transition-all hover:scale-105",
				className,
			)}
		>
			<span className="text-yellow-500">✨</span>
			<span>{balance}</span>
		</Badge>
	)
}
