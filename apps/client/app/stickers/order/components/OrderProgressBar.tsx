import { Check } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

const STEPS = ['Pack', 'Livraison', 'Paiement', 'Confirmation']

export function OrderProgressBar({ stepNumber }: { stepNumber: number }) {
	return (
		<div className="bg-background sticky top-16 z-40 border-b">
			<div className="container mx-auto px-4 py-4">
				<div className="mx-auto flex max-w-2xl items-center justify-between">
					{STEPS.map((label, i) => (
						<div key={label} className="flex items-center gap-2">
							<div
								className={cn(
									'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
									i + 1 < stepNumber
										? 'bg-primary-green text-white'
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
					))}
				</div>
			</div>
		</div>
	)
}
