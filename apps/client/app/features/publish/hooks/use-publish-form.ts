import { useState } from 'react'
import { useActionData, useNavigation } from 'react-router'
import { useForm, type SubmissionResult } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { publishFormSchema } from '../publish.schema'

export function usePublishForm() {
	const lastResult = useActionData() as SubmissionResult | null | undefined
	const navigation = useNavigation()
	const [imagePreview, setImagePreview] = useState<string | null>(null)

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
	const isSubmitting = navigation.state === 'submitting'

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
