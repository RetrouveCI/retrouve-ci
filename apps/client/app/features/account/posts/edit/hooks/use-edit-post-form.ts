import { useState } from 'react'
import { useActionData, useNavigation } from 'react-router'
import { useForm, type SubmissionResult } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { publishFormSchema } from '@/features/publish/publish.schema'
import type { LostItemCategory } from '@/shared/types/lost-item'

interface EditPostFormDefaults {
	title: string
	objectType: LostItemCategory
	description: string
	ville: string
	commune?: string
	date?: string
	name: string
	whatsapp: string
}

export function useEditPostForm(
	defaultValue: EditPostFormDefaults,
	initialImagePreview: string | null,
) {
	const lastResult = useActionData() as SubmissionResult | null | undefined
	const navigation = useNavigation()
	const [imagePreview, setImagePreview] = useState<string | null>(
		initialImagePreview,
	)

	const [form, fields] = useForm({
		lastResult,
		defaultValue,
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

	const isSubmitting = navigation.state === 'submitting'

	return {
		form,
		fields,
		imagePreview,
		setImagePreview,
		handleImageChange,
		isSubmitting,
	}
}
