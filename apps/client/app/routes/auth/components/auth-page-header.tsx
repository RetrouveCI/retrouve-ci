import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@app/ui/utils'

interface AuthPageHeaderProps {
	/** Name of the flow, shown in the bar — "Créer un compte", not the step. */
	flow: string
	heading: string
	description: ReactNode
	step?: number
	totalSteps?: number
	backTo?: string
	onBack?: () => void
}

export function AuthPageHeader({
	flow,
	heading,
	description,
	step,
	totalSteps,
	backTo,
	onBack,
}: AuthPageHeaderProps) {
	const backClassName =
		'hover:bg-muted inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors'

	return (
		<div className="mb-6">
			<div className="-mx-6 flex h-14 items-center gap-2 border-b px-2 lg:-mx-12 lg:px-4">
				{backTo ? (
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
				)}

				<p className="flex-1 text-base font-bold tracking-tight">{flow}</p>

				{step && totalSteps && (
					<span className="text-muted-foreground pr-2 text-xs tabular-nums">
						{step} / {totalSteps}
					</span>
				)}
			</div>

			{step && totalSteps && (
				<div className="mt-3.5 flex gap-1.5" aria-hidden>
					{Array.from({ length: totalSteps }, (_, index) => (
						<span
							key={index}
							className={cn(
								'h-1 flex-1 rounded-full',
								index < step ? 'bg-primary-green' : 'bg-border',
							)}
						/>
					))}
				</div>
			)}

			<div className="mt-7">
				<h1 className="mb-2 text-2xl font-bold tracking-tight lg:text-3xl">
					{heading}
				</h1>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
		</div>
	)
}
