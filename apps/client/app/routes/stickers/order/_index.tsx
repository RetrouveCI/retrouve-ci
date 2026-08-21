import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useForm, useWatch } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { FormRootError } from '@app/ui/components/form'
import { OrderProgressBar } from './components/order-progress-bar'
import { PackSelectionStep } from './components/pack-selection-step'
import { DeliveryStep } from './components/delivery-step'
import { PaymentStep } from './components/payment-step'
import { ConfirmationStep } from './components/confirmation-step'
import {
	stickerOrderSchema,
	type StickerOrderData,
	type StickerOrderInput,
} from './order.schema'
import { orderAction } from './servers/order.action'
import {
	DELIVERY_FEE,
	FREE_DELIVERY_COUPONS,
	PACKS,
	PAYMENT_METHODS,
} from './stickers-order.const'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import type { Order } from '../../account/orders/types/orders.types'
import { pageMeta } from '@/shared/helpers/page-meta'

export const action = ({ request }: { request: Request }) =>
	orderAction(request)

export function meta() {
	return pageMeta({
		title: 'Commander des stickers',
		description: 'Commandez vos stickers QR RetrouveCI en quelques étapes.',
	})
}

type Step = 'select' | 'delivery' | 'payment' | 'confirmation'

const EMPTY_VALUES: StickerOrderInput = {
	packId: '',
	name: '',
	phone: '',
	address: '',
	city: 'Abidjan',
	paymentMethod: '',
	paymentPhone: '',
	couponCode: '',
}

/** Validated before leaving each step, so an error lands on its field. */
const STEP_FIELDS = {
	select: ['packId'],
	delivery: ['name', 'phone', 'address', 'city'],
} as const

export default function CommanderPage() {
	const fetcher = useActionFetcher<typeof action, StickerOrderInput, Order>()

	const [step, setStep] = useState<Step>('select')
	const [order, setOrder] = useState<Order | null>(null)
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const [couponInput, setCouponInput] = useState('')
	const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
	const [couponError, setCouponError] = useState('')

	const form = useForm<StickerOrderInput, unknown, StickerOrderData>({
		resolver: standardSchemaResolver(stickerOrderSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: EMPTY_VALUES,
		errors: fetcher.errors,
	})

	const values = useWatch({ control: form.control })

	useEffect(() => {
		if (!hasSubmitted || !fetcher.isOk || !fetcher.data) return

		setHasSubmitted(false)
		setOrder(fetcher.data)
		setStep('confirmation')
	}, [hasSubmitted, fetcher.isOk, fetcher.data])

	const selectedPackData = PACKS.find(pack => pack.id === values.packId)
	const selectedPaymentData = PAYMENT_METHODS.find(
		method => method.id === values.paymentMethod,
	)
	const deliveryFee = appliedCoupon ? 0 : DELIVERY_FEE
	const totalPrice = (selectedPackData?.price ?? 0) + deliveryFee

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('fr-FR').format(price)

	const handleApplyCoupon = () => {
		const code = couponInput.trim().toUpperCase()
		if (!FREE_DELIVERY_COUPONS.includes(code)) {
			setCouponError('Code invalide ou expiré.')
			setAppliedCoupon(null)
			return
		}

		setAppliedCoupon(code)
		setCouponError('')
		form.setValue('couponCode', code)
		toast.success('Coupon appliqué ! Livraison offerte.')
	}

	const handleRemoveCoupon = () => {
		setAppliedCoupon(null)
		setCouponInput('')
		setCouponError('')
		form.setValue('couponCode', '')
	}

	const handleNext = async () => {
		if (step !== 'select' && step !== 'delivery') return
		if (!(await form.trigger(STEP_FIELDS[step]))) return

		setStep(step === 'select' ? 'delivery' : 'payment')
	}

	const handleBack = () => {
		if (step === 'delivery') setStep('select')
		else if (step === 'payment') setStep('delivery')
		else if (step === 'confirmation') setStep('payment')
	}

	const onSubmit = (submitted: StickerOrderData) => {
		setHasSubmitted(true)
		void fetcher.submit(
			{ ...submitted, couponCode: submitted.couponCode ?? '' },
			{ method: 'post' },
		)
	}

	const stepNumber =
		step === 'select' ? 1 : step === 'delivery' ? 2 : step === 'payment' ? 3 : 4

	return (
		<main className="bg-muted/30 flex-1">
			<OrderProgressBar stepNumber={stepNumber} />

			<div className="container mx-auto px-4 py-8">
				<div className="mx-auto max-w-4xl">
					<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
						<FormRootError
							className="mb-6"
							title="Impossible de finaliser la commande"
							message={form.formState.errors.root?.message}
						/>

						<div className={step === 'select' ? '' : 'hidden'}>
							<PackSelectionStep
								packs={PACKS}
								selectedPack={values.packId ?? null}
								onSelectPack={packId => form.setValue('packId', packId)}
								onNext={handleNext}
								formatPrice={formatPrice}
								error={form.formState.errors.packId?.message}
							/>
						</div>

						<div className={step === 'delivery' ? '' : 'hidden'}>
							{selectedPackData && (
								<DeliveryStep
									control={form.control}
									couponInput={couponInput}
									appliedCoupon={appliedCoupon}
									couponError={couponError}
									onCouponInputChange={value => {
										setCouponInput(value)
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
									control={form.control}
									paymentMethods={PAYMENT_METHODS}
									paymentMethod={values.paymentMethod ?? ''}
									paymentPhone={values.paymentPhone ?? ''}
									isProcessing={fetcher.isSubmitting}
									selectedPackData={selectedPackData}
									selectedPaymentData={selectedPaymentData}
									deliveryFee={deliveryFee}
									totalPrice={totalPrice}
									formatPrice={formatPrice}
									onBack={handleBack}
								/>
							)}
						</div>
					</form>

					{step === 'confirmation' && order && (
						<ConfirmationStep
							order={order}
							phone={values.phone ?? ''}
							formatPrice={formatPrice}
						/>
					)}
				</div>
			</div>
		</main>
	)
}
