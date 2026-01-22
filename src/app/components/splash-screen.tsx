import { TypographyH1 } from "#shared/ui/typography"
import { motion } from "motion/react"
import { IntlProvider, T } from "#shared/intl/setup"
import { messagesEn } from "#shared/intl/messages"

export function SplashScreen() {
	return (
		<IntlProvider messages={messagesEn} locale="en">
			<div className="flex min-h-screen flex-col items-center justify-center gap-4">
				<motion.img
					src="/app/icons/icon-192x192.png"
					className="size-24 rounded-lg"
					layoutId="logo"
					alt=""
				/>
				<motion.div layoutId="title">
					<TypographyH1>
						<T k="splash.title" />
					</TypographyH1>
				</motion.div>
			</div>
		</IntlProvider>
	)
}
