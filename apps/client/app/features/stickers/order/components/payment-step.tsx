import {
	Button,
	Input,
	Label,
	RadioGroup,
	RadioGroupItem,
} from '@retrouve-ci/ui/components'
import {
	ArrowLeft,
	Phone,
	Shield,
	Smartphone,
	Check,
	CreditCard,
	Loader2,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { OrderSummaryCard } from './order-summary-card'

interface FormData {
	name: string
	phone: string
	address: string
	city: string
	paymentPhone: string
}

interface Pack {
	id: string
	name: string
	quantity: number
	price: number
}

interface PaymentMethod {
	id: string
	name: string
	icon: string
	color: string
	prefix: string
}

interface PaymentStepProps {
	paymentMethods: PaymentMethod[]
	paymentMethod: string | null
	onPaymentMethodChange: (id: string) => void
	formData: FormData
	onFormChange: (key: keyof FormData, value: string) => void
	isProcessing: boolean
	selectedPackData: Pack
	selectedPaymentData: PaymentMethod | undefined
	deliveryFee: number
	totalPrice: number
	formatPrice: (n: number) => string
	onBack: () => void
	onNext: () => void
}

export function PaymentStep({
	paymentMethods,
	paymentMethod,
	onPaymentMethodChange,
	formData,
	onFormChange,
	isProcessing,
	selectedPackData,
	selectedPaymentData,
	deliveryFee,
	totalPrice,
	formatPrice,
	onBack,
	onNext,
}: PaymentStepProps) {
	return (
		<div className="grid gap-8 md:grid-cols-5">
			<div className="space-y-6 md:col-span-3">
				<div>
					<button
						onClick={onBack}
						className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour
					</button>
					<h1 className="mb-1 text-2xl font-bold">Paiement mobile</h1>
					<p className="text-muted-foreground">
						Choisissez votre moyen de paiement
					</p>
				</div>

				<div className="bg-background space-y-5 rounded-2xl border p-6">
					<RadioGroup
						value={paymentMethod || ''}
						onValueChange={onPaymentMethodChange}
					>
						<div className="grid grid-cols-2 gap-3">
							{paymentMethods.map(method => (
								<label
									key={method.id}
									className={cn(
										'relative flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all',
										paymentMethod === method.id
											? 'border-primary-green bg-primary-green/5'
											: 'border-border hover:border-primary-green/30',
									)}
								>
									<RadioGroupItem value={method.id} className="sr-only" />
									<div
										className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white"
										style={{ backgroundColor: method.color }}
									>
										<Smartphone className="h-5 w-5" />
									</div>
									<span className="text-sm font-medium">{method.name}</span>
									{paymentMethod === method.id && (
										<Check className="text-primary-green absolute top-2 right-2 h-4 w-4" />
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
									onChange={e => onFormChange('paymentPhone', e.target.value)}
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

				<div className="border-accent-orange/20 bg-accent-orange/10 rounded-xl border p-4">
					<p className="text-accent-orange flex items-center gap-2 text-sm font-medium">
						<Shield className="h-4 w-4" />
						Paiement sécurisé et crypté
					</p>
				</div>

				<Button
					size="lg"
					onClick={onNext}
					disabled={!paymentMethod || !formData.paymentPhone || isProcessing}
					className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-white"
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

			<div className="md:col-span-2">
				<OrderSummaryCard
					selectedPackData={selectedPackData}
					deliveryFee={deliveryFee}
					totalPrice={totalPrice}
					formatPrice={formatPrice}
					deliveryInfo={{
						name: formData.name,
						address: formData.address,
						city: formData.city,
					}}
				/>
			</div>
		</div>
	)
}
