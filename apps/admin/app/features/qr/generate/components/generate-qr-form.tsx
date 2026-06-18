import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'
import {
	Button,
	Checkbox,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import {
	InputField,
	InputLabel,
	FieldError,
} from '@retrouve-ci/ui/components/form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
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
	const processedRef = useRef<ActionResult | undefined>(undefined)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data === processedRef.current) return
		processedRef.current = fetcher.data

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
			<div className="space-y-4">
				<div className="space-y-2">
					<InputLabel htmlFor="count">Quantité</InputLabel>
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
				</div>

				<InputField
					field={fields.batch}
					label="Nom du Batch (optionnel)"
					placeholder="ex: Batch-Juillet-2026"
				/>
			</div>

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
