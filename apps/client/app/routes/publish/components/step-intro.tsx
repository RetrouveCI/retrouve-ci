interface StepIntroProps {
	title: string
	description: string
}

export function StepIntro({ title, description }: StepIntroProps) {
	return (
		<div>
			<h1 className="text-2xl leading-tight font-bold tracking-tight">
				{title}
			</h1>
			<p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
				{description}
			</p>
		</div>
	)
}
