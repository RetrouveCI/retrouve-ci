import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

/** The muted card the mockup puts under a step to set expectations. */
export function AuthNote({
	icon,
	children,
}: {
	icon?: ReactNode
	children: ReactNode
}) {
	return (
		<div className="bg-muted/40 flex items-start gap-3 rounded-xl border p-3.5">
			<span className="mt-0.5 shrink-0">
				{icon ?? <Info className="text-muted-foreground h-4 w-4" />}
			</span>
			<div className="text-muted-foreground text-xs leading-relaxed">
				{children}
			</div>
		</div>
	)
}
