'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
	Package,
	Check,
	ArrowLeft,
	ArrowRight,
	MapPin,
	Phone,
	User,
	QrCode,
	Shield,
	Truck,
	CreditCard,
	Smartphone,
	CheckCircle2,
	Loader2,
	Tag,
	X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import { Input } from '@retrouve-ci/ui/components/ui/input'
import { Label } from '@retrouve-ci/ui/components/ui/label'
import { Textarea } from '@retrouve-ci/ui/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@retrouve-ci/ui/components/ui/radio-group'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@retrouve-ci/ui/lib/utils'

const DELIVERY_FEE = 1000
const VALID_COUPONS = ['RETROUVECI', 'LIVRAISON0', 'WELCOME2025']

// Pack data
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

// Payment methods
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

export default function CommanderPage() {
	const [step, setStep] = useState<Step>('select')
	const [selectedPack, setSelectedPack] = useState<string | null>(null)
	const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
	const [isProcessing, setIsProcessing] = useState(false)
	const [orderComplete, setOrderComplete] = useState(false)
	const [couponInput, setCouponInput] = useState('')
	const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
	const [couponError, setCouponError] = useState('')

	// Form data
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

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('fr-FR').format(price)
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
		// Simulate payment processing
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
				{/* Progress bar */}
				<div className="bg-background sticky top-16 z-40 border-b">
					<div className="container mx-auto px-4 py-4">
						<div className="mx-auto flex max-w-2xl items-center justify-between">
							{['Pack', 'Livraison', 'Paiement', 'Confirmation'].map(
								(label, i) => (
									<div key={label} className="flex items-center gap-2">
										<div
											className={cn(
												'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
												i + 1 < stepNumber
													? 'bg-[var(--primary-green)] text-white'
													: i + 1 === stepNumber
														? 'bg-foreground text-background'
														: 'bg-muted text-muted-foreground',
											)}
										>
											{i + 1 < stepNumber ? (
												<Check className="h-4 w-4" />
											) : (
												i + 1
											)}
										</div>
										<span
											className={cn(
												'hidden text-sm sm:block',
												i + 1 === stepNumber
													? 'font-medium'
													: 'text-muted-foreground',
											)}
										>
											{label}
										</span>
										{i < 3 && (
											<div className="bg-border mx-2 h-px w-8 md:w-16" />
										)}
									</div>
								),
							)}
						</div>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8">
					<div className="mx-auto max-w-4xl">
						{/* Step 1: Pack Selection */}
						{step === 'select' && (
							<div className="space-y-6">
								<div className="mb-8 text-center">
									<h1 className="mb-2 text-3xl font-bold">
										Choisissez votre pack
									</h1>
									<p className="text-muted-foreground">
										Sélectionnez le pack qui correspond à vos besoins
									</p>
								</div>

								<div className="grid gap-4 md:grid-cols-3">
									{PACKS.map(pack => (
										<button
											key={pack.id}
											onClick={() => setSelectedPack(pack.id)}
											className={cn(
												'relative rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:shadow-lg',
												selectedPack === pack.id
													? 'border-[var(--primary-green)] bg-[var(--primary-green)]/5 shadow-md'
													: 'border-border bg-background hover:border-[var(--primary-green)]/30',
											)}
										>
											{pack.popular && (
												<div className="absolute -top-3 left-1/2 -translate-x-1/2">
													<span className="rounded-full bg-[var(--accent-orange)] px-3 py-1 text-xs font-semibold text-white">
														Populaire
													</span>
												</div>
											)}

											{selectedPack === pack.id && (
												<div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-green)]">
													<Check className="h-4 w-4 text-white" />
												</div>
											)}

											<div className="mb-4">
												<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-green)]/10">
													<Package className="h-6 w-6 text-[var(--primary-green)]" />
												</div>
												<h3 className="text-lg font-bold">{pack.name}</h3>
												<p className="text-muted-foreground text-sm">
													{pack.description}
												</p>
											</div>

											<div className="mb-4">
												<span className="text-3xl font-bold">
													{formatPrice(pack.price)}
												</span>
												<span className="text-muted-foreground ml-1">FCFA</span>
												<p className="text-muted-foreground text-sm">
													{pack.quantity} stickers
												</p>
											</div>

											<ul className="space-y-2">
												{pack.features.map((feature, i) => (
													<li
														key={i}
														className="flex items-center gap-2 text-sm"
													>
														<CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--primary-green)]" />
														<span>{feature}</span>
													</li>
												))}
											</ul>
										</button>
									))}
								</div>

								<div className="flex justify-center pt-4">
									<Button
										size="lg"
										onClick={handleNext}
										disabled={!selectedPack}
										className="h-12 rounded-xl bg-[var(--primary-green)] px-8 text-white hover:bg-[var(--primary-green-dark)]"
									>
										Continuer
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>
							</div>
						)}

						{/* Step 2: Delivery */}
						{step === 'delivery' && (
							<div className="grid gap-8 md:grid-cols-5">
								<div className="space-y-6 md:col-span-3">
									<div>
										<Link
											href="#"
											onClick={e => {
												e.preventDefault()
												handleBack()
											}}
											className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm"
										>
											<ArrowLeft className="h-4 w-4" />
											Retour
										</Link>
										<h1 className="mb-1 text-2xl font-bold">
											Informations de livraison
										</h1>
										<p className="text-muted-foreground">
											Où souhaitez-vous recevoir vos stickers ?
										</p>
									</div>

									<div className="bg-background space-y-5 rounded-2xl border p-6">
										<div className="space-y-2">
											<Label htmlFor="name">Nom complet *</Label>
											<div className="relative">
												<User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
												<Input
													id="name"
													value={formData.name}
													onChange={e =>
														setFormData(prev => ({
															...prev,
															name: e.target.value,
														}))
													}
													placeholder="Kouadio Jean"
													className="h-12 rounded-xl pl-10"
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="phone">Téléphone *</Label>
											<div className="relative">
												<Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
												<Input
													id="phone"
													value={formData.phone}
													onChange={e =>
														setFormData(prev => ({
															...prev,
															phone: e.target.value,
														}))
													}
													placeholder="07 XX XX XX XX"
													className="h-12 rounded-xl pl-10"
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="address">Adresse de livraison *</Label>
											<div className="relative">
												<MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
												<Textarea
													id="address"
													value={formData.address}
													onChange={e =>
														setFormData(prev => ({
															...prev,
															address: e.target.value,
														}))
													}
													placeholder="Cocody Riviera 2, près de la pharmacie..."
													className="min-h-[80px] resize-none rounded-xl pl-10"
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="city">Ville</Label>
											<Input
												id="city"
												value={formData.city}
												onChange={e =>
													setFormData(prev => ({
														...prev,
														city: e.target.value,
													}))
												}
												placeholder="Abidjan"
												className="h-12 rounded-xl"
											/>
										</div>

										{/* Coupon */}
										<div className="space-y-2 border-t pt-2">
											<Label
												htmlFor="coupon"
												className="flex items-center gap-1.5"
											>
												<Tag className="h-3.5 w-3.5" />
												Code promo{' '}
												<span className="text-muted-foreground font-normal">
													(livraison offerte)
												</span>
											</Label>
											{appliedCoupon ? (
												<div className="flex h-12 items-center justify-between rounded-xl border-2 border-[var(--primary-green)] bg-[var(--primary-green)]/5 px-4">
													<span className="flex items-center gap-2 text-sm font-medium text-[var(--primary-green)]">
														<Check className="h-4 w-4" />
														{appliedCoupon} — Livraison offerte
													</span>
													<button
														onClick={handleRemoveCoupon}
														className="text-muted-foreground hover:text-destructive transition-colors"
													>
														<X className="h-4 w-4" />
													</button>
												</div>
											) : (
												<div className="flex gap-2">
													<Input
														id="coupon"
														value={couponInput}
														onChange={e => {
															setCouponInput(e.target.value)
															setCouponError('')
														}}
														onKeyDown={e =>
															e.key === 'Enter' && handleApplyCoupon()
														}
														placeholder="RETROUVECI"
														className="h-12 rounded-xl uppercase"
													/>
													<button
														onClick={handleApplyCoupon}
														disabled={!couponInput.trim()}
														className="hover:bg-muted h-12 shrink-0 rounded-xl border px-4 text-sm font-medium transition-colors disabled:opacity-40"
													>
														Appliquer
													</button>
												</div>
											)}
											{couponError && (
												<p className="text-destructive text-xs">
													{couponError}
												</p>
											)}
											{!appliedCoupon && (
												<p className="text-muted-foreground text-xs">
													Sans coupon, la livraison est facturée{' '}
													<span className="font-medium">
														{formatPrice(DELIVERY_FEE)} FCFA
													</span>{' '}
													partout à Abidjan.
												</p>
											)}
										</div>
									</div>

									<Button
										size="lg"
										onClick={handleNext}
										className="h-12 w-full rounded-xl bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-dark)]"
									>
										Continuer vers le paiement
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>

								{/* Order summary */}
								<div className="md:col-span-2">
									<div className="bg-background sticky top-36 rounded-2xl border p-6">
										<h3 className="mb-4 font-semibold">Récapitulatif</h3>
										{selectedPackData && (
											<div className="space-y-4">
												<div className="flex items-center gap-3 border-b pb-4">
													<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-green)]/10">
														<QrCode className="h-6 w-6 text-[var(--primary-green)]" />
													</div>
													<div>
														<p className="font-medium">
															Pack {selectedPackData.name}
														</p>
														<p className="text-muted-foreground text-sm">
															{selectedPackData.quantity} stickers QR
														</p>
													</div>
												</div>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Sous-total
														</span>
														<span>
															{formatPrice(selectedPackData.price)} FCFA
														</span>
													</div>
													<div className="flex items-center justify-between">
														<span className="text-muted-foreground">
															Livraison
														</span>
														{deliveryFee === 0 ? (
															<span className="flex items-center gap-1 text-[var(--primary-green)]">
																<Tag className="h-3 w-3" /> Gratuite
															</span>
														) : (
															<span>{formatPrice(deliveryFee)} FCFA</span>
														)}
													</div>
												</div>
												<div className="flex justify-between border-t pt-4 text-lg font-semibold">
													<span>Total</span>
													<span>{formatPrice(totalPrice)} FCFA</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Step 3: Payment */}
						{step === 'payment' && !orderComplete && (
							<div className="grid gap-8 md:grid-cols-5">
								<div className="space-y-6 md:col-span-3">
									<div>
										<Link
											href="#"
											onClick={e => {
												e.preventDefault()
												handleBack()
											}}
											className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm"
										>
											<ArrowLeft className="h-4 w-4" />
											Retour
										</Link>
										<h1 className="mb-1 text-2xl font-bold">Paiement mobile</h1>
										<p className="text-muted-foreground">
											Choisissez votre moyen de paiement
										</p>
									</div>

									<div className="bg-background space-y-5 rounded-2xl border p-6">
										<RadioGroup
											value={paymentMethod || ''}
											onValueChange={setPaymentMethod}
										>
											<div className="grid grid-cols-2 gap-3">
												{PAYMENT_METHODS.map(method => (
													<label
														key={method.id}
														className={cn(
															'relative flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all',
															paymentMethod === method.id
																? 'border-[var(--primary-green)] bg-[var(--primary-green)]/5'
																: 'border-border hover:border-[var(--primary-green)]/30',
														)}
													>
														<RadioGroupItem
															value={method.id}
															className="sr-only"
														/>
														<div
															className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white"
															style={{ backgroundColor: method.color }}
														>
															<Smartphone className="h-5 w-5" />
														</div>
														<span className="text-sm font-medium">
															{method.name}
														</span>
														{paymentMethod === method.id && (
															<Check className="absolute top-2 right-2 h-4 w-4 text-[var(--primary-green)]" />
														)}
													</label>
												))}
											</div>
										</RadioGroup>

										{paymentMethod && (
											<div className="space-y-2 border-t pt-4">
												<Label htmlFor="payment-phone">
													Numéro {selectedPaymentData?.name} *
												</Label>
												<div className="relative">
													<Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
													<Input
														id="payment-phone"
														value={formData.paymentPhone}
														onChange={e =>
															setFormData(prev => ({
																...prev,
																paymentPhone: e.target.value,
															}))
														}
														placeholder={`${selectedPaymentData?.prefix} XX XX XX XX`}
														className="h-12 rounded-xl pl-10"
													/>
												</div>
												<p className="text-muted-foreground text-xs">
													Vous recevrez une demande de paiement sur ce numéro.
												</p>
											</div>
										)}
									</div>

									<div className="rounded-xl border border-[var(--accent-orange)]/20 bg-[var(--accent-orange)]/10 p-4">
										<p className="flex items-center gap-2 text-sm font-medium text-[var(--accent-orange)]">
											<Shield className="h-4 w-4" />
											Paiement sécurisé et crypté
										</p>
									</div>

									<Button
										size="lg"
										onClick={handleNext}
										disabled={
											!paymentMethod || !formData.paymentPhone || isProcessing
										}
										className="h-12 w-full rounded-xl bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-dark)]"
									>
										{isProcessing ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Traitement en cours...
											</>
										) : (
											<>
												Payer {formatPrice(totalPrice)} FCFA
												<CreditCard className="ml-2 h-4 w-4" />
											</>
										)}
									</Button>
								</div>

								{/* Order summary */}
								<div className="md:col-span-2">
									<div className="bg-background sticky top-36 rounded-2xl border p-6">
										<h3 className="mb-4 font-semibold">Récapitulatif</h3>
										{selectedPackData && (
											<div className="space-y-4">
												<div className="flex items-center gap-3 border-b pb-4">
													<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-green)]/10">
														<QrCode className="h-6 w-6 text-[var(--primary-green)]" />
													</div>
													<div>
														<p className="font-medium">
															Pack {selectedPackData.name}
														</p>
														<p className="text-muted-foreground text-sm">
															{selectedPackData.quantity} stickers QR
														</p>
													</div>
												</div>
												<div className="space-y-2 text-sm">
													<div className="flex items-start gap-2">
														<MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
														<div>
															<p className="font-medium">{formData.name}</p>
															<p className="text-muted-foreground">
																{formData.address}
															</p>
															<p className="text-muted-foreground">
																{formData.city}
															</p>
														</div>
													</div>
												</div>
												<div className="space-y-2 border-b pb-4 text-sm">
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															Sous-total
														</span>
														<span>
															{formatPrice(selectedPackData.price)} FCFA
														</span>
													</div>
													<div className="flex items-center justify-between">
														<span className="text-muted-foreground">
															Livraison
														</span>
														{deliveryFee === 0 ? (
															<span className="flex items-center gap-1 text-[var(--primary-green)]">
																<Tag className="h-3 w-3" /> Gratuite
															</span>
														) : (
															<span>{formatPrice(deliveryFee)} FCFA</span>
														)}
													</div>
												</div>
												<div className="flex justify-between pt-2 text-lg font-semibold">
													<span>Total</span>
													<span>{formatPrice(totalPrice)} FCFA</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Step 4: Confirmation */}
						{step === 'confirmation' && orderComplete && (
							<div className="mx-auto max-w-lg py-12 text-center">
								<div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary-green)]/10">
									<CheckCircle2 className="h-10 w-10 text-[var(--primary-green)]" />
								</div>
								<h1 className="mb-3 text-3xl font-bold">Commande confirmée!</h1>
								<p className="text-muted-foreground mb-8">
									Merci pour votre commande. Vous recevrez vos{' '}
									{selectedPackData?.quantity} stickers QR dans les prochains
									jours.
								</p>

								<div className="bg-background mb-8 rounded-2xl border p-6 text-left">
									<h3 className="mb-4 font-semibold">Détails de la commande</h3>
									<div className="space-y-3 text-sm">
										<div className="flex justify-between border-b pb-3">
											<span className="text-muted-foreground">
												Numéro de commande
											</span>
											<span className="font-mono font-medium">
												RCI-{Date.now().toString().slice(-8)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Pack</span>
											<span>
												{selectedPackData?.name} ({selectedPackData?.quantity}{' '}
												stickers)
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Sous-total</span>
											<span>
												{selectedPackData &&
													formatPrice(selectedPackData.price)}{' '}
												FCFA
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Livraison</span>
											{deliveryFee === 0 ? (
												<span className="text-[var(--primary-green)]">
													Gratuite (coupon)
												</span>
											) : (
												<span>{formatPrice(deliveryFee)} FCFA</span>
											)}
										</div>
										<div className="flex justify-between font-semibold">
											<span className="text-muted-foreground">Total payé</span>
											<span>{formatPrice(totalPrice)} FCFA</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Paiement</span>
											<span>{selectedPaymentData?.name}</span>
										</div>
										<div className="flex justify-between border-t pt-3">
											<span className="text-muted-foreground">Livraison</span>
											<span>
												{formData.address}, {formData.city}
											</span>
										</div>
									</div>
								</div>

								<div className="flex flex-col justify-center gap-3 sm:flex-row">
									<Button asChild variant="outline" className="rounded-xl">
										<Link href="/compte/stickers">Mes stickers</Link>
									</Button>
									<Button
										asChild
										className="rounded-xl bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-dark)]"
									>
										<Link href="/">Retour à l&apos;accueil</Link>
									</Button>
								</div>

								<p className="text-muted-foreground mt-8 text-xs">
									Un SMS de confirmation a été envoyé au {formData.phone}
								</p>
							</div>
						)}
					</div>
				</div>
			</main>
			<Footer />
		</>
	)
}
