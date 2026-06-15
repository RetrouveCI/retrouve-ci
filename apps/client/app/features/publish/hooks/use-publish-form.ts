import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { toast } from 'sonner'
import { ApiError } from '@/shared/lib/api-client'
import type { LostItemType } from '@/shared/types/lost-item'
import { createLostItem } from '../servers/publish.service'
import type { CreateLostItemPayload } from '../publish.types'
import { publishFormSchema } from '../publish.schema'

export function usePublishForm(type: LostItemType, successMessage: string) {
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [imagePreview, setImagePreview] = useState<string | null>(null)

	const [form, fields] = useForm({
		constraint: getZodConstraint(publishFormSchema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: publishFormSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()

			if (submission?.status !== 'success') return

			const data = submission.value

			const payload: CreateLostItemPayload = {
				type,
				category: data.objectType,
				title: data.title,
				description: data.description,
				ville: data.ville,
				commune: data.commune || undefined,
				eventDate: data.date
					? new Date(data.date).toISOString()
					: new Date().toISOString(),
				contactName: data.name,
				contactWhatsapp: `+225${data.whatsapp}`,
			}

			setIsSubmitting(true)

			createLostItem(payload)
				.then(created => {
					toast.success('Annonce publiée !', { description: successMessage })
					navigate(`/posts/${created.id}`)
				})
				.catch((err: unknown) => {
					if (err instanceof ApiError && err.status === 401) {
						toast.error('Connectez-vous pour publier une annonce.')
						navigate('/auth')
					} else if (err instanceof ApiError) {
						toast.error(err.message)
					} else {
						throw err
					}
				})
				.finally(() => setIsSubmitting(false))
		},
	})

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onloadend = () => setImagePreview(reader.result as string)
		reader.readAsDataURL(file)
	}

	const completedFieldCount = [
		fields.title.value,
		fields.objectType.value,
		(fields.description.value?.length ?? 0) >= 20,
		fields.ville.value,
		fields.name.value,
		fields.whatsapp.value,
	].filter(Boolean).length

	const progress = Math.round((completedFieldCount / 6) * 100)

	return {
		form,
		fields,
		imagePreview,
		setImagePreview,
		handleImageChange,
		progress,
		isSubmitting,
	}
}
