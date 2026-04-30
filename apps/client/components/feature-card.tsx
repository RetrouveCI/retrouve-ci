import { LucideIcon } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/lib/utils'

interface FeatureCardProps {
	icon: LucideIcon
	title: string
	description: string
	iconColor?: 'green' | 'orange'
}

export function FeatureCard({
	icon: Icon,
	title,
	description,
	iconColor = 'green',
}: FeatureCardProps) {
	return (
		<div className="group glass-effect elevated-card relative rounded-2xl border border-white/20 p-4 shadow-sm transition-all duration-300 hover:shadow-lg md:p-6">
			<div className="absolute inset-0 rounded-2xl bg-linear-to-br from-(--primary-green)/0 to-(--accent-orange)/0 transition-all duration-300 group-hover:from-(--primary-green)/5 group-hover:to-(--accent-orange)/5" />

			<div className="relative">
				<div
					className={cn(
						'animate-float mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl',
						iconColor === 'green'
							? 'bg-(--primary-green)/10'
							: 'bg-(--accent-orange)/10',
					)}
				>
					<Icon
						className={cn(
							'h-6 w-6 transition-transform group-hover:scale-110 group-hover:rotate-3',
							iconColor === 'green'
								? 'text-(--primary-green)'
								: 'text-(--accent-orange)',
						)}
					/>
				</div>

				<h3 className="text-foreground mb-1.5 text-lg font-semibold">{title}</h3>
				<p className="text-muted-foreground text-sm leading-relaxed md:text-base">
					{description}
				</p>
			</div>
		</div>
	)
}
