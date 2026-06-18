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

export function useEditPostForm(defaultValue: EditPostFormDefaults) {
	const lastResult = useActionData() as SubmissionResult | null | undefined
	const navigation = useNavigation()

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

	const isSubmitting = navigation.state === 'submitting'

	return {
		form,
		fields,
		isSubmitting,
	}
}
