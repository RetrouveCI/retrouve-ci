import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
	Button,
	Checkbox,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { FormInputField, FormRootError } from '@app/ui/components/form'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	generateQrSchema,
	type GenerateQrData,
	type GenerateQrInput,
} from '../generate.schema'
import { tokensToCsv } from '../helpers/qr-csv'
import type { QrToken } from '../../types/qr.types'
import type { action } from '../_index'

const QUANTITIES = [10, 25, 50, 100, 250, 500, 1000]

const DEFAULT_VALUES: GenerateQrInput = {
	count: '100',
	batch: '',
	exportCSV: true,
}

function downloadCsv(tokens: QrToken[]) {
	const blob = new Blob([tokensToCsv(tokens)], { type: 'text/csv' })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = `qr-tokens-${Date.now()}.csv`
	anchor.click()
	URL.revokeObjectURL(url)
}

export function GenerateQrForm() {
	// Holds the values that were actually submitted, so the effect below reads the
	// export choice as it was at submit time and fires exactly once per run.
	const [pending, setPending] = useState<GenerateQrData | null>(null)
	const fetcher = useActionFetcher<typeof action, GenerateQrInput, QrToken[]>()

	const form = useForm<GenerateQrInput, unknown, GenerateQrData>({
		resolver: standardSchemaResolver(generateQrSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: DEFAULT_VALUES,
		errors: fetcher.errors,
	})

	useEffect(() => {
		if (!pending || !fetcher.isOk) return

		setPending(null)
		const tokens = fetcher.data ?? []

		if (pending.exportCSV && tokens.length > 0) downloadCsv(tokens)
		toast.success(`${tokens.length} tokens générés avec succès`)
	}, [pending, fetcher.isOk, fetcher.data])

	const onSubmit = (values: GenerateQrData) => {
		setPending(values)
		void fetcher.submit(
			{ count: String(values.count), batch: values.batch ?? '' },
			{ method: 'post' },
		)
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="space-y-6"
		>
			<FormRootError
				title="Impossible de générer les tokens"
				message={form.formState.errors.root?.message}
			/>

			<FieldGroup className="gap-4">
				<Controller
					control={form.control}
					name="count"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name}>Quantité</FieldLabel>
							<Select
								value={field.value ?? ''}
								onValueChange={field.onChange}
								onOpenChange={open => !open && field.onBlur()}
								disabled={fetcher.isSubmitting}
							>
								<SelectTrigger
									id={field.name}
									aria-invalid={fieldState.invalid}
								>
									<SelectValue placeholder="Sélectionner une quantité" />
								</SelectTrigger>
								<SelectContent>
									{QUANTITIES.map(quantity => (
										<SelectItem key={quantity} value={String(quantity)}>
											{quantity}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{fieldState.error && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<FormInputField
					control={form.control}
					name="batch"
					label="Nom du Batch (optionnel)"
					placeholder="ex: Batch-Juillet-2026"
				/>
			</FieldGroup>

			<div className="space-y-3">
				<p className="text-sm font-medium">Options</p>
				<Controller
					control={form.control}
					name="exportCSV"
					render={({ field }) => (
						<Field orientation="horizontal" className="gap-2">
							<Checkbox
								id={field.name}
								name={field.name}
								ref={field.ref}
								checked={field.value}
								onCheckedChange={checked => field.onChange(checked === true)}
								onBlur={field.onBlur}
								disabled={fetcher.isSubmitting}
							/>
							<FieldLabel htmlFor={field.name} className="cursor-pointer">
								Télécharger le CSV après génération
							</FieldLabel>
						</Field>
					)}
				/>
			</div>

			<Button type="submit" className="w-full" disabled={fetcher.isSubmitting}>
				{fetcher.isSubmitting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Génération en cours...
					</>
				) : (
					'Générer'
				)}
			</Button>
		</form>
	)
}
