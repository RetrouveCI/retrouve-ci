import { Button, Input, Label } from '@retrouve-ci/ui/components'
import type { FieldMetadata } from '@conform-to/react'
import { ArrowLeft, ArrowRight, Tag, Check, X } from 'lucide-react'
import { InputField, TextareaField } from '@retrouve-ci/ui/components/form'
import { OrderSummaryCard } from './order-summary-card'

interface Pack {
	id: string
	name: string
	quantity: number
	price: number
}

interface DeliveryStepFields {
	name: FieldMetadata<string>
	phone: FieldMetadata<string>
	address: FieldMetadata<string>
	city: FieldMetadata<string>
}

interface DeliveryStepProps {
	fields: DeliveryStepFields
	couponInput: string
	appliedCoupon: string | null
	couponError: string
	onCouponInputChange: (val: string) => void
	onApplyCoupon: () => void
	onRemoveCoupon: () => void
	selectedPackData: Pack
	deliveryFee: number
	totalPrice: number
	formatPrice: (n: number) => string
	onBack: () => void
	onNext: () => void
}

const DELIVERY_FEE_BASE = 1000

export function DeliveryStep({
	fields,
	couponInput,
	appliedCoupon,
	couponError,
	onCouponInputChange,
	onApplyCoupon,
	onRemoveCoupon,
	selectedPackData,
	deliveryFee,
	totalPrice,
	formatPrice,
	onBack,
	onNext,
}: DeliveryStepProps) {
	return (
		<div className="grid gap-8 md:grid-cols-5">
			<div className="space-y-6 md:col-span-3">
				<div>
					<button
						type="button"
						onClick={onBack}
						className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour
					</button>
					<h1 className="mb-1 text-2xl font-bold">Informations de livraison</h1>
					<p className="text-muted-foreground">
						Où souhaitez-vous recevoir vos stickers ?
					</p>
				</div>

				<div className="bg-background space-y-5 rounded-2xl border p-6">
					<InputField
						field={fields.name}
						label="Nom complet"
						required
						placeholder="Kouadio Jean"
						className="h-12 rounded-xl"
					/>

					<InputField
						field={fields.phone}
						label="Téléphone"
						required
						type="tel"
						placeholder="07 XX XX XX XX"
						className="h-12 rounded-xl"
					/>

					<TextareaField
						field={fields.address}
						label="Adresse de livraison"
						required
						placeholder="Cocody Riviera 2, près de la pharmacie..."
						className="min-h-20 resize-none rounded-xl"
					/>

					<InputField
						field={fields.city}
						label="Ville"
						placeholder="Abidjan"
						className="h-12 rounded-xl"
					/>

					<div className="space-y-2 border-t pt-2">
						<Label htmlFor="coupon" className="flex items-center gap-1.5">
							<Tag className="h-3.5 w-3.5" />
							Code promo{' '}
							<span className="text-muted-foreground font-normal">
								(livraison offerte)
							</span>
						</Label>
						{appliedCoupon ? (
							<div className="border-primary-green bg-primary-green/5 flex h-12 items-center justify-between rounded-xl border-2 px-4">
								<span className="text-primary-green flex items-center gap-2 text-sm font-medium">
									<Check className="h-4 w-4" />
									{appliedCoupon} — Livraison offerte
								</span>
								<button
									type="button"
									onClick={onRemoveCoupon}
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
									onChange={e => onCouponInputChange(e.target.value)}
									onKeyDown={e => e.key === 'Enter' && onApplyCoupon()}
									placeholder="RETROUVECI"
									className="h-12 rounded-xl uppercase"
								/>
								<button
									type="button"
									onClick={onApplyCoupon}
									disabled={!couponInput.trim()}
									className="hover:bg-muted h-12 shrink-0 rounded-xl border px-4 text-sm font-medium transition-colors disabled:opacity-40"
								>
									Appliquer
								</button>
							</div>
						)}
						{couponError && (
							<p className="text-destructive text-xs">{couponError}</p>
						)}
						{!appliedCoupon && (
							<p className="text-muted-foreground text-xs">
								Sans coupon, la livraison est facturée{' '}
								<span className="font-medium">
									{formatPrice(DELIVERY_FEE_BASE)} FCFA
								</span>{' '}
								partout à Abidjan.
							</p>
						)}
					</div>
				</div>

				<Button
					type="button"
					size="lg"
					onClick={onNext}
					className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-white"
				>
					Continuer vers le paiement
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>

			<div className="md:col-span-2">
				<OrderSummaryCard
					selectedPackData={selectedPackData}
					deliveryFee={deliveryFee}
					totalPrice={totalPrice}
					formatPrice={formatPrice}
				/>
			</div>
		</div>
	)
}
