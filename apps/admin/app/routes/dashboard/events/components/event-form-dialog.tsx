import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@app/ui/components'
import {
	FormInputField,
	FormRootError,
	FormTextareaField,
} from '@app/ui/components/form'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { eventSchema, type EventData, type EventInput } from '../events.schema'
import type { Event } from '../types/events.types'
import type { action } from '../_index'

const EMPTY_VALUES: EventInput = {
	title: '',
	description: '',
	location: '',
	ville: '',
	commune: '',
	eventDate: '',
}

function toFormValues(event?: Event | null): EventInput {
	if (!event) return EMPTY_VALUES

	return {
		title: event.title,
		description: event.description,
		location: event.location,
		ville: event.ville,
		commune: event.commune ?? '',
		// `datetime-local` wants `YYYY-MM-DDTHH:mm`, the API returns an ISO string.
		eventDate: event.eventDate.slice(0, 16),
	}
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
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const fetcher = useActionFetcher<typeof action, EventInput>()

	const form = useForm<EventInput, unknown, EventData>({
		resolver: standardSchemaResolver(eventSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: toFormValues(event),
		errors: fetcher.errors,
	})

	// The dialog stays mounted between openings, so `defaultValues` alone would
	// keep whichever event was edited first. Reset on every opening instead.
	useEffect(() => {
		if (open) form.reset(toFormValues(event))
	}, [open, event, form])

	useEffect(() => {
		if (!hasSubmitted || !fetcher.isOk) return

		setHasSubmitted(false)
		toast.success(
			isEditing ? 'Événement mis à jour' : 'Événement créé avec succès',
		)
		onOpenChange(false)
	}, [hasSubmitted, fetcher.isOk, isEditing, onOpenChange])

	const onSubmit = (values: EventData) => {
		setHasSubmitted(true)
		void fetcher.submit(
			{
				intent: isEditing ? 'update' : 'create',
				...(event ? { id: event.id } : {}),
				title: values.title,
				description: values.description,
				location: values.location,
				ville: values.ville,
				commune: values.commune ?? '',
				eventDate: values.eventDate,
			},
			{ method: 'post' },
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Modifier l'événement" : 'Nouvel événement'}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
					<div className="space-y-4 py-2">
						<FormRootError
							title={
								isEditing
									? "Impossible de mettre à jour l'événement"
									: "Impossible de créer l'événement"
							}
							message={form.formState.errors.root?.message}
						/>

						<FormInputField
							control={form.control}
							name="title"
							label="Titre"
							placeholder="Titre de l'événement"
							required
						/>
						<FormTextareaField
							control={form.control}
							name="description"
							label="Description"
							placeholder="Description de l'événement"
							className="min-h-24 resize-none"
							required
						/>
						<FormInputField
							control={form.control}
							name="location"
							label="Lieu"
							placeholder="Adresse ou lieu"
							required
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormInputField
								control={form.control}
								name="ville"
								label="Ville"
								placeholder="ex: Abidjan"
								required
							/>
							<FormInputField
								control={form.control}
								name="commune"
								label="Commune (optionnel)"
								placeholder="ex: Plateau"
							/>
						</div>
						<FormInputField
							control={form.control}
							name="eventDate"
							label="Date et heure"
							type="datetime-local"
							required
						/>
					</div>

					<DialogFooter className="mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={fetcher.isSubmitting}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={fetcher.isSubmitting}>
							{fetcher.isSubmitting ? (
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
