export type Theme = "current" | "hasiber" | "current-dark" | "hasiber-dark"

export let themes: Theme[] = [
	"current",
	"hasiber",
	"current-dark",
	"hasiber-dark",
]

export interface ThemeConfig {
	name: string
	description: string
	primaryBackground: string
	accent: string
}

export let themeConfigs: Record<Theme, ThemeConfig> = {
	current: {
		name: "Current",
		description: "Default Tilly theme",
		primaryBackground: "oklch(0.99 0.005 180)",
		accent: "oklch(60% 0.118 184.704)",
	},
	hasiber: {
		name: "Hasiber",
		description: "Spiritual teal and lime green",
		primaryBackground: "#1A3A3A",
		accent: "#B2D96F",
	},
	"current-dark": {
		name: "Current Dark",
		description: "Default dark theme",
		primaryBackground: "oklch(0.08 0.015 190)",
		accent: "oklch(0.6 0.118 184.704)",
	},
	"hasiber-dark": {
		name: "Hasiber Dark",
		description: "Dark spiritual theme",
		primaryBackground: "#0F2525",
		accent: "#B2D96F",
	},
}
