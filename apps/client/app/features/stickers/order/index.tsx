import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useFetcher } from 'react-router'
import {
	useForm,
	useInputControl,
	getFormProps,
	type SubmissionResult,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { OrderProgressBar } from './components/order-progress-bar'
import { PackSelectionStep } from './components/pack-selection-step'
import { DeliveryStep } from './components/delivery-step'
import { PaymentStep } from './components/payment-step'
import { ConfirmationStep } from './components/confirmation-step'
import { stickerOrderSchema } from './order.schema'
import { orderAction } from './servers/order.action'
import { DELIVERY_FEE, VALID_COUPONS, PACKS, PAYMENT_METHODS } from './stickers-order.const'
import type { Order } from '../../account/orders/orders.types'

export const action = ({ request }: { request: Request }) =>
	orderAction(request)

export function meta() {
	return [
		{ title: 'Commander des stickers — RetrouveCI' },
		{
			name: 'description',
			content: 'Commandez vos stickers QR RetrouveCI en quelques étapes.',
		},
	]
}

type Step = 'select' | 'delivery' | 'payment' | 'confirmation'
type ActionData = SubmissionResult | { ok: true; order: Order }

export default function CommanderPage() {
	const fetcher = useFetcher<ActionData>()
	const actionData = fetcher.data
	const lastResult =
		actionData && 'status' in actionData ? actionData : undefined

	const [step, setStep] = useState<Step>('select')
	const [order, setOrder] = useState<Order | null>(null)
	const [couponInput, setCouponInput] = useState('')
	const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
	const [couponError, setCouponError] = useState('')

	const [form, fields] = useForm({
		lastResult,
		constraint: getZodConstraint(stickerOrderSchema),
		defaultValue: { city: 'Abidjan' },
		shouldValidate: 'onSubmit',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: stickerOrderSchema })
		},
	})

	const packIdControl = useInputControl(fields.packId)
	const paymentMethodControl = useInputControl(fields.paymentMethod)
	const couponCodeControl = useInputControl(fields.couponCode)

	const isProcessing = fetcher.state !== 'idle'

	useEffect(() => {
		if (!actionData) return
		if ('ok' in actionData && actionData.ok) {
			setOrder(actionData.order)
			setStep('confirmation')
		} else if ('status' in actionData && actionData.status === 'error') {
			const formErrors = actionData.error?.[''] ?? []
			if (formErrors.length > 0) toast.error(formErrors[0])
		}
	}, [actionData])

	const selectedPackData = PACKS.find(p => p.id === packIdControl.value)
	const selectedPaymentData = PAYMENT_METHODS.find(
		p => p.id === paymentMethodControl.value,
	)
	const deliveryFee = appliedCoupon ? 0 : DELIVERY_FEE
	const totalPrice = (selectedPackData?.price ?? 0) + deliveryFee

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('fr-FR').format(price)

	const handleApplyCoupon = () => {
		const code = couponInput.trim().toUpperCase()
		if (VALID_COUPONS.includes(code)) {
			setAppliedCoupon(code)
			setCouponError('')
			couponCodeControl.change(code)
			toast.success('Coupon appliqué ! Livraison offerte.')
		} else {
			setCouponError('Code invalide ou expiré.')
			setAppliedCoupon(null)
		}
	}

	const handleRemoveCoupon = () => {
		setAppliedCoupon(null)
		setCouponInput('')
		setCouponError('')
		couponCodeControl.change('')
	}

	const handleNext = () => {
		if (step === 'select') {
			if (!packIdControl.value) {
				toast.error('Veuillez sélectionner un pack')
				return
			}
			setStep('delivery')
		} else if (step === 'delivery') {
			if (!fields.name.value || !fields.phone.value || !fields.address.value) {
				toast.error('Veuillez remplir tous les champs obligatoires')
				return
			}
			setStep('payment')
		}
	}

	const handleBack = () => {
		if (step === 'delivery') setStep('select')
		else if (step === 'payment') setStep('delivery')
		else if (step === 'confirmation') setStep('payment')
	}

	const stepNumber =
		step === 'select' ? 1 : step === 'delivery' ? 2 : step === 'payment' ? 3 : 4

	return (
		<main className="bg-muted/30 flex-1">
			<OrderProgressBar stepNumber={stepNumber} />

			<div className="container mx-auto px-4 py-8">
				<div className="mx-auto max-w-4xl">
					<fetcher.Form method="post" {...getFormProps(form)}>
						<div className={step === 'select' ? '' : 'hidden'}>
							<PackSelectionStep
								packs={PACKS}
								selectedPack={packIdControl.value ?? null}
								onSelectPack={packIdControl.change}
								onNext={handleNext}
								formatPrice={formatPrice}
								error={fields.packId.errors?.[0]}
							/>
						</div>

						<div className={step === 'delivery' ? '' : 'hidden'}>
							{selectedPackData && (
								<DeliveryStep
									fields={fields}
									couponInput={couponInput}
									appliedCoupon={appliedCoupon}
									couponError={couponError}
									onCouponInputChange={val => {
										setCouponInput(val)
										setCouponError('')
									}}
									onApplyCoupon={handleApplyCoupon}
									onRemoveCoupon={handleRemoveCoupon}
									selectedPackData={selectedPackData}
									deliveryFee={deliveryFee}
									totalPrice={totalPrice}
									formatPrice={formatPrice}
									onBack={handleBack}
									onNext={handleNext}
								/>
							)}
						</div>

						<div className={step === 'payment' ? '' : 'hidden'}>
							{selectedPackData && (
								<PaymentStep
									paymentMethods={PAYMENT_METHODS}
									paymentMethod={paymentMethodControl.value ?? null}
									onPaymentMethodChange={paymentMethodControl.change}
									paymentMethodError={fields.paymentMethod.errors?.[0]}
									paymentPhoneField={fields.paymentPhone}
									isProcessing={isProcessing}
									selectedPackData={selectedPackData}
									selectedPaymentData={selectedPaymentData}
									deliveryFee={deliveryFee}
									totalPrice={totalPrice}
									formatPrice={formatPrice}
									onBack={handleBack}
								/>
							)}
						</div>
					</fetcher.Form>

					{step === 'confirmation' && order && (
						<ConfirmationStep
							order={order}
							phone={fields.phone.value ?? ''}
							formatPrice={formatPrice}
						/>
					)}
				</div>
			</div>
		</main>
	)
}
