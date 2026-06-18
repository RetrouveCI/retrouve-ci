import { MousePointerClick, PencilLine, ShieldCheck } from 'lucide-react'

const STEPS = [
	{
		icon: MousePointerClick,
		title: 'Choisissez le type',
		description: 'Objet perdu ou objet retrouvé.',
	},
	{
		icon: PencilLine,
		title: 'Décrivez l’objet',
		description: 'Photo, lieu et date pour maximiser les chances.',
	},
	{
		icon: ShieldCheck,
		title: 'Restez joignable',
		description: 'Échangez via WhatsApp, votre numéro reste privé.',
	},
]

export function PublishSteps() {
	return (
		<div className="mx-auto mt-12 max-w-3xl">
			<div className="grid gap-4 sm:grid-cols-3">
				{STEPS.map(({ icon: Icon, title, description }, index) => (
					<div
						key={title}
						className="bg-background border-border/50 relative rounded-2xl border p-5"
					>
						<div className="mb-3 flex items-center gap-3">
							<div className="bg-primary-green/10 flex h-10 w-10 items-center justify-center rounded-xl">
								<Icon className="text-primary-green h-5 w-5" />
							</div>
							<span className="text-muted-foreground/40 text-2xl font-bold">
								{index + 1}
							</span>
						</div>
						<h3 className="mb-1 font-semibold">{title}</h3>
						<p className="text-muted-foreground text-sm">{description}</p>
					</div>
				))}
			</div>
		</div>
	)
}
