import { Input } from "#shared/ui/input"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#shared/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Textarea } from "#shared/ui/textarea"
import type { KeyboardEvent } from "react"
import { T, useIntl } from "#shared/intl/setup"
import { Button } from "#shared/ui/button"
import { Switch } from "#shared/ui/switch"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#shared/ui/select"
import type { IbaadahType } from "#shared/schema/ibaadah"

export { IbaadahHabitForm }

type IbaadahHabitFormValues = {
	name: string
	type: IbaadahType
	description?: string
	goal?: {
		daily?: boolean
		weekly?: boolean
		monthly?: boolean
		target?: number
	}
	enabled?: boolean
}

function IbaadahHabitForm({
	defaultValues,
	onCancel,
	onSubmit,
}: {
	defaultValues?: Partial<IbaadahHabitFormValues>
	onCancel: () => void
	onSubmit: (data: IbaadahHabitFormValues) => void
}) {
	let t = useIntl()
	let formSchema = createIbaadahHabitFormSchema(t)
	let form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: defaultValues?.name || "",
			type: defaultValues?.type || "custom",
			description: defaultValues?.description || "",
			goal: defaultValues?.goal || {
				daily: false,
				weekly: false,
				monthly: false,
				target: undefined,
			},
			enabled: defaultValues?.enabled ?? true,
		},
	})

	function submitOnCtrlEnter(e: KeyboardEvent) {
		if (form.formState.isSubmitting) return
		if (e.repeat || e.shiftKey || e.altKey) return
		let isCtrlOrMetaEnter = (e.metaKey || e.ctrlKey) && e.key === "Enter"
		if (isCtrlOrMetaEnter) {
			e.preventDefault()
			form.handleSubmit(onSubmit)()
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.habit.form.name.label" />
							</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.habit.form.type.label" />
							</FormLabel>
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="salah">
										<T k="dashboard.salah.title" />
									</SelectItem>
									<SelectItem value="quran">
										<T k="dashboard.quran.title" />
									</SelectItem>
									<SelectItem value="dhikr">
										<T k="dashboard.dhikr.title" />
									</SelectItem>
									<SelectItem value="sadaqa">
										<T k="dashboard.sadaqa.title" />
									</SelectItem>
									<SelectItem value="fasting">
										<T k="dashboard.fasting.title" />
									</SelectItem>
									<SelectItem value="custom">
										<T k="ibaadah.habit.form.type.custom" />
									</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.habit.form.description.label" />
							</FormLabel>
							<FormControl>
								<Textarea {...field} onKeyDown={submitOnCtrlEnter} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="goal.daily"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<FormLabel className="text-base">
									<T k="ibaadah.habit.form.goal.daily" />
								</FormLabel>
							</div>
							<FormControl>
								<Switch
									checked={field.value || false}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="goal.target"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.habit.form.goal.target.label" />
							</FormLabel>
							<FormControl>
								<Input
									type="number"
									min="0"
									value={
										field.value === undefined || field.value === null
											? ""
											: String(field.value)
									}
									onChange={e =>
										field.onChange(
											e.target.value ? Number(e.target.value) : undefined,
										)
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="enabled"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<FormLabel className="text-base">
									<T k="ibaadah.habit.form.enabled" />
								</FormLabel>
							</div>
							<FormControl>
								<Switch
									checked={field.value ?? true}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" onClick={onCancel}>
						<T k="common.cancel" />
					</Button>
					<Button type="submit" disabled={form.formState.isSubmitting}>
						<T k="form.save" />
					</Button>
				</div>
			</form>
		</Form>
	)
}

function createIbaadahHabitFormSchema(t: ReturnType<typeof useIntl>) {
	return z.object({
		name: z.string().min(1, t("ibaadah.habit.form.name.required")),
		type: z.enum(["salah", "quran", "dhikr", "sadaqa", "fasting", "custom"]),
		description: z.string().optional(),
		goal: z
			.object({
				daily: z.boolean().optional(),
				weekly: z.boolean().optional(),
				monthly: z.boolean().optional(),
				target: z.coerce.number().min(0).optional(),
			})
			.optional(),
		enabled: z.boolean().optional(),
	})
}
