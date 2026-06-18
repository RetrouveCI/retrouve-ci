import type { ReactNode } from 'react'

interface AuthCardProps {
	title: string
	description?: string
	children?: ReactNode
	/** Slot rendered under the children (e.g. "Retour à la connexion"). */
	footer?: ReactNode
}

/**
 * Shared chrome for the admin auth pages (login, forgot/reset password).
 * The brand panel lives in the auth layout, so the compact logo here is shown
 * on mobile only, where that panel is hidden.
 */
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
