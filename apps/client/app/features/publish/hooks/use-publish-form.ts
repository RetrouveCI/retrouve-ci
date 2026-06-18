import { useState } from 'react'
import { useActionData, useNavigation } from 'react-router'
import { useForm, type SubmissionResult } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { publishFormSchema } from '../publish.schema'
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE } from '../publish.const'

export function usePublishForm() {
	const lastResult = useActionData() as SubmissionResult | null | undefined
	const navigation = useNavigation()
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [photoError, setPhotoError] = useState<string | null>(null)

	const [form, fields] = useForm({
		lastResult,
		constraint: getZodConstraint(publishFormSchema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: publishFormSchema })
		},
	})

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
			setPhotoError(
				'Format non supporté : utilisez une image JPEG, PNG ou WebP',
			)
			setImagePreview(null)
			e.target.value = ''
			return
		}

		if (file.size > MAX_PHOTO_SIZE) {
			setPhotoError('Image trop volumineuse : 5 Mo maximum')
			setImagePreview(null)
			e.target.value = ''
			return
		}

		setPhotoError(null)
		const reader = new FileReader()
		reader.onloadend = () => setImagePreview(reader.result as string)
		reader.readAsDataURL(file)
	}

	const handleImageRemove = () => {
		setImagePreview(null)
		setPhotoError(null)
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
	const isSubmitting = navigation.state === 'submitting'

	return {
		form,
		fields,
		imagePreview,
		setImagePreview,
		photoError,
		handleImageChange,
		handleImageRemove,
		progress,
		isSubmitting,
	}
}
