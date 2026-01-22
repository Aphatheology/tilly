import { Input } from "#shared/ui/input"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#shared/ui/form"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Textarea } from "#shared/ui/textarea"
import type { KeyboardEvent } from "react"
import { T, useIntl } from "#shared/intl/setup"
import { Checkbox } from "#shared/ui/checkbox"
import { Button } from "#shared/ui/button"
import type { IbaadahType, SalahPrayer } from "#shared/schema/ibaadah"

export { IbaadahForm, transformFormDataToIbaadahValue }

type IbaadahFormValues = {
	type: IbaadahType
	date: string
	salahPrayers?: SalahPrayer[]
	quranPages?: number
	quranMinutes?: number
	dhikrCount?: number
	dhikrType?: string
	sadaqaAmount?: number
	sadaqaDescription?: string
	fastingIsRamadan?: boolean
	customValue?: string
	notes?: string
	reflection?: string
}

function transformFormDataToIbaadahValue(
	data: IbaadahFormValues,
): Parameters<
	typeof import("#shared/schema/ibaadah").IbaadahEntry.create
>[0]["value"] {
	switch (data.type) {
		case "salah":
			return {
				type: "salah",
				prayers: data.salahPrayers || [],
			}
		case "quran":
			return {
				type: "quran",
				pages: data.quranPages,
				minutes: data.quranMinutes,
			}
		case "dhikr":
			return {
				type: "dhikr",
				count: data.dhikrCount || 0,
				dhikrType: data.dhikrType,
			}
		case "sadaqa":
			return {
				type: "sadaqa",
				amount: data.sadaqaAmount,
				description: data.sadaqaDescription,
			}
		case "fasting":
			return {
				type: "fasting",
				isRamadan: data.fastingIsRamadan,
			}
		case "custom":
			return {
				type: "custom",
				value: data.customValue || "",
			}
	}
}

function IbaadahForm({
	defaultValues,
	onCancel,
	onSubmit,
}: {
	defaultValues?: Partial<IbaadahFormValues>
	onCancel: () => void
	onSubmit: (data: IbaadahFormValues) => void
}) {
	let t = useIntl()
	let formSchema = createIbaadahFormSchema(t)
	let form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			type: defaultValues?.type || "salah",
			date: defaultValues?.date || new Date().toISOString().substring(0, 10),
			salahPrayers: defaultValues?.salahPrayers || [],
			quranPages: defaultValues?.quranPages,
			quranMinutes: defaultValues?.quranMinutes,
			dhikrCount: defaultValues?.dhikrCount,
			dhikrType: defaultValues?.dhikrType,
			sadaqaAmount: defaultValues?.sadaqaAmount,
			sadaqaDescription: defaultValues?.sadaqaDescription,
			fastingIsRamadan: defaultValues?.fastingIsRamadan,
			customValue: defaultValues?.customValue,
			notes: defaultValues?.notes,
			reflection: defaultValues?.reflection,
		},
	})

	let type = useWatch({ control: form.control, name: "type" })

	function submitOnCtrlEnter(e: KeyboardEvent) {
		if (form.formState.isSubmitting) return
		if (e.repeat || e.shiftKey || e.altKey) return
		let isCtrlOrMetaEnter = (e.metaKey || e.ctrlKey) && e.key === "Enter"
		if (isCtrlOrMetaEnter) {
			e.preventDefault()
			form.handleSubmit(onSubmit)()
		}
	}

	function handleFormSubmit(data: IbaadahFormValues) {
		onSubmit(data)
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleFormSubmit)}
				className="space-y-3"
			>
				<FormField
					control={form.control}
					name="date"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.form.date.label" />
							</FormLabel>
							<FormControl>
								<Input
									style={{ WebkitAppearance: "none" }}
									type="date"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{type === "salah" && (
					<FormField
						control={form.control}
						name="salahPrayers"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<T k="ibaadah.form.salah.prayers.label" />
								</FormLabel>
								<FormControl>
									<div className="space-y-2">
										{(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map(
											prayer => (
												<div key={prayer} className="flex items-center gap-2">
													<Checkbox
														id={prayer}
														checked={field.value?.includes(prayer) || false}
														onCheckedChange={checked => {
															let current = field.value || []
															if (checked) {
																field.onChange([...current, prayer])
															} else {
																field.onChange(
																	current.filter(p => p !== prayer),
																)
															}
														}}
													/>
													<label
														htmlFor={prayer}
														className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
													>
														<T k={`ibaadah.form.salah.${prayer}`} />
													</label>
												</div>
											),
										)}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{type === "quran" && (
					<>
						<FormField
							control={form.control}
							name="quranPages"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.quran.pages.label" />
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											value={
												field.value === undefined ? "" : String(field.value)
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
							name="quranMinutes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.quran.minutes.label" />
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											value={
												field.value === undefined ? "" : String(field.value)
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
					</>
				)}

				{type === "dhikr" && (
					<>
						<FormField
							control={form.control}
							name="dhikrCount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.dhikr.count.label" />
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											value={
												field.value === undefined ? "" : String(field.value)
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
							name="dhikrType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.dhikr.type.label" />
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder={t("ibaadah.form.dhikr.type.placeholder")}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}

				{type === "sadaqa" && (
					<>
						<FormField
							control={form.control}
							name="sadaqaAmount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.sadaqa.amount.label" />
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											step="0.01"
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
							name="sadaqaDescription"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.sadaqa.description.label" />
									</FormLabel>
									<FormControl>
										<Textarea {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}

				{type === "fasting" && (
					<FormField
						control={form.control}
						name="fastingIsRamadan"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center gap-2 space-y-0">
								<FormControl>
									<Checkbox
										checked={field.value || false}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<FormLabel>
									<T k="ibaadah.form.fasting.ramadan.label" />
								</FormLabel>
							</FormItem>
						)}
					/>
				)}

				{type === "custom" && (
					<FormField
						control={form.control}
						name="customValue"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									<T k="ibaadah.form.custom.value.label" />
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.form.notes.label" />
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
					name="reflection"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.form.reflection.label" />
							</FormLabel>
							<FormControl>
								<Textarea {...field} onKeyDown={submitOnCtrlEnter} />
							</FormControl>
							<FormMessage />
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

function createIbaadahFormSchema(t: ReturnType<typeof useIntl>) {
	return z.object({
		type: z.enum(["salah", "quran", "dhikr", "sadaqa", "fasting", "custom"]),
		date: z.string().min(1, t("ibaadah.form.date.required")),
		salahPrayers: z
			.array(z.enum(["fajr", "dhuhr", "asr", "maghrib", "isha"]))
			.optional(),
		quranPages: z.coerce.number().min(0).optional(),
		quranMinutes: z.coerce.number().min(0).optional(),
		dhikrCount: z.coerce.number().min(0).optional(),
		dhikrType: z.string().optional(),
		sadaqaAmount: z.coerce.number().min(0).optional(),
		sadaqaDescription: z.string().optional(),
		fastingIsRamadan: z.boolean().optional(),
		customValue: z.string().optional(),
		notes: z.string().optional(),
		reflection: z.string().optional(),
	})
}
