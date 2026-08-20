import { useState, useTransition } from 'react'
import type { FieldErrors } from 'react-hook-form'
import { changePassword } from '../helpers/profile.client'
import type { ChangePasswordData, ChangePasswordInput } from '../profile.schema'

/**
 * Changing the password is one of the two calls that stay client-side, because
 * the browser needs the `Set-Cookie` response directly — so there is no action,
 * and no `useActionFetcher`.
 *
 * It still answers the same error contract: `errors` is shaped exactly like
 * `fetcher.errors`, so the form hands it to `useForm`'s `errors:` option and a
 * wrong current password lands under that field instead of in a toast.
 *
 * `submit` reports the outcome rather than owning the success effects, which
 * reset the caller's own form instance.
 */
export function usePasswordChangeSubmit() {
	const [errors, setErrors] = useState<FieldErrors<ChangePasswordInput>>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [, startTransition] = useTransition()

	const submit = async (values: ChangePasswordData): Promise<boolean> => {
		startTransition(() => {
			setErrors(undefined)
			setIsSubmitting(true)
		})

		const result = await changePassword(
			values.currentPassword,
			values.newPassword,
		)

		startTransition(() => {
			setErrors(
				result.success
					? undefined
					: {
							[result.field ?? 'root']: {
								type: 'custom',
								message: result.error,
							},
						},
			)
			setIsSubmitting(false)
		})

		return result.success
	}

	return { submit, isSubmitting, errors }
}
