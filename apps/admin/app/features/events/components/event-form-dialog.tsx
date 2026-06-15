import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Textarea,
	Field,
	FieldGroup,
	FieldLabel,
} from '@retrouve-ci/ui/components'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
	useForm,
	getFormProps,
	getInputProps,
	getTextareaProps,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { eventSchema } from '../events.schema'
import type { Event } from '../events.types'

interface ActionResult {
	ok: boolean
	event?: Event
	intent?: string
	error?: string
	submission?: unknown
}

interface EventFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	event?: Event | null
}

export function EventFormDialog({
	open,
	onOpenChange,
	event,
}: EventFormDialogProps) {
	const isEditing = !!event
	const fetcher = useFetcher<ActionResult>()
	const isSubmitting = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data.ok) {
			toast.success(
				isEditing ? 'Événement mis à jour' : 'Événement créé avec succès',
			)
			onOpenChange(false)
		} else if (!fetcher.data.ok && fetcher.data.error) {
			toast.error(fetcher.data.error)
		}
	}, [fetcher.state, fetcher.data, isEditing, onOpenChange])

	const [form, fields] = useForm({
		id: `event-form-${event?.id ?? 'new'}`,
		constraint: getZodConstraint(eventSchema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		defaultValue: event
			? {
					title: event.title,
					description: event.description,
					location: event.location,
					ville: event.ville,
					commune: event.commune ?? '',
					eventDate: event.eventDate.slice(0, 16),
				}
			: undefined,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: eventSchema })
		},
	})

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		formData.set('intent', isEditing ? 'update' : 'create')
		if (isEditing) formData.set('id', event.id)
		void fetcher.submit(formData, { method: 'post' })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Modifier l'événement" : 'Nouvel événement'}
					</DialogTitle>
				</DialogHeader>
				<form {...getFormProps(form)} onSubmit={handleSubmit}>
					<div className="space-y-4 py-2">
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={fields.title.id}>Titre</FieldLabel>
								<Input
									{...getInputProps(fields.title, { type: 'text' })}
									placeholder="Titre de l'événement"
								/>
								<FieldError errors={fields.title.errors} />
							</Field>

							<Field>
								<FieldLabel htmlFor={fields.description.id}>
									Description
								</FieldLabel>
								<Textarea
									{...getTextareaProps(fields.description)}
									placeholder="Description de l'événement"
									rows={4}
								/>
								<FieldError errors={fields.description.errors} />
							</Field>

							<Field>
								<FieldLabel htmlFor={fields.location.id}>Lieu</FieldLabel>
								<Input
									{...getInputProps(fields.location, { type: 'text' })}
									placeholder="Adresse ou lieu"
								/>
								<FieldError errors={fields.location.errors} />
							</Field>

							<div className="grid grid-cols-2 gap-4">
								<Field>
									<FieldLabel htmlFor={fields.ville.id}>Ville</FieldLabel>
									<Input
										{...getInputProps(fields.ville, { type: 'text' })}
										placeholder="ex: Abidjan"
									/>
									<FieldError errors={fields.ville.errors} />
								</Field>

								<Field>
									<FieldLabel htmlFor={fields.commune.id}>
										Commune{' '}
										<span className="text-muted-foreground font-normal">
											(optionnel)
										</span>
									</FieldLabel>
									<Input
										{...getInputProps(fields.commune, { type: 'text' })}
										placeholder="ex: Plateau"
									/>
									<FieldError errors={fields.commune.errors} />
								</Field>
							</div>

							<Field>
								<FieldLabel htmlFor={fields.eventDate.id}>
									Date et heure
								</FieldLabel>
								<Input
									{...getInputProps(fields.eventDate, {
										type: 'datetime-local',
									})}
								/>
								<FieldError errors={fields.eventDate.errors} />
							</Field>
						</FieldGroup>
					</div>
					<DialogFooter className="mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{isEditing ? 'Mise à jour...' : 'Création...'}
								</>
							) : isEditing ? (
								'Mettre à jour'
							) : (
								'Créer'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
