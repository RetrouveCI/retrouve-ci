import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { cn } from '@app/ui/utils'

interface PublishActionBarProps {
	step: number
	isLastStep: boolean
	isSubmitting: boolean
	hasDraft: boolean
	fillClass: string
	onBack: () => void
	onNext: () => void
}

/**
 * The one dominant action of each screen, §2.1's low action bar. It replaces
 * the tab bar rather than sitting above it, which is why the tunnel leaves the
 * shell — and why the safe-area inset is read here.
 */
export function PublishActionBar({
	step,
	isLastStep,
	isSubmitting,
	hasDraft,
	fillClass,
	onBack,
	onNext,
}: PublishActionBarProps) {
	return (
		<div
			className="bg-background/95 sticky bottom-0 z-30 border-t backdrop-blur-md"
			style={{
				paddingBottom: 'max(1.25rem, var(--safe-bottom))',
				paddingLeft: 'max(1rem, var(--safe-left))',
				paddingRight: 'max(1rem, var(--safe-right))',
			}}
		>
			<div className="mx-auto flex max-w-2xl items-center gap-3 pt-3">
				{step === 1 ? (
					<p
						className="text-muted-foreground flex min-w-0 flex-1 items-center gap-1.5 text-xs"
						role="status"
					>
						{hasDraft && (
							<>
								<Check className="text-primary-green h-3.5 w-3.5 shrink-0" />
								<span className="truncate">Brouillon enregistré</span>
							</>
						)}
					</p>
				) : (
					<button
						type="button"
						onClick={onBack}
						aria-label="Étape précédente"
						className="border-border text-foreground hover:bg-muted h-control flex w-14 shrink-0 items-center justify-center rounded-[14px] border-[1.5px] transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
				)}

				<button
					type={isLastStep ? 'submit' : 'button'}
					onClick={isLastStep ? undefined : onNext}
					disabled={isSubmitting}
					className={cn(
						'h-control flex items-center justify-center gap-2 rounded-[14px] px-7 text-lg font-semibold transition-colors disabled:opacity-60',
						step === 1 ? 'shrink-0' : 'flex-1',
						fillClass,
					)}
				>
					{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
					{isLastStep ? 'Publier mon annonce' : 'Continuer'}
				</button>
			</div>
		</div>
	)
}
