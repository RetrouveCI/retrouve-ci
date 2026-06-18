import { useEffect, useState } from 'react'
import { useFetcher, useRevalidator } from 'react-router'
import { useForm, getInputProps, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
} from '@retrouve-ci/ui/components'
import { InputLabel, FieldError } from '@retrouve-ci/ui/components/form'
import { Loader2, Send, Check } from 'lucide-react'
import { toast } from 'sonner'
import { sendPhoneOtpSchema, verifyPhoneSchema } from '../settings.schema'
import { verifyPhoneChange } from '../lib/settings.client'

interface ActionResult {
	ok: boolean
	error?: string
}

export function EditPhoneDialog() {
	const sendFetcher = useFetcher<ActionResult>()
	const revalidator = useRevalidator()
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState<'phone' | 'code'>('phone')
	const [phone, setPhone] = useState('')
	const [isVerifying, setIsVerifying] = useState(false)
	const [verifyError, setVerifyError] = useState('')

	const [phoneForm, phoneFields] = useForm({
		id: 'phone-change-form',
		constraint: getZodConstraint(sendPhoneOtpSchema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: sendPhoneOtpSchema })
		},
	})

	const [codeForm, codeFields] = useForm({
		id: 'phone-code-form',
		constraint: getZodConstraint(verifyPhoneSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: verifyPhoneSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void handleVerify(submission.value.code)
		},
	})

	useEffect(() => {
		if (sendFetcher.state !== 'idle' || !sendFetcher.data) return
		if (sendFetcher.data.ok) {
			setPhone(phoneFields.phone.value ?? '')
			setStep('code')
			toast.success('Code envoyé par SMS')
		} else {
			toast.error(sendFetcher.data.error ?? 'Envoi impossible')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sendFetcher.state, sendFetcher.data])

	const resetAll = () => {
		setStep('phone')
		setPhone('')
		setVerifyError('')
		phoneForm.reset()
		codeForm.reset()
	}

	const handleVerify = async (code: string) => {
		setVerifyError('')
		setIsVerifying(true)
		const res = await verifyPhoneChange(phone, code)
		setIsVerifying(false)
		if (res.ok) {
			toast.success('Numéro de téléphone mis à jour')
			setOpen(false)
			resetAll()
			void revalidator.revalidate()
		} else {
			setVerifyError(res.error ?? 'Code invalide')
		}
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
					<sendFetcher.Form
						method="post"
						{...getFormProps(phoneForm)}
						className="space-y-4"
					>
						<input type="hidden" name="intent" value="send-phone-otp" />
						<div className="space-y-2">
							<InputLabel htmlFor={phoneFields.phone.id}>
								Numéro de téléphone
							</InputLabel>
							<div className="flex gap-2">
								<div className="bg-muted text-muted-foreground flex h-11 shrink-0 items-center rounded-md border px-3 text-sm">
									+225
								</div>
								<Input
									{...getInputProps(phoneFields.phone, { type: 'tel' })}
									key={phoneFields.phone.key}
									placeholder="07 XX XX XX XX"
									className="h-11 flex-1"
								/>
							</div>
							<FieldError errors={phoneFields.phone.errors} />
						</div>
						<p className="text-muted-foreground text-xs">
							Un code de confirmation vous sera envoyé par SMS pour valider ce
							nouveau numéro.
						</p>
						<Button
							type="submit"
							disabled={sendFetcher.state !== 'idle'}
							className="bg-primary-green hover:bg-primary-green-dark h-11 w-full gap-2 rounded-xl text-white"
						>
							{sendFetcher.state !== 'idle' ? (
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
					</sendFetcher.Form>
				) : (
					<form {...getFormProps(codeForm)} className="space-y-4">
						<p className="text-muted-foreground text-sm">
							Saisissez le code reçu au{' '}
							<span className="text-foreground font-medium">+225 {phone}</span>.
						</p>
						<div className="space-y-2">
							<InputLabel htmlFor={codeFields.code.id}>
								Code de confirmation
							</InputLabel>
							<Input
								{...getInputProps(codeFields.code, { type: 'text' })}
								key={codeFields.code.key}
								inputMode="numeric"
								placeholder="123456"
								className="h-11"
							/>
							<FieldError errors={codeFields.code.errors} />
							{verifyError && (
								<p className="text-destructive text-xs">{verifyError}</p>
							)}
						</div>
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
