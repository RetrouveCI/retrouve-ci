import { Button } from '@retrouve-ci/ui/components'
import { Package, Check, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

interface Pack {
	id: string
	name: string
	quantity: number
	price: number
	description: string
	popular: boolean
	features: string[]
}

interface PackSelectionStepProps {
	packs: Pack[]
	selectedPack: string | null
	onSelectPack: (id: string) => void
	onNext: () => void
	formatPrice: (n: number) => string
}

export function PackSelectionStep({
	packs,
	selectedPack,
	onSelectPack,
	onNext,
	formatPrice,
}: PackSelectionStepProps) {
	return (
		<div className="space-y-6">
			<div className="mb-8 text-center">
				<h1 className="mb-2 text-3xl font-bold">Choisissez votre pack</h1>
				<p className="text-muted-foreground">
					Sélectionnez le pack qui correspond à vos besoins
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{packs.map(pack => (
					<button
						key={pack.id}
						onClick={() => onSelectPack(pack.id)}
						className={cn(
							'relative rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:shadow-lg',
							selectedPack === pack.id
								? 'border-primary-green bg-primary-green/5 shadow-md'
								: 'border-border bg-background hover:border-primary-green/30',
						)}
					>
						{pack.popular && (
							<div className="absolute -top-3 left-1/2 -translate-x-1/2">
								<span className="bg-accent-orange rounded-full px-3 py-1 text-xs font-semibold text-white">
									Populaire
								</span>
							</div>
						)}

						{selectedPack === pack.id && (
							<div className="bg-primary-green absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full">
								<Check className="h-4 w-4 text-white" />
							</div>
						)}

						<div className="mb-4">
							<div className="bg-primary-green/10 mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl">
								<Package className="text-primary-green h-6 w-6" />
							</div>
							<h3 className="text-lg font-bold">{pack.name}</h3>
							<p className="text-muted-foreground text-sm">{pack.description}</p>
						</div>

						<div className="mb-4">
							<span className="text-3xl font-bold">{formatPrice(pack.price)}</span>
							<span className="text-muted-foreground ml-1">FCFA</span>
							<p className="text-muted-foreground text-sm">{pack.quantity} stickers</p>
						</div>

						<ul className="space-y-2">
							{pack.features.map((feature, i) => (
								<li key={i} className="flex items-center gap-2 text-sm">
									<CheckCircle2 className="text-primary-green h-4 w-4 shrink-0" />
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
					onClick={onNext}
					disabled={!selectedPack}
					className="bg-primary-green hover:bg-primary-green-dark h-12 rounded-xl px-8 text-white"
				>
					Continuer
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
