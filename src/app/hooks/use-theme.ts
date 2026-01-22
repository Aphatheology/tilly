import { useEffect } from "react"
import { useAccount } from "jazz-tools/react"
import { UserAccount } from "#shared/schema/user"
import type { Theme } from "#shared/types/theme"

export function useTheme() {
	let me = useAccount(UserAccount, { resolve: { root: true } })
	let currentTheme: Theme = me.$isLoaded
		? me.root.theme || getDefaultTheme()
		: getDefaultTheme()

	function setTheme(theme: Theme) {
		if (me.$isLoaded) {
			me.root.$jazz.set("theme", theme)
		}
		applyTheme(theme)
	}

	useEffect(() => {
		applyTheme(currentTheme)
	}, [currentTheme])

	return { theme: currentTheme, setTheme }
}

function getDefaultTheme(): Theme {
	if (typeof window === "undefined") return "current"
	let prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
	return prefersDark ? "current-dark" : "current"
}

function applyTheme(theme: Theme) {
	if (typeof document === "undefined") return
	let root = document.documentElement
	root.classList.remove(
		"theme-current",
		"theme-hasiber",
		"theme-current-dark",
		"theme-hasiber-dark",
	)
	root.classList.add(`theme-${theme}`)

	let metaThemeColor = document.getElementById("theme-color")
	if (metaThemeColor) {
		let bg = getComputedStyle(root).getPropertyValue("--background").trim()
		metaThemeColor.setAttribute("content", bg)
	}
}
