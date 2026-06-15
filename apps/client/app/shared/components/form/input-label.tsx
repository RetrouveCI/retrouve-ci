import { Label } from '@retrouve-ci/ui/components'
import type { ReactNode } from 'react'

interface InputLabelProps {
	htmlFor?: string
	required?: boolean
	className?: string
	children: ReactNode
}

export function InputLabel({
	htmlFor,
	required,
	className,
	children,
}: InputLabelProps) {
	return (
		<Label htmlFor={htmlFor} className={className}>
			{children} {required && <span className="text-destructive">*</span>}
		</Label>
	)
}
