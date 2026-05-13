import { LucideIcon } from 'lucide-react'

interface StepCardProps {
	number: number
	icon: LucideIcon
	title: string
	description: string
}

export function StepCard({
	number,
	icon: Icon,
	title,
	description,
}: StepCardProps) {
	return (
		<div className="relative flex flex-col items-center text-center">
			<div className="relative mb-6">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary-green to-primary-green-light shadow-lg">
					<span className="text-2xl font-bold text-white">{number}</span>
				</div>
				<div className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
					<Icon className="h-5 w-5 text-accent-orange" />
				</div>
			</div>

			<h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
			<p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
				{description}
			</p>

			<div className="absolute top-8 left-[calc(50%+40px)] -z-10 hidden h-0.5 w-[calc(100%-80px)] bg-linear-to-r from-primary-green/30 to-primary-green/10 last:hidden md:block" />
		</div>
	)
}
