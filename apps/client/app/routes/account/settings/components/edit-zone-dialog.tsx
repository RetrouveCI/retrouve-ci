import { useEffect, useState } from 'react'
import { useController, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	FieldError,
} from '@app/ui/components'
import { FormRootError, InputLabel } from '@app/ui/components/form'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@app/ui/utils'
import { CI_VILLES, ABIDJAN_COMMUNES } from '@/shared/constants/locations'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	updateZoneSchema,
	type UpdateZoneData,
	type UpdateZoneInput,
} from '../settings.schema'
import type { action } from '../_index'

const COMMUNE_CITY = 'Abidjan'

interface EditZoneDialogProps {
	currentCity: string | null
	currentCommune: string | null
	trigger: React.ReactNode
}

export function EditZoneDialog({
	currentCity,
	currentCommune,
	trigger,
}: EditZoneDialogProps) {
	const [open, setOpen] = useState(false)
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const fetcher = useActionFetcher<typeof action, UpdateZoneInput>()

	const form = useForm<UpdateZoneInput, unknown, UpdateZoneData>({
		resolver: standardSchemaResolver(updateZoneSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		errors: fetcher.errors,
		defaultValues: {
			intent: 'update-zone',
			city: currentCity ?? '',
			commune: currentCommune ?? '',
		},
	})

	// `useController` rather than a render prop per field: picking a city outside
	// Abidjan has to clear the commune, so one field's handler reaches the other.
	const city = useController({ control: form.control, name: 'city' })
	const commune = useController({ control: form.control, name: 'commune' })

	const onSubmit = (values: UpdateZoneData) => {
		setHasSubmitted(true)
		void fetcher.submit(values, { method: 'post' })
	}

	useEffect(() => {
		if (!hasSubmitted || !fetcher.isOk) return

		setHasSubmitted(false)
		toast.success('Zone mise à jour')
		setOpen(false)
	}, [hasSubmitted, fetcher.isOk])

	const chipClass = (active: boolean) =>
		cn(
			'flex h-chip items-center rounded-full border px-3.5 text-xs font-medium transition-all',
			active
				? 'bg-primary-green border-primary-green text-white'
				: 'bg-background text-muted-foreground hover:border-primary-green/40 hover:text-foreground',
		)

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				setOpen(next)
				// Reset on open — see `edit-name-dialog.tsx`.
				if (next)
					form.reset({
						intent: 'update-zone',
						city: currentCity ?? '',
						commune: currentCommune ?? '',
					})
			}}
		>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Ville et commune</DialogTitle>
					<DialogDescription className="sr-only">
						Modifier votre lieu d&apos;habitation
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
					className="space-y-5"
				>
					<FormRootError message={form.formState.errors.root?.message} />

					<div className="space-y-2">
						<InputLabel>Ville</InputLabel>
						<div className="flex flex-wrap gap-2">
							{CI_VILLES.map(name => (
								<button
									key={name}
									type="button"
									onClick={() => {
										city.field.onChange(name)
										if (name !== COMMUNE_CITY) commune.field.onChange('')
									}}
									className={chipClass(city.field.value === name)}
								>
									{name}
								</button>
							))}
						</div>
						{city.fieldState.error && (
							<FieldError
								errors={[city.fieldState.error]}
								className="text-xs"
							/>
						)}
					</div>

					{city.field.value === COMMUNE_CITY && (
						<div className="space-y-2">
							<InputLabel>Commune</InputLabel>
							<div className="flex flex-wrap gap-2">
								{ABIDJAN_COMMUNES.map(name => (
									<button
										key={name}
										type="button"
										onClick={() => commune.field.onChange(name)}
										className={chipClass(commune.field.value === name)}
									>
										{name}
									</button>
								))}
							</div>
						</div>
					)}

					<Button
						type="submit"
						disabled={fetcher.isSubmitting}
						className="bg-primary-green hover:bg-primary-green-dark h-11 w-full gap-2 rounded-xl text-white"
					>
						{fetcher.isSubmitting ? (
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
				</form>
			</DialogContent>
		</Dialog>
	)
}
