import { SettingsSection } from "#app/components/settings-section"
import { Input } from "#shared/ui/input"
import { Label } from "#shared/ui/label"
import { Switch } from "#shared/ui/switch"
import { Button } from "#shared/ui/button"
import { T, useIntl } from "#shared/intl/setup"
import { useState } from "react"
import type { co } from "jazz-tools"
import { UserAccount } from "#shared/schema/user"
import { IbaadahSettings } from "#shared/schema/ibaadah"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#shared/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#shared/ui/form"

export { IbaadahReminderSettings }

function IbaadahReminderSettings({
	me,
}: {
	me: co.loaded<typeof UserAccount, { root: { ibaadahSettings: true } }>
}) {
	let t = useIntl()
	let settings = me.root.ibaadahSettings
	let enableReminders = settings?.enableReminders ?? false
	let reminderTimes = settings?.reminderTimes || {}

	function toggleReminders() {
		if (!settings) {
			me.root.$jazz.set("ibaadahSettings", {
				version: 1,
				enableReminders: !enableReminders,
				reminderTimes: {},
			})
		} else {
			settings.$jazz.set("enableReminders", !enableReminders)
		}
	}

	return (
		<SettingsSection
			title={t("ibaadah.reminders.title")}
			description={t("ibaadah.reminders.description")}
		>
			<div className="space-y-4">
				<div className="flex items-center justify-between rounded-lg border p-4">
					<div className="space-y-0.5">
						<Label className="text-base">
							<T k="ibaadah.reminders.enable" />
						</Label>
						<p className="text-muted-foreground text-sm">
							<T k="ibaadah.reminders.enable.description" />
						</p>
					</div>
					<Switch checked={enableReminders} onCheckedChange={toggleReminders} />
				</div>

				{enableReminders && (
					<div className="space-y-3">
						<PrayerTimeInput
							prayer="fajr"
							label={t("ibaadah.form.salah.fajr")}
							currentTime={reminderTimes.fajr}
							settings={settings}
						/>
						<PrayerTimeInput
							prayer="dhuhr"
							label={t("ibaadah.form.salah.dhuhr")}
							currentTime={reminderTimes.dhuhr}
							settings={settings}
						/>
						<PrayerTimeInput
							prayer="asr"
							label={t("ibaadah.form.salah.asr")}
							currentTime={reminderTimes.asr}
							settings={settings}
						/>
						<PrayerTimeInput
							prayer="maghrib"
							label={t("ibaadah.form.salah.maghrib")}
							currentTime={reminderTimes.maghrib}
							settings={settings}
						/>
						<PrayerTimeInput
							prayer="isha"
							label={t("ibaadah.form.salah.isha")}
							currentTime={reminderTimes.isha}
							settings={settings}
						/>
					</div>
				)}
			</div>
		</SettingsSection>
	)
}

function PrayerTimeInput({
	prayer,
	label,
	currentTime,
	settings,
}: {
	prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"
	label: string
	currentTime?: string
	settings?: co.loaded<typeof IbaadahSettings>
}) {
	let translate = useIntl()
	let [dialogOpen, setDialogOpen] = useState(false)
	let formSchema = z.object({
		time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
			message: translate("ibaadah.reminders.time.invalid"),
		}),
	})
	let form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			time: currentTime || "12:00",
		},
	})

	function handleSubmit(data: { time: string }) {
		if (!settings) return
		let currentTimes = settings.reminderTimes || {}
		settings.$jazz.set("reminderTimes", {
			...currentTimes,
			[prayer]: data.time,
		})
		setDialogOpen(false)
	}

	return (
		<>
			<div className="flex items-center justify-between rounded-lg border p-3">
				<div>
					<Label>{label}</Label>
					<p className="text-muted-foreground text-sm">
						{currentTime || translate("ibaadah.reminders.time.notSet")}
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setDialogOpen(true)}
				>
					<T k="common.edit" />
				</Button>
			</div>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent
					titleSlot={
						<DialogHeader>
							<DialogTitle>
								{translate("ibaadah.reminders.time.set").replace(
									"{prayer}",
									label,
								)}
							</DialogTitle>
							<DialogDescription>
								<T k="ibaadah.reminders.time.description" />
							</DialogDescription>
						</DialogHeader>
					}
				>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<T k="ibaadah.reminders.time.label" />
										</FormLabel>
										<FormControl>
											<Input
												type="time"
												{...field}
												style={{ WebkitAppearance: "none" }}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setDialogOpen(false)}
								>
									<T k="common.cancel" />
								</Button>
								<Button type="submit">
									<T k="form.save" />
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	)
}
