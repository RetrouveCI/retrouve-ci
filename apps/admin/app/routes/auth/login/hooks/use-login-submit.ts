import { useState, useTransition } from 'react'
import type { GlobalError } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/context/auth'
import { DEFAULT_AUTH_ERROR_MESSAGE } from '@/shared/helpers/error-messages'
import { sanitizeRedirect } from '@/shared/helpers/redirect'
import type { LoginData } from '../login.schema'

/**
 * Sign-in is one of the two calls that stay client-side, because the browser
 * needs the `Set-Cookie` response directly — so there is no action, and no
 * `useActionFetcher`.
 *
 * It still answers the same error contract: `errors` is shaped exactly like
 * `fetcher.errors`, so the form hands it to `useForm`'s `errors:` option and
 * reads the message back from `formState.errors.root` like every other form.
 */
export function useLoginSubmit() {
	const { login } = useAuth()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [errors, setErrors] = useState<{ root: GlobalError }>()
	const [isLoading, setIsLoading] = useState(false)
	const [, startTransition] = useTransition()

	const redirectTo = sanitizeRedirect(searchParams.get('redirectTo'))

	const onSubmit = async (values: LoginData) => {
		startTransition(() => {
			setErrors(undefined)
			setIsLoading(true)
		})

		const result = await login(values.email, values.password)

		if (!result.success) {
			startTransition(() => {
				setErrors({
					root: {
						type: 'custom',
						message: result.error ?? DEFAULT_AUTH_ERROR_MESSAGE,
					},
				})
				setIsLoading(false)
			})
			return
		}

		// `isLoading` stays true on purpose: the button remains disabled until the
		// navigation unmounts the form.
		void navigate(redirectTo, { replace: true })
	}

	return { onSubmit, isLoading, errors }
}
