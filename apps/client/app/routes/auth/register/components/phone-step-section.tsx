import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { FormRootError } from '@app/ui/components/form'
import { toErrorList } from '../../helpers/field-errors'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	phoneNumberSchema,
	type PhoneNumberData,
	type PhoneNumberInput,
} from '../register.schema'
import { PhoneStep } from '../../components/phone-step'
import type { action } from '../_index'

interface PhoneStepSectionProps {
	onVerified: (phoneNumber: string) => void
}

export function PhoneStepSection({ onVerified }: PhoneStepSectionProps) {
	const submittedPhoneRef = useRef('')
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const fetcher = useActionFetcher<typeof action, PhoneNumberInput>()

	const form = useForm<PhoneNumberInput, unknown, PhoneNumberData>({
		resolver: standardSchemaResolver(phoneNumberSchema),
		mode: 'onSubmit',
		errors: fetcher.errors,
		reValidateMode: 'onChange',
		defaultValues: { phoneNumber: '' },
	})

	const onSubmit = (values: PhoneNumberData) => {
		submittedPhoneRef.current = values.phoneNumber
		setHasSubmitted(true)
		void fetcher.submit(
			{ intent: 'send-otp', phoneNumber: values.phoneNumber },
			{ method: 'post' },
		)
	}

	useEffect(() => {
		if (!hasSubmitted || !fetcher.isOk) return

		setHasSubmitted(false)
		toast.success('Code envoyé !', {
			description: 'Vérifiez vos SMS ou WhatsApp.',
		})
		onVerified(submittedPhoneRef.current)
	}, [hasSubmitted, fetcher.isOk, onVerified])

	return (
		<>
			<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
				<FormRootError
					message={form.formState.errors.root?.message}
					className="mb-5"
				/>

				<Controller
					control={form.control}
					name="phoneNumber"
					render={({ field, fieldState }) => (
						<PhoneStep
							phoneNumber={field.value}
							setPhoneNumber={field.onChange}
							errors={toErrorList(fieldState.error)}
							isSubmitting={fetcher.isSubmitting}
						/>
					)}
				/>
			</form>
			<p className="text-muted-foreground mt-6 text-center text-sm">
				Déjà un compte ?{' '}
				<Link
					to="/auth/login"
					className="text-primary-green font-semibold hover:underline"
				>
					Se connecter
				</Link>
			</p>
		</>
	)
}
