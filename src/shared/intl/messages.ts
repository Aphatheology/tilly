import { merge, check } from "@ccssmnn/intl"

// Consolidated catalog modules
import { basePeopleMessages, dePeopleMessages } from "./messages.people"
import { arPeopleMessages } from "./messages.people.ar"
import {
	baseRemindersMessages,
	deRemindersMessages,
} from "./messages.reminders"
import { arRemindersMessages } from "./messages.reminders.ar"
import { baseNotesMessages, deNotesMessages } from "./messages.notes"
import { arNotesMessages } from "./messages.notes.ar"
import { baseSettingsMessages, deSettingsMessages } from "./messages.settings"
import { arSettingsMessages } from "./messages.settings.ar"
import {
	baseAssistantMessages,
	deAssistantMessages,
} from "./messages.assistant"
import { arAssistantMessages } from "./messages.assistant.ar"
import { baseUiMessages, deUiMessages } from "./messages.ui"
import { arUiMessages } from "./messages.ui.ar"
import { baseServerMessages, deServerMessages } from "./messages.server"
import { arServerMessages } from "./messages.server.ar"
import { baseTourMessages, deTourMessages } from "./messages.tour"
import {
	baseIbaadahMessages,
	deIbaadahMessages,
	arIbaadahMessages,
} from "./messages.ibaadah"
import { arTourMessages } from "./messages.tour.ar"

export { messagesEn, messagesDe, messagesAr }

let messagesEn = merge(
	basePeopleMessages,
	baseRemindersMessages,
	baseNotesMessages,
	baseSettingsMessages,
	baseAssistantMessages,
	baseUiMessages,
	baseServerMessages,
	baseTourMessages,
	baseIbaadahMessages,
)

let messagesDe = check(
	messagesEn,
	dePeopleMessages,
	deRemindersMessages,
	deNotesMessages,
	deSettingsMessages,
	deAssistantMessages,
	deUiMessages,
	deServerMessages,
	deTourMessages,
	deIbaadahMessages,
)

let messagesAr = check(
	messagesEn,
	arPeopleMessages,
	arRemindersMessages,
	arNotesMessages,
	arSettingsMessages,
	arAssistantMessages,
	arUiMessages,
	arServerMessages,
	arTourMessages,
	arIbaadahMessages,
) as unknown as typeof messagesEn
