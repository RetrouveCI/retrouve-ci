import type { ReactNode } from 'react'

interface AuthCardProps {
	title: string
	description?: string
	children?: ReactNode
	footer?: ReactNode
}

export function AuthCard({
	title,
	description,
	children,
	footer,
}: AuthCardProps) {
	return (
		<div className="bg-card w-full max-w-md rounded-xl border p-6 shadow-sm sm:p-8">
			<div className="mb-6 space-y-4">
				<img
					src="/logo.png"
					alt="RetrouveCI"
					width={40}
					height={40}
					className="h-10 w-10 rounded-xl lg:hidden"
				/>
				<div className="space-y-1.5">
					<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
					{description && (
						<p className="text-muted-foreground text-sm">{description}</p>
					)}
				</div>
			</div>

			{children}

			{footer && <div className="mt-6">{footer}</div>}
		</div>
	)
}
