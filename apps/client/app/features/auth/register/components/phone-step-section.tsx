import { useRef } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { toErrorList } from '../../lib/field-errors'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	phoneNumberSchema,
	type PhoneNumberData,
	type PhoneNumberInput,
} from '../register.schema'
import { PhoneStep } from '../../components/phone-step'

interface PhoneStepSectionProps {
	onVerified: (phoneNumber: string) => void
}

export function PhoneStepSection({ onVerified }: PhoneStepSectionProps) {
	const submittedPhoneRef = useRef('')

	const { submit, isSubmitting } = useActionFetcher({
		onOk: () => {
			toast.success('Code envoyé !', {
				description: 'Vérifiez vos SMS ou WhatsApp.',
			})
			onVerified(submittedPhoneRef.current)
		},
		onError: () => {
			toast.error('Impossible d’envoyer le code', {
				description: 'Vérifiez le numéro et réessayez.',
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
		void submit(
			{ intent: 'send-otp', phoneNumber: values.phoneNumber },
			{ method: 'post' },
		)
	}

	return (
		<>
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
