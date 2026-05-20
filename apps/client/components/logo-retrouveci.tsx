import { cn } from '@retrouve-ci/ui/utils'
import Image from 'next/image'

interface Props {
	height?: number
	width?: number
	className?: string
}

export function LogoRetrouveCI({ height = 24, width = 24, className }: Props) {
	return (
		<div className="flex items-center gap-2">
			<Image
				src="/logo.png"
				alt="RetrouveCI logo"
				width={width}
				height={height}
				className={cn('rounded-xl', className)}
			/>
			<span className="text-xl font-bold tracking-tight">
				Retrouve<span className="text-accent-orange">CI</span>
			</span>
		</div>
	)
}
