import type { LucideIcon } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

interface PublishPageHeaderProps {
	icon: LucideIcon
	iconBgClass: string
	iconColorClass: string
	title: string
	description: string
}

export function PublishPageHeader({
	icon: Icon,
	iconBgClass,
	iconColorClass,
	title,
	description,
}: PublishPageHeaderProps) {
	return (
		<div className="flex items-center gap-3 pb-2">
			<div
				className={cn(
					'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
					iconBgClass,
				)}
			>
				<Icon className={cn('h-5 w-5', iconColorClass)} />
			</div>
			<div>
				<h1 className="text-2xl font-bold">{title}</h1>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
		</div>
	)
}
