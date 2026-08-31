import { DELIVERY_FEE } from '@app/contracts/sticker-orders'
import { Button, Input, Label } from '@app/ui/components'
import type { Control } from 'react-hook-form'
import { ArrowLeft, Banknote, Tag, Check, X, Loader2 } from 'lucide-react'
import { FormInputField, FormTextareaField } from '@app/ui/components/form'
import { OrderSummaryCard } from './order-summary-card'
import type { StickerOrderData, StickerOrderInput } from '../order.schema'

interface Pack {
	id: string
	name: string
	quantity: number
	price: number
}

interface DeliveryStepProps {
	control: Control<StickerOrderInput, unknown, StickerOrderData>
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
	isProcessing: boolean
	onBack: () => void
}

export function DeliveryStep({
	control,
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
	isProcessing,
	onBack,
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
					<FormInputField
						control={control}
						name="name"
						label="Nom complet"
						required
						placeholder="Kouadio Jean"
						className="h-12 rounded-xl"
					/>

					<FormInputField
						control={control}
						name="phone"
						label="Téléphone"
						required
						type="tel"
						placeholder="07 XX XX XX XX"
						className="h-12 rounded-xl"
					/>

					<FormTextareaField
						control={control}
						name="address"
						label="Adresse de livraison"
						required
						placeholder="Cocody Riviera 2, près de la pharmacie..."
						className="min-h-20 resize-none rounded-xl"
					/>

					<FormInputField
						control={control}
						name="city"
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
								<span className="text-primary-green-text flex items-center gap-2 text-sm font-medium">
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
									{formatPrice(DELIVERY_FEE)} FCFA
								</span>{' '}
								partout à Abidjan.
							</p>
						)}
					</div>
				</div>

				<div className="border-accent-orange/20 bg-accent-orange/10 rounded-xl border p-4">
					<p className="text-accent-orange-text flex items-center gap-2 text-sm font-medium">
						<Banknote className="h-4 w-4 shrink-0" />
						Vous payez {formatPrice(totalPrice)} FCFA en espèces au livreur, à
						la réception de vos stickers.
					</p>
				</div>

				<Button
					type="submit"
					size="lg"
					disabled={isProcessing}
					className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-white"
				>
					{isProcessing ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Traitement en cours...
						</>
					) : (
						'Confirmer la commande'
					)}
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
