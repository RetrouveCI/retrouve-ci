import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'
import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@retrouve-ci/ui/components'
import { InputField, TextareaField } from '@retrouve-ci/ui/components/form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, getFormProps } from '@conform-to/react'
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
	const processedRef = useRef<ActionResult | undefined>(undefined)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data === processedRef.current) return
		processedRef.current = fetcher.data

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
		onSubmit(e, { submission, formData }) {
			e.preventDefault()
			if (submission?.status !== 'success') return
			formData.set('intent', isEditing ? 'update' : 'create')
			if (event) formData.set('id', event.id)
			void fetcher.submit(formData, { method: 'post' })
		},
	})

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Modifier l'événement" : 'Nouvel événement'}
					</DialogTitle>
				</DialogHeader>
				<form {...getFormProps(form)}>
					<div className="space-y-4 py-2">
						<InputField
							field={fields.title}
							label="Titre"
							placeholder="Titre de l'événement"
						/>
						<TextareaField
							field={fields.description}
							label="Description"
							placeholder="Description de l'événement"
							className="min-h-24 resize-none"
						/>
						<InputField
							field={fields.location}
							label="Lieu"
							placeholder="Adresse ou lieu"
						/>
						<div className="grid grid-cols-2 gap-4">
							<InputField
								field={fields.ville}
								label="Ville"
								placeholder="ex: Abidjan"
							/>
							<InputField
								field={fields.commune}
								label="Commune (optionnel)"
								placeholder="ex: Plateau"
							/>
						</div>
						<InputField
							field={fields.eventDate}
							label="Date et heure"
							type="datetime-local"
						/>
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
