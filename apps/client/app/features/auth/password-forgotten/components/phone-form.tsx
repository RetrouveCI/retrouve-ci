import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { toErrorList } from '../../lib/field-errors'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	phoneNumberSchema,
	type PhoneNumberData,
	type PhoneNumberInput,
} from '../password-forgotten.schema'
import { PhoneStep } from '../../components/phone-step'

export function PhoneForm() {
	const navigate = useNavigate()

	// Held in a ref rather than state: the redirect target is only read once the
	// action has answered, and it must not trigger a re-render on submit.
	const submittedPhoneRef = useRef('')

	const { submit, isSubmitting } = useActionFetcher({
		onOk: () => {
			toast.success('Code envoyé !', {
				description: 'Vérifiez vos SMS ou WhatsApp.',
			})

			navigate(
				`/auth/reset-password?phone=${encodeURIComponent(submittedPhoneRef.current)}`,
			)
		},
		onError: result => {
			toast.error('Impossible d’envoyer le code', {
				description: result.error,
			})
		},
	})

	const form = useForm<PhoneNumberInput, unknown, PhoneNumberData>({
		resolver: standardSchemaResolver(phoneNumberSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { phoneNumber: '' },
	})

	const onSubmit = (values: PhoneNumberData) => {
		submittedPhoneRef.current = values.phoneNumber
		void submit({ phoneNumber: values.phoneNumber }, { method: 'post' })
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
			<Controller
				control={form.control}
				name="phoneNumber"
				render={({ field, fieldState }) => (
					<PhoneStep
						phoneNumber={field.value}
						setPhoneNumber={field.onChange}
						errors={toErrorList(fieldState.error)}
						isSubmitting={isSubmitting}
						hint="Entrez votre numéro pour recevoir un code de vérification."
						submitLabel="Envoyer le code"
					/>
				)}
			/>
		</form>
	)
}
