import { Link } from 'react-router'
import { ArrowLeft, X } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { STEP_COUNT } from '../hooks/use-publish-steps'

const ICON_BUTTON =
	'text-foreground hover:bg-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors'

interface PublishHeaderProps {
	step: number
	segmentClass: string
	onBack: () => void
}

/**
 * The tunnel's own bar, in place of the app shell: these routes sit outside
 * `routes/layout.tsx` so the bottom action bar is the only thing at the foot of
 * the screen — two fixed bars would sit on top of each other and steal each
 * other's taps.
 */
export function PublishHeader({
	step,
	segmentClass,
	onBack,
}: PublishHeaderProps) {
	return (
		<header
			className="bg-background/95 sticky top-0 z-30 border-b backdrop-blur-md"
			style={{
				paddingTop: 'env(safe-area-inset-top)',
				paddingLeft: 'env(safe-area-inset-left)',
				paddingRight: 'env(safe-area-inset-right)',
			}}
		>
			<div className="mx-auto flex h-14 max-w-2xl items-center gap-2 pr-4 pl-2.5">
				{step === 1 ? (
					<Link to="/" aria-label="Fermer" className={ICON_BUTTON}>
						<X className="h-5 w-5" />
					</Link>
				) : (
					<button
						type="button"
						onClick={onBack}
						aria-label="Étape précédente"
						className={ICON_BUTTON}
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
				)}

				<p className="flex-1 truncate text-base font-bold tracking-tight">
					Publier une annonce
				</p>

				<span className="text-muted-foreground shrink-0 text-[12.5px] tabular-nums">
					{step} / {STEP_COUNT}
				</span>
			</div>

			<div
				className="mx-auto flex max-w-2xl gap-1.5 px-4 pb-3.5"
				role="progressbar"
				aria-valuenow={step}
				aria-valuemin={1}
				aria-valuemax={STEP_COUNT}
				aria-label={`Étape ${step} sur ${STEP_COUNT}`}
			>
				{Array.from({ length: STEP_COUNT }, (_, index) => (
					<span
						key={index}
						className={cn(
							'h-1 flex-1 rounded-full',
							index < step ? segmentClass : 'bg-muted',
						)}
					/>
				))}
			</div>
		</header>
	)
}
