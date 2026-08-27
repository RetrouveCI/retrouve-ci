import { useActionData, useNavigation, useSubmit } from 'react-router'
import type { FieldErrors } from 'react-hook-form'
import { useForm, useWatch } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { MIN_DESCRIPTION_LENGTH } from '@app/contracts/lost-items'
import type { ActionResult } from '@/shared/types/action'
import {
	publishFormSchema,
	type PublishFormData,
	type PublishFormInput,
} from '../publish.schema'

const EMPTY_VALUES: PublishFormInput = {
	title: '',
	objectType: '',
	description: '',
	ville: '',
	commune: '',
	date: '',
	name: '',
	whatsapp: '',
}

const REQUIRED_FIELD_COUNT = 7

/**
 * The publish form, shared by `/publish/lost`, `/publish/found` and
 * `/account/posts/edit` — all three drive the same schema and the same sections.
 *
 * The submission goes through `useSubmit` with the form element's own
 * `FormData`, not through the parsed values alone: the photo picker keeps its
 * files in real `<input type="file">` elements (see `photos-upload.tsx`), and
 * only the DOM can carry them. The validated values are written over that
 * `FormData` afterwards, so fields rendered through a `Select` — which have no
 * native input at all — reach the action too.
 */
export function usePublishForm(defaultValues?: Partial<PublishFormInput>) {
	const actionData = useActionData<ActionResult>()
	const navigation = useNavigation()
	const submit = useSubmit()

	const serverErrors =
		actionData && !actionData.success
			? (actionData.errors as FieldErrors<PublishFormInput> | undefined)
			: undefined

	const form = useForm<PublishFormInput, unknown, PublishFormData>({
		resolver: standardSchemaResolver(publishFormSchema),
		mode: 'onBlur',
		reValidateMode: 'onChange',
		errors: serverErrors,
		defaultValues: { ...EMPTY_VALUES, ...defaultValues },
	})

	const values = useWatch({ control: form.control })

	const completedFieldCount = [
		values.title,
		values.objectType,
		(values.description?.length ?? 0) >= MIN_DESCRIPTION_LENGTH,
		values.ville,
		values.date,
		values.name,
		values.whatsapp,
	].filter(Boolean).length

	const onSubmit = form.handleSubmit((data, event) => {
		const formElement = event?.target as HTMLFormElement
		const formData = new FormData(formElement)

		for (const [name, value] of Object.entries(data)) {
			formData.set(name, value ?? '')
		}

		void submit(formData, { method: 'post', encType: 'multipart/form-data' })
	})

	return {
		form,
		values,
		onSubmit,
		progress: Math.round((completedFieldCount / REQUIRED_FIELD_COUNT) * 100),
		isSubmitting: navigation.state === 'submitting',
	}
}
