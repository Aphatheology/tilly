import { messages, translate } from "@ccssmnn/intl"

export { baseTourMessages, deTourMessages }

const baseTourMessages = messages({
	// Welcome page messages
	"welcome.title": "Hasiber",
	"welcome.subtitle": "Your family Ibaadah & reflection companion",
	"welcome.takeTour": "Take the Tour",
	"welcome.skip": "Skip",
	"welcome.signIn": "Sign In",
	// Tour step messages
	"welcome.description":
		"Hasiber helps you track salah, Qur'an and other Ibaadah for yourself and your family, reflect together, and stay consistent.",
	"install.title": "Install Hasiber for the best experience",
	"addPerson.title": "Each person has their own space",
	"addPerson.description":
		"Hasiber organizes your worship and reflections by person. Get started by adding someone important.",
	"addPerson.button": "Add Person",
	"addNote.title": "Notes for what to remember",
	"addNote.description":
		"Notes are where you journal what you want to remember about someone.",
	"addNote.button": "Add note to {$name}",
	"addReminder.title": "Reminders to reach out",
	"addReminder.description":
		"Reminders help you stay connected and remember to reach out.",
	"addReminder.button": "Add reminder for {$name}",
	"finish.title": "Finish your Setup",
	"finish.backup": "Sign up to back up and sync your data",
	"finish.notifications": "Enable Push Notifications",
	"finish.plus": "Get Hasiber Plus to have AI assist you",
	"finish.description": "You can do all of that in the settings",
	"finish.button": "Let's go",
	// Navigation
	"navigation.previous": "Previous",
	"navigation.next": "Next",
})

const deTourMessages = translate(baseTourMessages, {
	// Welcome page messages
	"welcome.title": "Hasiber",
	"welcome.subtitle": "Dein Ibaadah-Begleiter für dich und deine Familie",
	"welcome.takeTour": "Tour starten",
	"welcome.skip": "Überspringen",
	"welcome.signIn": "Anmelden",
	// Tour step messages
	"welcome.description":
		"Hasiber hilft dir, Gebete, Qur'an und andere Ibaadah für dich und deine Familie zu verfolgen, gemeinsam zu reflektieren und dranzubleiben.",
	"install.title": "Installiere Hasiber für die beste Erfahrung",
	"addPerson.title": "Jede Person hat ihren eigenen Bereich",
	"addPerson.description":
		"Hasiber organisiert deine Ibaadah und Reflexionen nach Personen. Beginne, indem du jemand Wichtiges hinzufügst.",
	"addPerson.button": "Person hinzufügen",
	"addNote.title": "Notizen für das, woran man sich erinnern möchte",
	"addNote.description":
		"Notizen sind der Ort, an dem du aufschreibst, woran du dich über jemanden erinnern möchtest.",
	"addNote.button": "Notiz für {$name} hinzufügen",
	"addReminder.title": "Erinnerungen, um Kontakt aufzunehmen",
	"addReminder.description":
		"Erinnerungen helfen dir, in Kontakt zu bleiben und daran zu denken, dich zu melden.",
	"addReminder.button": "Erinnerung für {$name} hinzufügen",
	"finish.title": "Schließe deine Einrichtung ab",
	"finish.backup":
		"Melde dich an, um deine Daten zu sichern und zu synchronisieren",
	"finish.notifications": "Push-Benachrichtigungen aktivieren",
	"finish.plus": "Hole dir Hasiber Plus, um KI-Unterstützung zu erhalten",
	"finish.description": "All das kannst du in den Einstellungen tun",
	"finish.button": "Los geht's",
	// Navigation
	"navigation.previous": "Zurück",
	"navigation.next": "Weiter",
})
