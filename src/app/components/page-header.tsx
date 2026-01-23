import type { ReactNode } from "react"
import { TypographyH1 } from "#shared/ui/typography"

export function PageHeader(props: {
	title: string
	description?: string
	actions?: ReactNode
}) {
	return (
		<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<TypographyH1>{props.title}</TypographyH1>
				{props.description && (
					<p className="text-muted-foreground mt-1 text-sm md:text-base">
						{props.description}
					</p>
				)}
			</div>
			{props.actions && <div className="mt-2 md:mt-0">{props.actions}</div>}
		</div>
	)
}

