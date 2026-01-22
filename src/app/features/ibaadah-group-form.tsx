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
import { Button } from "#shared/ui/button"
import { T, useIntl } from "#shared/intl/setup"

export { IbaadahGroupForm }

function createIbaadahGroupFormSchema(t: ReturnType<typeof useIntl>) {
	return z.object({
		name: z.string().min(1, t("ibaadah.group.form.name.required")),
		description: z.string().optional(),
	})
}

function IbaadahGroupForm({
	onSubmit,
	onCancel,
	defaultValues,
}: {
	onSubmit: (data: { name: string; description?: string }) => void
	onCancel: () => void
	defaultValues?: { name?: string; description?: string }
}) {
	let t = useIntl()
	let formSchema = createIbaadahGroupFormSchema(t)
	let form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: defaultValues?.name || "",
			description: defaultValues?.description || "",
		},
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.group.form.name.label" />
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
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<T k="ibaadah.group.form.description.label" />
							</FormLabel>
							<FormControl>
								<Textarea {...field} rows={3} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" onClick={onCancel}>
						<T k="common.cancel" />
					</Button>
					<Button type="submit">
						<T k="common.save" />
					</Button>
				</div>
			</form>
		</Form>
	)
}
