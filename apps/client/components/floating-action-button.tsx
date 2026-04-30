'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'

interface FloatingActionButtonProps {
	href: string
	label?: string
	className?: string
}

export function FloatingActionButton({
	href,
	label = 'Publier',
	className,
}: FloatingActionButtonProps) {
	return (
		<Link
			href={href}
			className={cn(
				'group fixed right-6 bottom-6 z-50',
				'flex items-center gap-0 overflow-hidden',
				'h-12 rounded-full',
				'bg-foreground text-background',
				'shadow-foreground/20 shadow-lg',
				'ring-foreground/10 ring-1',
				'transition-all duration-300',
				'hover:shadow-foreground/25 hover:pr-4 hover:shadow-xl',
				'pr-0 pl-0',
				className,
			)}
		>
			{/* Icon circle */}
			<span className="flex h-12 w-12 shrink-0 items-center justify-center">
				<Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
			</span>
			{/* Animated label */}
			<span className="max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-[80px] group-hover:opacity-100">
				{label}
			</span>
		</Link>
	)
}
