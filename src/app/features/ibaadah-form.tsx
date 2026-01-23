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
import { Plus } from "react-bootstrap-icons"
import type { IbaadahType, SalahPrayer } from "#shared/schema/ibaadah"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#shared/ui/select"
import {
	surahs,
	juzs,
	hizbs,
	getSurahByNumber,
	type QuranUnit,
} from "#shared/data/quran-data"
import {
	getAdhkaarByCategory,
	type AdhkaarCategory,
} from "#shared/data/adhkaar-data"
import { nawaafil } from "#shared/data/nawaafil-data"
import {
	isRamadan,
	isMondayOrThursday,
	isAyyaamulBeed,
} from "#shared/lib/lunar-calendar"
import { useAccount } from "jazz-tools/react"
import { UserAccount } from "#shared/schema/user"
import {
	CustomNawaafilTemplate,
	CustomDhikrTemplate,
} from "#shared/schema/ibaadah"
import { co } from "jazz-tools"
import { toast } from "sonner"

export { IbaadahForm, transformFormDataToIbaadahValue }

export type IbaadahFormValues = {
	type: IbaadahType
	date: string
	salahPrayers?: SalahPrayer[]
	quranUnit?: QuranUnit
	quranValues?: number[]
	quranPages?: number
	quranMinutes?: number
	dhikrCount?: number
	dhikrType?: string
	adhkaarIds?: string[]
	customDhikr?: string
	sadaqaAmount?: number
	sadaqaDescription?: string
	fastingType?: "ramadan" | "monday-thursday" | "ayyaamul-beed" | "custom"
	fastingCustomDescription?: string
	nawaafilIds?: string[]
	customNawaafil?: Array<{ name: string; rakaat?: number }>
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
				unit: data.quranUnit || "pages",
				values: data.quranValues || [],
				pages: data.quranPages,
				minutes: data.quranMinutes,
			}
		case "dhikr":
			return {
				type: "dhikr",
				adhkaarIds: data.adhkaarIds,
				customDhikr: data.customDhikr,
				count: data.dhikrCount,
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
				fastingType: data.fastingType || "ramadan",
				customDescription: data.fastingCustomDescription,
			}
		case "nawaafil":
			return {
				type: "nawaafil",
				nawaafilIds: data.nawaafilIds,
				customNawaafil: data.customNawaafil,
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
	let me = useAccount(UserAccount, {
		resolve: {
			root: {
				customNawaafilTemplates: { $each: true },
				customDhikrTemplates: { $each: true },
			},
		},
	})
	let formSchema = createIbaadahFormSchema(t)
	let form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			type: defaultValues?.type || "salah",
			date: defaultValues?.date || new Date().toISOString().substring(0, 10),
			salahPrayers: defaultValues?.salahPrayers || [],
			quranUnit: defaultValues?.quranUnit || "pages",
			quranValues: defaultValues?.quranValues || [],
			quranPages: defaultValues?.quranPages,
			quranMinutes: defaultValues?.quranMinutes,
			dhikrCount: defaultValues?.dhikrCount,
			dhikrType: defaultValues?.dhikrType,
			adhkaarIds: defaultValues?.adhkaarIds || [],
			customDhikr: defaultValues?.customDhikr,
			sadaqaAmount: defaultValues?.sadaqaAmount,
			sadaqaDescription: defaultValues?.sadaqaDescription,
			fastingType: defaultValues?.fastingType,
			fastingCustomDescription: defaultValues?.fastingCustomDescription,
			nawaafilIds: defaultValues?.nawaafilIds || [],
			customNawaafil: defaultValues?.customNawaafil || [],
			customValue: defaultValues?.customValue,
			notes: defaultValues?.notes,
			reflection: defaultValues?.reflection,
		},
	})

	let type = useWatch({ control: form.control, name: "type" })
	let quranUnit = useWatch({ control: form.control, name: "quranUnit" })
	let fastingType = useWatch({ control: form.control, name: "fastingType" })
	let selectedDate = useWatch({ control: form.control, name: "date" })

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
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.form.type.label" />
							</FormLabel>
							<FormControl>
								<div className="space-y-2">
									<div className="flex flex-wrap gap-2">
										{(["salah", "quran", "dhikr", "nawaafil"] as const).map(
											typeValue => (
												<Button
													key={typeValue}
													type="button"
													variant={
														field.value === typeValue ? "default" : "outline"
													}
													size="sm"
													onClick={() => field.onChange(typeValue)}
													className="hover:text-foreground text-xs"
												>
													<T k={`ibaadah.form.type.${typeValue}`} />
												</Button>
											),
										)}
									</div>
									<div className="flex flex-wrap gap-2">
										{(["fasting", "sadaqa", "custom"] as const).map(
											typeValue => (
												<Button
													key={typeValue}
													type="button"
													variant={
														field.value === typeValue ? "default" : "outline"
													}
													size="sm"
													onClick={() => field.onChange(typeValue)}
													className="text-xs"
												>
													<T k={`ibaadah.form.type.${typeValue}`} />
												</Button>
											),
										)}
									</div>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{!defaultValues?.date && (
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
										value={field.value || ""}
										onChange={e => field.onChange(e.target.value)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{type === "salah" && (
					<FormField
						control={form.control}
						name="salahPrayers"
						render={({ field }) => {
							let allPrayers = [
								"fajr",
								"dhuhr",
								"asr",
								"maghrib",
								"isha",
							] as const
							let allSelected =
								field.value?.length === allPrayers.length &&
								allPrayers.every(p => field.value?.includes(p))

							return (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.salah.prayers.label" />
									</FormLabel>
									<FormControl>
										<div className="space-y-2">
											<div className="flex items-center gap-2 border-b pb-2">
												<Checkbox
													id="select-all-prayers"
													checked={allSelected}
													onCheckedChange={checked => {
														if (checked) {
															field.onChange([...allPrayers])
														} else {
															field.onChange([])
														}
													}}
												/>
												<label
													htmlFor="select-all-prayers"
													className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
												>
													<T k="ibaadah.form.salah.selectAll" />
												</label>
											</div>
											{allPrayers.map(prayer => (
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
											))}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)
						}}
					/>
				)}

				{type === "quran" && (
					<>
						<FormField
							control={form.control}
							name="quranUnit"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.quran.unit.label" />
									</FormLabel>
									<FormControl>
										<Select
											value={field.value || "pages"}
											onValueChange={field.onChange}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="pages">
													<T k="ibaadah.form.quran.unit.pages" />
												</SelectItem>
												<SelectItem value="suurah">
													<T k="ibaadah.form.quran.unit.suurah" />
												</SelectItem>
												<SelectItem value="jizu">
													<T k="ibaadah.form.quran.unit.jizu" />
												</SelectItem>
												<SelectItem value="hizbu">
													<T k="ibaadah.form.quran.unit.hizbu" />
												</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{quranUnit === "suurah" && (
							<FormField
								control={form.control}
								name="quranValues"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<T k="ibaadah.form.quran.suurah.label" />
										</FormLabel>
										<FormControl>
											<div className="max-h-60 space-y-2 overflow-y-auto">
												{surahs.map(surah => (
													<div
														key={surah.number}
														className="flex items-center gap-2"
													>
														<Checkbox
															id={`surah-${surah.number}`}
															checked={
																field.value?.includes(surah.number) || false
															}
															onCheckedChange={checked => {
																let current = field.value || []
																if (checked) {
																	field.onChange([...current, surah.number])
																} else {
																	field.onChange(
																		current.filter(v => v !== surah.number),
																	)
																}
															}}
														/>
														<label
															htmlFor={`surah-${surah.number}`}
															className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
														>
															{surah.number}. {surah.nameArabic} ({surah.name})
														</label>
													</div>
												))}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						{quranUnit === "jizu" && (
							<FormField
								control={form.control}
								name="quranValues"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<T k="ibaadah.form.quran.jizu.label" />
										</FormLabel>
										<FormControl>
											<div className="max-h-60 space-y-2 overflow-y-auto">
												{juzs.map(juz => {
													let startSurah = getSurahByNumber(juz.startSurah)
													let endSurah = getSurahByNumber(juz.endSurah)
													return (
														<div
															key={juz.number}
															className="flex items-center gap-2"
														>
															<Checkbox
																id={`juz-${juz.number}`}
																checked={
																	field.value?.includes(juz.number) || false
																}
																onCheckedChange={checked => {
																	let current = field.value || []
																	if (checked) {
																		field.onChange([...current, juz.number])
																	} else {
																		field.onChange(
																			current.filter(v => v !== juz.number),
																		)
																	}
																}}
															/>
															<label
																htmlFor={`juz-${juz.number}`}
																className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Juz {juz.number}: {startSurah?.nameArabic}{" "}
																{juz.startVerse} - {endSurah?.nameArabic}{" "}
																{juz.endVerse} (Pages {juz.startPage}-
																{juz.endPage})
															</label>
														</div>
													)
												})}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						{quranUnit === "hizbu" && (
							<FormField
								control={form.control}
								name="quranValues"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<T k="ibaadah.form.quran.hizbu.label" />
										</FormLabel>
										<FormControl>
											<div className="max-h-60 space-y-2 overflow-y-auto">
												{hizbs.map(hizb => {
													let startSurah = getSurahByNumber(hizb.startSurah)
													let endSurah = getSurahByNumber(hizb.endSurah)
													return (
														<div
															key={hizb.number}
															className="flex items-center gap-2"
														>
															<Checkbox
																id={`hizb-${hizb.number}`}
																checked={
																	field.value?.includes(hizb.number) || false
																}
																onCheckedChange={checked => {
																	let current = field.value || []
																	if (checked) {
																		field.onChange([...current, hizb.number])
																	} else {
																		field.onChange(
																			current.filter(v => v !== hizb.number),
																		)
																	}
																}}
															/>
															<label
																htmlFor={`hizb-${hizb.number}`}
																className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Hizb {hizb.number}: {startSurah?.nameArabic}{" "}
																{hizb.startVerse} - {endSurah?.nameArabic}{" "}
																{hizb.endVerse} (Pages {hizb.startPage}-
																{hizb.endPage})
															</label>
														</div>
													)
												})}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						{quranUnit === "pages" && (
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
													max="604"
													value={
														field.value === undefined ? "" : String(field.value)
													}
													onChange={e =>
														field.onChange(
															e.target.value
																? Number(e.target.value)
																: undefined,
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
															e.target.value
																? Number(e.target.value)
																: undefined,
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
					</>
				)}

				{type === "dhikr" && (
					<>
						<FormField
							control={form.control}
							name="adhkaarIds"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.dhikr.adhkaar.label" />
									</FormLabel>
									<FormControl>
										<div className="space-y-2">
											{(["morning", "evening"] as AdhkaarCategory[]).map(
												category => {
													let categoryAdhkaar = getAdhkaarByCategory(category)
													let categoryKey = `dhikr-${category}`
													return (
														<div
															key={category}
															className="flex items-center gap-2"
														>
															<Checkbox
																id={categoryKey}
																checked={
																	categoryAdhkaar.every(adhkar =>
																		field.value?.includes(adhkar.id),
																	) || false
																}
																onCheckedChange={checked => {
																	let current = field.value || []
																	if (checked) {
																		let allIds = categoryAdhkaar.map(a => a.id)
																		let newIds = [
																			...current.filter(
																				id => !allIds.includes(id),
																			),
																			...allIds,
																		]
																		field.onChange(newIds)
																	} else {
																		let allIds = categoryAdhkaar.map(a => a.id)
																		field.onChange(
																			current.filter(
																				id => !allIds.includes(id),
																			),
																		)
																	}
																}}
															/>
															<label
																htmlFor={categoryKey}
																className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																<T
																	k={`ibaadah.form.dhikr.category.${category}`}
																/>
															</label>
														</div>
													)
												},
											)}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="customDhikr"
							render={({ field }) => {
								let savedTemplates =
									me.$isLoaded && me.root.customDhikrTemplates
										? Array.from(me.root.customDhikrTemplates.values()).filter(
												(t): t is Extract<typeof t, { $isLoaded: true }> =>
													t?.$isLoaded === true,
											)
										: []

								return (
									<FormItem>
										<FormLabel>
											<T k="ibaadah.form.dhikr.custom.label" />
										</FormLabel>
										<FormControl>
											<div className="space-y-2">
												{savedTemplates.length > 0 && (
													<div className="space-y-1 rounded-md border p-2">
														<div className="text-muted-foreground mb-1 text-xs">
															<T k="ibaadah.form.dhikr.savedTemplates" />
														</div>
														{savedTemplates.map(template => (
															<Button
																key={template.$jazz.id}
																type="button"
																variant="outline"
																size="sm"
																className="w-full justify-start text-left"
																onClick={() => {
																	field.onChange(template.name)
																}}
															>
																{template.name}
															</Button>
														))}
													</div>
												)}
												<Textarea
													{...field}
													placeholder={t(
														"ibaadah.form.dhikr.custom.placeholder",
													)}
												/>
												{me.$isLoaded && field.value && (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => {
															if (!me.$isLoaded || !me.root || !field.value)
																return
															if (!me.root.customDhikrTemplates) {
																me.root.$jazz.set(
																	"customDhikrTemplates",
																	co.list(CustomDhikrTemplate).create([]),
																)
															}
															let templates = me.root.customDhikrTemplates
															if (!templates) return
															let existing = Array.from(
																templates.values(),
															).find(t => t.$isLoaded && t.name === field.value)
															if (!existing) {
																let now = new Date()
																let template = CustomDhikrTemplate.create({
																	version: 1,
																	name: field.value,
																	createdAt: now,
																	updatedAt: now,
																})
																;(
																	templates as NonNullable<typeof templates>
																).$jazz.push(template)
																toast.success(t("ibaadah.template.saved"))
															} else {
																toast.info(t("ibaadah.template.alreadyExists"))
															}
														}}
														title={t("ibaadah.form.dhikr.saveTemplate")}
													>
														<T k="ibaadah.form.dhikr.saveTemplate" />
													</Button>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
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
					<>
						<FormField
							control={form.control}
							name="fastingType"
							render={({ field }) => {
								let date = selectedDate ? new Date(selectedDate) : new Date()
								let inRamadan = isRamadan()
								let isMonThu = isMondayOrThursday(date)
								let isBeed = isAyyaamulBeed(date)

								return (
									<FormItem>
										<FormLabel>
											<T k="ibaadah.form.fasting.type.label" />
										</FormLabel>
										<FormControl>
											<Select
												value={field.value || undefined}
												onValueChange={field.onChange}
											>
												<SelectTrigger>
													<SelectValue
														placeholder={
															!field.value
																? inRamadan
																	? t("ibaadah.form.fasting.type.ramadan")
																	: isMonThu
																		? t(
																				"ibaadah.form.fasting.type.mondayThursday",
																			)
																		: isBeed
																			? t(
																					"ibaadah.form.fasting.type.ayyaamulBeed",
																				)
																			: t("ibaadah.form.fasting.type.custom")
																: undefined
														}
													/>
												</SelectTrigger>
												<SelectContent>
													{inRamadan && (
														<SelectItem value="ramadan">
															<T k="ibaadah.form.fasting.type.ramadan" />
														</SelectItem>
													)}
													<SelectItem
														value="monday-thursday"
														disabled={!isMonThu}
													>
														<T k="ibaadah.form.fasting.type.mondayThursday" />
														{!isMonThu && (
															<span className="text-muted-foreground text-xs">
																{" "}
																(Only on Monday/Thursday)
															</span>
														)}
													</SelectItem>
													<SelectItem value="ayyaamul-beed" disabled={!isBeed}>
														<T k="ibaadah.form.fasting.type.ayyaamulBeed" />
														{!isBeed && (
															<span className="text-muted-foreground text-xs">
																{" "}
																(Only on 13-15 of lunar month)
															</span>
														)}
													</SelectItem>
													<SelectItem value="custom">
														<T k="ibaadah.form.fasting.type.custom" />
													</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
						/>
						{fastingType === "custom" && (
							<FormField
								control={form.control}
								name="fastingCustomDescription"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<T k="ibaadah.form.fasting.custom.description.label" />
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</>
				)}
				{type === "nawaafil" && (
					<>
						<FormField
							control={form.control}
							name="nawaafilIds"
							render={({ field }) => {
								let savedTemplates =
									me.$isLoaded && me.root.customNawaafilTemplates
										? Array.from(
												me.root.customNawaafilTemplates.values(),
											).filter(
												(t): t is Extract<typeof t, { $isLoaded: true }> =>
													t?.$isLoaded === true,
											)
										: []

								return (
									<FormItem>
										<FormLabel>
											<T k="ibaadah.form.nawaafil.label" />
										</FormLabel>
										<FormControl>
											<div className="max-h-60 space-y-2 overflow-y-auto">
												{nawaafil.map(nawafil => (
													<div
														key={nawafil.id}
														className="flex items-center gap-2"
													>
														<Checkbox
															id={nawafil.id}
															checked={
																field.value?.includes(nawafil.id) || false
															}
															onCheckedChange={checked => {
																let current = field.value || []
																if (checked) {
																	field.onChange([...current, nawafil.id])
																} else {
																	field.onChange(
																		current.filter(id => id !== nawafil.id),
																	)
																}
															}}
														/>
														<label
															htmlFor={nawafil.id}
															className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
														>
															{nawafil.name} ({nawafil.rakaat} rakaat)
														</label>
													</div>
												))}
												{savedTemplates.length > 0 && (
													<div className="mt-2 border-t pt-2">
														<div className="text-muted-foreground mb-2 text-xs">
															<T k="ibaadah.form.nawaafil.savedTemplates" />
														</div>
														{savedTemplates.map(template => (
															<div
																key={template.$jazz.id}
																className="flex items-center gap-2"
															>
																<Checkbox
																	id={`template-${template.$jazz.id}`}
																	checked={false}
																	onCheckedChange={checked => {
																		if (checked) {
																			let customNawaafil =
																				form.getValues("customNawaafil") || []
																			form.setValue("customNawaafil", [
																				...customNawaafil,
																				{
																					name: template.name,
																					rakaat: template.rakaat,
																				},
																			])
																		}
																	}}
																/>
																<label
																	htmlFor={`template-${template.$jazz.id}`}
																	className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
																>
																	{template.name}
																	{template.rakaat &&
																		` (${template.rakaat} rakaat)`}
																</label>
															</div>
														))}
													</div>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
						/>
						<FormField
							control={form.control}
							name="customNawaafil"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T k="ibaadah.form.nawaafil.custom.label" />
									</FormLabel>
									<FormControl>
										<div className="space-y-2">
											{(field.value || []).map((item, index) => (
												<div key={index} className="space-y-2">
													<div className="flex items-center gap-2">
														<Input
															placeholder={t(
																"ibaadah.form.nawaafil.custom.placeholder",
															)}
															value={item.name}
															onChange={e => {
																let updated = [...(field.value || [])]
																updated[index] = {
																	...item,
																	name: e.target.value,
																}
																field.onChange(updated)
															}}
															className="flex-1"
														/>
														<Input
															type="number"
															min="1"
															placeholder={t(
																"ibaadah.form.nawaafil.rakaat.label",
															)}
															value={
																item.rakaat === undefined
																	? ""
																	: String(item.rakaat)
															}
															onChange={e => {
																let updated = [...(field.value || [])]
																updated[index] = {
																	...item,
																	rakaat: e.target.value
																		? Number(e.target.value)
																		: undefined,
																}
																field.onChange(updated)
															}}
															className="w-24"
														/>
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => {
																let updated = [...(field.value || [])]
																updated.splice(index, 1)
																field.onChange(updated)
															}}
														>
															<T k="form.remove" />
														</Button>
													</div>
													{me.$isLoaded && item.name && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => {
																if (!me.$isLoaded || !me.root || !item.name)
																	return
																if (!me.root.customNawaafilTemplates) {
																	me.root.$jazz.set(
																		"customNawaafilTemplates",
																		co.list(CustomNawaafilTemplate).create([]),
																	)
																}
																let templates = me.root.customNawaafilTemplates
																if (!templates) return
																let existing = Array.from(
																	templates.values(),
																).find(t => t.$isLoaded && t.name === item.name)
																if (!existing) {
																	let now = new Date()
																	let templateInit: {
																		version: 1
																		name: string
																		createdAt: Date
																		updatedAt: Date
																		rakaat?: number
																	} = {
																		version: 1,
																		name: item.name,
																		createdAt: now,
																		updatedAt: now,
																	}
																	if (typeof item.rakaat === "number") {
																		templateInit.rakaat = item.rakaat
																	}
																	let template =
																		CustomNawaafilTemplate.create(templateInit)
																	;(
																		templates as NonNullable<typeof templates>
																	).$jazz.push(template)
																	toast.success(t("ibaadah.template.saved"))
																} else {
																	toast.info(
																		t("ibaadah.template.alreadyExists"),
																	)
																}
															}}
															title={t("ibaadah.form.nawaafil.saveTemplate")}
														>
															<T k="ibaadah.form.nawaafil.saveTemplate" />
														</Button>
													)}
												</div>
											))}
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => {
													field.onChange([
														...(field.value || []),
														{ name: "", rakaat: undefined },
													])
												}}
											>
												<Plus className="size-4" />
												<span className="ml-2">
													<T k="ibaadah.form.nawaafil.custom.add" />
												</span>
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
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
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						className="hover:text-foreground"
					>
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
		type: z.enum([
			"salah",
			"quran",
			"dhikr",
			"sadaqa",
			"fasting",
			"nawaafil",
			"custom",
		]),
		date: z.string().min(1, t("ibaadah.form.date.required")),
		salahPrayers: z
			.array(z.enum(["fajr", "dhuhr", "asr", "maghrib", "isha"]))
			.optional(),
		quranUnit: z.enum(["suurah", "jizu", "hizbu", "pages"]).optional(),
		quranValues: z.array(z.coerce.number().min(1)).optional(),
		quranPages: z.coerce.number().min(0).max(604).optional(),
		quranMinutes: z.coerce.number().min(0).optional(),
		dhikrCount: z.coerce.number().min(0).optional(),
		dhikrType: z.string().optional(),
		adhkaarIds: z.array(z.string()).optional(),
		customDhikr: z.string().optional(),
		sadaqaAmount: z.coerce.number().min(0).optional(),
		sadaqaDescription: z.string().optional(),
		fastingType: z
			.enum(["ramadan", "monday-thursday", "ayyaamul-beed", "custom"])
			.optional(),
		fastingCustomDescription: z.string().optional(),
		nawaafilIds: z.array(z.string()).optional(),
		customNawaafil: z
			.array(
				z.object({
					name: z.string().min(1),
					rakaat: z.coerce.number().min(1).optional(),
				}),
			)
			.optional(),
		customValue: z.string().optional(),
		notes: z.string().optional(),
		reflection: z.string().optional(),
	})
}
