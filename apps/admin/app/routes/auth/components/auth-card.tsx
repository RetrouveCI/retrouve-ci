import type { ReactNode } from 'react'

interface AuthCardProps {
	title: string
	description?: string
	children?: ReactNode
	footer?: ReactNode
}

/**
 * Heading block shared by the auth pages. The branding and the page frame belong
 * to `routes/auth/layout.tsx`, so this only owns the title, the description and
 * the trailing link — the same shape the client app's auth pages use.
 */
export function AuthCard({
	title,
	description,
	children,
	footer,
}: AuthCardProps) {
	return (
		<>
			<div className="mb-8 space-y-2">
				<h2 className="text-2xl font-bold lg:text-3xl">{title}</h2>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>

			{children}

			{footer && <div className="mt-8 border-t pt-6">{footer}</div>}
		</>
	)
}
