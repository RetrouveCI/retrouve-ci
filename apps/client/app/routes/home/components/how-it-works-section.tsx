const STEPS = [
	{
		title: 'Publiez ou cherchez',
		description: 'Une annonce se poste en moins d’une minute.',
	},
	{
		title: 'On vous alerte',
		description: 'Dès qu’un objet ressemble au vôtre.',
	},
	{
		title: 'Vous récupérez',
		description: 'Échange par WhatsApp, numéro jamais exposé.',
	},
]

/**
 * The compact form the artboards draw: three rows, not three 320 px cards under
 * a centred triple heading. The step numbers used to be 72 px at 1.1:1 — the
 * biggest text on the page and the least legible on it.
 */
export function HowItWorksSection() {
	return (
		<section className="py-7 lg:py-9">
			<div className="container mx-auto px-4">
				<h2 className="mb-3.5 text-lg font-bold tracking-tight md:text-xl lg:text-2xl">
					Comment ça marche
				</h2>

				<ol className="grid gap-2.5 md:grid-cols-3 md:gap-3.5">
					{STEPS.map((step, index) => (
						<li
							key={step.title}
							className="border-border bg-background flex items-center gap-3.5 rounded-[14px] border p-3.5"
						>
							<span className="bg-primary-green/12 text-primary-green-text h-chip flex w-9.5 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
								{index + 1}
							</span>
							<span className="min-w-0">
								<span className="block text-sm font-semibold">
									{step.title}
								</span>
								<span className="text-muted-foreground mt-0.5 block text-xs">
									{step.description}
								</span>
							</span>
						</li>
					))}
				</ol>
			</div>
		</section>
	)
}
