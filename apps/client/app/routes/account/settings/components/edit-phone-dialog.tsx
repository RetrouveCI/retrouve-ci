import { useEffect, useState } from 'react'
import { useRevalidator } from 'react-router'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { OTP_LENGTH } from '@app/contracts/shared'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	FieldError,
	Input,
} from '@app/ui/components'
import { FormRootError, InputLabel } from '@app/ui/components/form'
import { Loader2, Send, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	sendPhoneOtpSchema,
	verifyPhoneSchema,
	type SendPhoneOtpData,
	type SendPhoneOtpInput,
	type VerifyPhoneData,
	type VerifyPhoneInput,
} from '../settings.schema'
import { verifyPhoneChange } from '../helpers/settings.client'
import type { action } from '../_index'

export function EditPhoneDialog() {
	const revalidator = useRevalidator()
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState<'phone' | 'code'>('phone')
	const [phone, setPhone] = useState('')
	const [hasSentOtp, setHasSentOtp] = useState(false)
	const [isVerifying, setIsVerifying] = useState(false)

	const sendFetcher = useActionFetcher<typeof action, SendPhoneOtpInput>()

	const phoneForm = useForm<SendPhoneOtpInput, unknown, SendPhoneOtpData>({
		resolver: standardSchemaResolver(sendPhoneOtpSchema),
		mode: 'onBlur',
		reValidateMode: 'onChange',
		errors: sendFetcher.errors,
		defaultValues: { intent: 'send-phone-otp', phone: '' },
	})

	// The second step is a browser call (`authClient.phoneNumber.verify` needs the
	// `Set-Cookie` response directly), so it has no fetcher and no action.
	const codeForm = useForm<VerifyPhoneInput, unknown, VerifyPhoneData>({
		resolver: standardSchemaResolver(verifyPhoneSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { code: '' },
	})

	const onSendOtp = (values: SendPhoneOtpData) => {
		setPhone(values.phone)
		setHasSentOtp(true)
		void sendFetcher.submit(values, { method: 'post' })
	}

	useEffect(() => {
		if (!hasSentOtp || !sendFetcher.isOk) return

		setHasSentOtp(false)
		setStep('code')
		toast.success('Code envoyé par SMS')
	}, [hasSentOtp, sendFetcher.isOk])

	const onVerify = async (values: VerifyPhoneData) => {
		setIsVerifying(true)
		const result = await verifyPhoneChange(phone, values.code)
		setIsVerifying(false)

		if (!result.ok) {
			codeForm.setError('root', {
				type: 'custom',
				message: result.error ?? 'Code invalide',
			})
			return
		}

		toast.success('Numéro de téléphone mis à jour')
		setOpen(false)
		resetAll()
		void revalidator.revalidate()
	}

	const resetAll = () => {
		setStep('phone')
		setPhone('')
		setHasSentOtp(false)
		phoneForm.reset()
		codeForm.reset()
	}

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				setOpen(next)
				if (!next) resetAll()
			}}
		>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="rounded-lg text-xs">
					Modifier
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Numéro de téléphone</DialogTitle>
					<DialogDescription className="sr-only">
						Modifier votre numéro de téléphone
					</DialogDescription>
				</DialogHeader>

				{step === 'phone' ? (
					<form
						onSubmit={phoneForm.handleSubmit(onSendOtp)}
						noValidate
						className="space-y-4"
					>
						<FormRootError message={phoneForm.formState.errors.root?.message} />

						<Controller
							control={phoneForm.control}
							name="phone"
							render={({ field, fieldState }) => (
								<div className="space-y-2">
									<InputLabel htmlFor={field.name}>
										Numéro de téléphone
									</InputLabel>
									<div className="flex gap-2">
										<div className="bg-muted text-muted-foreground flex h-11 shrink-0 items-center rounded-md border px-3 text-sm">
											+225
										</div>
										<Input
											{...field}
											id={field.name}
											type="tel"
											inputMode="numeric"
											maxLength={14}
											value={field.value ?? ''}
											placeholder="07 XX XX XX XX"
											className="h-11 flex-1"
											aria-invalid={fieldState.invalid || undefined}
										/>
									</div>
									{fieldState.error && (
										<FieldError
											errors={[fieldState.error]}
											className="text-xs"
										/>
									)}
								</div>
							)}
						/>

						<p className="text-muted-foreground text-xs">
							Un code de confirmation vous sera envoyé par SMS pour valider ce
							nouveau numéro.
						</p>
						<Button
							type="submit"
							disabled={sendFetcher.isSubmitting}
							className="bg-primary-green hover:bg-primary-green-dark h-11 w-full gap-2 rounded-xl text-white"
						>
							{sendFetcher.isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Envoi...
								</>
							) : (
								<>
									<Send className="h-4 w-4" />
									Envoyer le code
								</>
							)}
						</Button>
					</form>
				) : (
					<form
						onSubmit={codeForm.handleSubmit(onVerify)}
						noValidate
						className="space-y-4"
					>
						<FormRootError message={codeForm.formState.errors.root?.message} />

						<p className="text-muted-foreground text-sm">
							Saisissez le code reçu au{' '}
							<span className="text-foreground font-medium">+225 {phone}</span>.
						</p>

						<Controller
							control={codeForm.control}
							name="code"
							render={({ field, fieldState }) => (
								<div className="space-y-2">
									<InputLabel htmlFor={field.name}>
										Code de confirmation
									</InputLabel>
									<Input
										{...field}
										id={field.name}
										value={field.value ?? ''}
										inputMode="numeric"
										maxLength={OTP_LENGTH}
										placeholder="123456"
										className="h-11"
										aria-invalid={fieldState.invalid || undefined}
									/>
									{fieldState.error && (
										<FieldError
											errors={[fieldState.error]}
											className="text-xs"
										/>
									)}
								</div>
							)}
						/>

						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								className="h-11 rounded-xl"
								onClick={() => setStep('phone')}
							>
								Retour
							</Button>
							<Button
								type="submit"
								disabled={isVerifying}
								className="bg-primary-green hover:bg-primary-green-dark h-11 flex-1 gap-2 rounded-xl text-white"
							>
								{isVerifying ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Validation...
									</>
								) : (
									<>
										<Check className="h-4 w-4" />
										Valider
									</>
								)}
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	)
}
