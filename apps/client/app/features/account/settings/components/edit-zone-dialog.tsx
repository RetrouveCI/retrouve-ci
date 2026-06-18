import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@retrouve-ci/ui/components'
import { InputLabel, FieldError } from '@retrouve-ci/ui/components/form'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@retrouve-ci/ui/utils'
import { CI_VILLES, ABIDJAN_COMMUNES } from '@/shared/constants'
import { updateZoneSchema } from '../settings.schema'

interface ActionResult {
	ok: boolean
	error?: string
}

interface EditZoneDialogProps {
	currentCity: string | null
	currentCommune: string | null
}

export function EditZoneDialog({
	currentCity,
	currentCommune,
}: EditZoneDialogProps) {
	const fetcher = useFetcher<ActionResult>()
	const [open, setOpen] = useState(false)
	const isSaving = fetcher.state !== 'idle'

	const [form, fields] = useForm({
		id: 'update-zone-form',
		constraint: getZodConstraint(updateZoneSchema),
		defaultValue: { city: currentCity ?? '', commune: currentCommune ?? '' },
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: updateZoneSchema })
		},
	})
	const cityControl = useInputControl(fields.city)
	const communeControl = useInputControl(fields.commune)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data.ok) {
			toast.success('Zone mise à jour')
			setOpen(false)
		} else {
			toast.error(fetcher.data.error ?? 'Une erreur est survenue')
		}
	}, [fetcher.state, fetcher.data])

	const chipClass = (active: boolean) =>
		cn(
			'rounded-full border px-3.5 py-2 text-xs font-medium transition-all',
			active
				? 'bg-primary-green border-primary-green text-white'
				: 'bg-background text-muted-foreground hover:border-primary-green/40 hover:text-foreground',
		)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="rounded-lg text-xs">
					Modifier
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Zone</DialogTitle>
					<DialogDescription className="sr-only">
						Modifier votre lieu d&apos;habitation
					</DialogDescription>
				</DialogHeader>
				<fetcher.Form
					method="post"
					{...getFormProps(form)}
					className="space-y-5"
				>
					<input type="hidden" name="intent" value="update-zone" />

					<div className="space-y-2">
						<InputLabel>Ville</InputLabel>
						<div className="flex flex-wrap gap-2">
							{CI_VILLES.map(city => (
								<button
									key={city}
									type="button"
									onClick={() => {
										cityControl.change(city)
										if (city !== 'Abidjan') communeControl.change('')
									}}
									className={chipClass(cityControl.value === city)}
								>
									{city}
								</button>
							))}
						</div>
						<FieldError errors={fields.city.errors} />
					</div>

					{cityControl.value === 'Abidjan' && (
						<div className="space-y-2">
							<InputLabel>Commune</InputLabel>
							<div className="flex flex-wrap gap-2">
								{ABIDJAN_COMMUNES.map(commune => (
									<button
										key={commune}
										type="button"
										onClick={() => communeControl.change(commune)}
										className={chipClass(communeControl.value === commune)}
									>
										{commune}
									</button>
								))}
							</div>
						</div>
					)}

					<Button
						type="submit"
						disabled={isSaving}
						className="bg-primary-green hover:bg-primary-green-dark h-11 w-full gap-2 rounded-xl text-white"
					>
						{isSaving ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Enregistrement...
							</>
						) : (
							<>
								<Check className="h-4 w-4" />
								Enregistrer
							</>
						)}
					</Button>
				</fetcher.Form>
			</DialogContent>
		</Dialog>
	)
}
