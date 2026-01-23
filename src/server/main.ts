import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { chatMessagesApp } from "./features/chat-messages"
import { hasiberAiApp } from "./features/hasiber-ai"
import { cronDeliveryApp } from "./features/push-cron"
import { ibaadahReminderCronApp } from "./features/ibaadah-reminder-cron"
import { testNotificationApp } from "./features/push-test"
import { authMiddleware } from "./lib/auth-middleware"

let authenticatedRoutes = new Hono()
	.use(authMiddleware)
	.route("/chat", chatMessagesApp)
	.route("/hasiber-ai", hasiberAiApp)

export let app = new Hono()
	.use(logger())
	.use(cors())
	.route("/push", testNotificationApp)
	.route("/push", cronDeliveryApp)
	.route("/push", ibaadahReminderCronApp)
	.route("/", authenticatedRoutes)

export type AppType = typeof app
