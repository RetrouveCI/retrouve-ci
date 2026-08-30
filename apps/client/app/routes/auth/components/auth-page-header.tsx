import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@app/ui/utils'

interface AuthPageHeaderProps {
	/** Name of the flow — "Créer un compte", not the step. */
	flow: string
	heading: string
	description: ReactNode
	step?: number
	totalSteps?: number
	backTo?: string
	onBack?: () => void
}

/**
 * The only bar these screens have. Under `lg` it is the full-bleed 56 px bar of
 * the mobile canvas; the layout used to draw a second one above it, carrying
 * nothing but the logo. From `lg` it becomes the inline row the desktop canvas
 * shows — an outlined back control, "Étape 2 sur 3", and a short gauge — since a
 * bar across the form column would cut the two-column composition in half.
 */
export function AuthPageHeader({
	flow,
	heading,
	description,
	step,
	totalSteps,
	backTo,
	onBack,
}: AuthPageHeaderProps) {
	const hasProgress = Boolean(step && totalSteps)

	const backClassName =
		'inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-muted lg:h-10 lg:w-10 lg:border-[1.5px]'

	const back = backTo ? (
		<Link to={backTo} className={backClassName} aria-label="Retour">
			<ArrowLeft className="h-5 w-5" />
		</Link>
	) : (
		<button
			type="button"
			onClick={onBack}
			className={backClassName}
			aria-label="Retour"
		>
			<ArrowLeft className="h-5 w-5" />
		</button>
	)

	const gauge = hasProgress && (
		<div className={cn('flex gap-1.5', 'lg:ml-3 lg:w-45')} aria-hidden>
			{Array.from({ length: totalSteps as number }, (_, index) => (
				<span
					key={index}
					className={cn(
						'h-1 flex-1 rounded-full',
						index < (step as number) ? 'bg-primary-green' : 'bg-border',
					)}
				/>
			))}
		</div>
	)

	return (
		<div className="mb-6 lg:mb-8">
			<div className="-mx-6 flex h-14 items-center gap-2 border-b px-2 lg:mx-0 lg:h-auto lg:gap-2.5 lg:border-b-0 lg:px-0">
				{back}

				<p className="flex-1 text-base font-bold tracking-tight lg:hidden">
					{flow}
				</p>

				{hasProgress && (
					<>
						<span className="text-muted-foreground pr-2 text-xs tabular-nums lg:hidden">
							{step} / {totalSteps}
						</span>
						<span className="text-muted-foreground hidden text-[13.5px] lg:inline">
							Étape {step} sur {totalSteps}
						</span>
					</>
				)}

				<span className="hidden lg:contents">{gauge}</span>
			</div>

			<div className="mt-3.5 lg:hidden">{hasProgress && gauge}</div>

			<div className="mt-7 lg:mt-10">
				<h1 className="mb-2 text-2xl font-bold tracking-tight lg:text-3xl">
					{heading}
				</h1>
				<p className="text-muted-foreground text-sm lg:text-[15px]">
					{description}
				</p>
			</div>
		</div>
	)
}
