import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import {
	Button,
	Input,
	Checkbox,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Field,
	FieldGroup,
	FieldLabel,
} from '@retrouve-ci/ui/components'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
	useForm,
	useInputControl,
	getFormProps,
	getInputProps,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { generateQrSchema } from '../generate.schema'
import type { QrToken } from '../../qr.types'

interface ActionResult {
	ok: boolean
	tokens?: QrToken[]
	count?: number
	error?: string
}

export function GenerateQrForm() {
	const fetcher = useFetcher<ActionResult>()
	const isGenerating = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data.ok && fetcher.data.tokens) {
			const tokens = fetcher.data.tokens
			const exportCSV = document.getElementById(
				'exportCSV',
			) as HTMLInputElement | null

			if (exportCSV?.checked && tokens.length > 0) {
				const headers = ['code', 'batch', 'status', 'createdAt']
				const rows = tokens.map(t => [
					t.code,
					t.batch ?? '',
					t.status,
					t.createdAt,
				])
				const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
				const blob = new Blob([csv], { type: 'text/csv' })
				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = `qr-tokens-${Date.now()}.csv`
				a.click()
				URL.revokeObjectURL(url)
			}

			toast.success(`${fetcher.data.count} tokens générés avec succès`)
		} else if (fetcher.data && !fetcher.data.ok) {
			toast.error(fetcher.data.error ?? 'Erreur lors de la génération')
		}
	}, [fetcher.state, fetcher.data])

	const [form, fields] = useForm({
		id: 'generate-qr-form',
		constraint: getZodConstraint(generateQrSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: generateQrSchema })
		},
		onSubmit(event, { formData }) {
			event.preventDefault()
			void fetcher.submit(formData, { method: 'post' })
		},
	})

	const countControl = useInputControl(fields.count)

	return (
		<form {...getFormProps(form)} className="space-y-6">
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="count">Quantité</FieldLabel>
					<Select
						value={countControl.value ?? '100'}
						onValueChange={value => countControl.change(value)}
					>
						<SelectTrigger id="count">
							<SelectValue placeholder="Sélectionner une quantité" />
						</SelectTrigger>
						<SelectContent>
							{[10, 25, 50, 100, 250, 500, 1000].map(n => (
								<SelectItem key={n} value={String(n)}>
									{n}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<input
						type="hidden"
						name="count"
						value={countControl.value ?? '100'}
					/>
					<FieldError errors={fields.count.errors} />
				</Field>

				<Field>
					<FieldLabel htmlFor="batch">
						Nom du Batch{' '}
						<span className="text-muted-foreground font-normal">
							(optionnel)
						</span>
					</FieldLabel>
					<Input
						{...getInputProps(fields.batch, { type: 'text' })}
						placeholder="ex: Batch-Juillet-2026"
					/>
					<p className="text-muted-foreground text-xs">
						Utilisé pour organiser les tokens
					</p>
					<FieldError errors={fields.batch.errors} />
				</Field>
			</FieldGroup>

			<div className="space-y-3">
				<p className="text-sm font-medium">Options</p>
				<div className="flex items-center gap-2">
					<Checkbox id="exportCSV" defaultChecked />
					<label
						htmlFor="exportCSV"
						className="cursor-pointer text-sm font-medium"
					>
						Télécharger le CSV après génération
					</label>
				</div>
			</div>

			<Button type="submit" className="w-full" disabled={isGenerating}>
				{isGenerating ? (
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
