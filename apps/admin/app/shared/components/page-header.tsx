import { cn } from '@retrouve-ci/ui/utils'

interface PageHeaderProps {
	title: string
	description?: string
	actions?: React.ReactNode
	className?: string
}

/**
 * Standardized in-page header (title + optional description + actions slot)
 * so every feature page introduces its content with the same hierarchy and
 * spacing.
 */
export function PageHeader({
	title,
	description,
	actions,
	className,
}: PageHeaderProps) {
	return (
		<div
			className={cn(
				'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
				className,
			)}
		>
			<div className="min-w-0">
				<h1 className="text-foreground text-2xl font-semibold tracking-tight">
					{title}
				</h1>
				{description && (
					<p className="text-muted-foreground mt-1 text-sm">{description}</p>
				)}
			</div>
			{actions && (
				<div className="flex shrink-0 items-center gap-2">{actions}</div>
			)}
		</div>
	)
}
