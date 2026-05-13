'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { OrderProgressBar } from './components/OrderProgressBar'
import { PackSelectionStep } from './components/PackSelectionStep'
import { DeliveryStep } from './components/DeliveryStep'
import { PaymentStep } from './components/PaymentStep'
import { ConfirmationStep } from './components/ConfirmationStep'

const DELIVERY_FEE = 1000
const VALID_COUPONS = ['RETROUVECI', 'LIVRAISON0', 'WELCOME2025']

const PACKS = [
	{
		id: 'pack-4',
		name: 'Starter',
		quantity: 4,
		price: 1500,
		description: 'Idéal pour protéger vos essentiels',
		popular: false,
		features: ['4 stickers QR uniques', 'Support WhatsApp'],
	},
	{
		id: 'pack-8',
		name: 'Famille',
		quantity: 8,
		price: 2500,
		description: 'Protégez toute la famille',
		popular: true,
		features: [
			'8 stickers QR uniques',
			'Support prioritaire',
			'Économisez 500 FCFA',
		],
	},
	{
		id: 'pack-20',
		name: 'Pro',
		quantity: 20,
		price: 7000,
		description: 'Pour les entreprises et familles nombreuses',
		popular: false,
		features: [
			'20 stickers QR uniques',
			'Support dédié',
			'Économisez 3000 FCFA',
		],
	},
]

const PAYMENT_METHODS = [
	{
		id: 'orange-money',
		name: 'Orange Money',
		icon: '/payments/orange-money.png',
		color: '#FF6600',
		prefix: '07',
	},
	{
		id: 'mtn-momo',
		name: 'MTN MoMo',
		icon: '/payments/mtn-momo.png',
		color: '#FFCC00',
		prefix: '05',
	},
	{
		id: 'moov-money',
		name: 'Moov Money',
		icon: '/payments/moov-money.png',
		color: '#0066CC',
		prefix: '01',
	},
	{
		id: 'wave',
		name: 'Wave',
		icon: '/payments/wave.png',
		color: '#1DC9FF',
		prefix: '07',
	},
]

type Step = 'select' | 'delivery' | 'payment' | 'confirmation'
type FormDataKey = 'name' | 'phone' | 'address' | 'city' | 'paymentPhone'

export default function CommanderPage() {
	const [step, setStep] = useState<Step>('select')
	const [selectedPack, setSelectedPack] = useState<string | null>(null)
	const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
	const [isProcessing, setIsProcessing] = useState(false)
	const [orderComplete, setOrderComplete] = useState(false)
	const [couponInput, setCouponInput] = useState('')
	const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
	const [couponError, setCouponError] = useState('')

	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		address: '',
		city: 'Abidjan',
		paymentPhone: '',
	})

	const selectedPackData = PACKS.find(p => p.id === selectedPack)
	const selectedPaymentData = PAYMENT_METHODS.find(p => p.id === paymentMethod)
	const deliveryFee = appliedCoupon ? 0 : DELIVERY_FEE
	const totalPrice = (selectedPackData?.price ?? 0) + deliveryFee

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('fr-FR').format(price)

	const handleFormChange = (key: FormDataKey, value: string) => {
		setFormData(prev => ({ ...prev, [key]: value }))
	}

	const handleApplyCoupon = () => {
		const code = couponInput.trim().toUpperCase()
		if (VALID_COUPONS.includes(code)) {
			setAppliedCoupon(code)
			setCouponError('')
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
	}

	const handleNext = () => {
		if (step === 'select' && selectedPack) {
			setStep('delivery')
		} else if (step === 'delivery') {
			if (!formData.name || !formData.phone || !formData.address) {
				toast.error('Veuillez remplir tous les champs obligatoires')
				return
			}
			setStep('payment')
		} else if (step === 'payment') {
			if (!paymentMethod || !formData.paymentPhone) {
				toast.error(
					'Veuillez sélectionner un moyen de paiement et entrer votre numéro',
				)
				return
			}
			handlePayment()
		}
	}

	const handleBack = () => {
		if (step === 'delivery') setStep('select')
		else if (step === 'payment') setStep('delivery')
		else if (step === 'confirmation') setStep('payment')
	}

	const handlePayment = async () => {
		setIsProcessing(true)
		await new Promise(resolve => setTimeout(resolve, 3000))
		setIsProcessing(false)
		setOrderComplete(true)
		setStep('confirmation')
		toast.success('Paiement effectué avec succès!')
	}

	const stepNumber =
		step === 'select' ? 1 : step === 'delivery' ? 2 : step === 'payment' ? 3 : 4

	return (
		<>
			<Header />
			<main className="bg-muted/30 flex-1">
				<OrderProgressBar stepNumber={stepNumber} />

				<div className="container mx-auto px-4 py-8">
					<div className="mx-auto max-w-4xl">
						{step === 'select' && (
							<PackSelectionStep
								packs={PACKS}
								selectedPack={selectedPack}
								onSelectPack={setSelectedPack}
								onNext={handleNext}
								formatPrice={formatPrice}
							/>
						)}

						{step === 'delivery' && selectedPackData && (
							<DeliveryStep
								formData={formData}
								onFormChange={handleFormChange}
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

						{step === 'payment' && !orderComplete && selectedPackData && (
							<PaymentStep
								paymentMethods={PAYMENT_METHODS}
								paymentMethod={paymentMethod}
								onPaymentMethodChange={setPaymentMethod}
								formData={formData}
								onFormChange={handleFormChange}
								isProcessing={isProcessing}
								selectedPackData={selectedPackData}
								selectedPaymentData={selectedPaymentData}
								deliveryFee={deliveryFee}
								totalPrice={totalPrice}
								formatPrice={formatPrice}
								onBack={handleBack}
								onNext={handleNext}
							/>
						)}

						{step === 'confirmation' && orderComplete && selectedPackData && (
							<ConfirmationStep
								selectedPackData={selectedPackData}
								formData={formData}
								selectedPaymentData={selectedPaymentData}
								deliveryFee={deliveryFee}
								totalPrice={totalPrice}
								formatPrice={formatPrice}
							/>
						)}
					</div>
				</div>
			</main>
			<Footer />
		</>
	)
}
