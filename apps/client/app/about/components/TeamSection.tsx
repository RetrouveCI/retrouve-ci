const team = [
	{ name: 'Konan Yao', role: 'Fondateur & CEO', initials: 'KY' },
	{ name: 'Amina Traoré', role: 'Directrice Produit', initials: 'AT' },
	{ name: 'Brice Assi', role: 'Lead Développeur', initials: 'BA' },
	{ name: 'Fatou Koné', role: 'Community Manager', initials: 'FK' },
]

export function TeamSection() {
	return (
		<section className="border-t py-12 md:py-16">
			<div className="container mx-auto px-4">
				<div className="mb-10 max-w-xl">
					<h2 className="mb-3 text-3xl font-bold">L&apos;équipe</h2>
					<p className="text-muted-foreground">
						Des passionnés qui croient en la puissance de la communauté.
					</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{team.map(member => (
						<div
							key={member.name}
							className="bg-background group flex flex-col items-center rounded-2xl border p-6 text-center transition-transform duration-300 hover:-translate-y-1"
						>
							<div className="bg-primary-green/10 group-hover:bg-primary-green/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors">
								<span className="text-primary-green text-xl font-bold">
									{member.initials}
								</span>
							</div>
							<p className="font-semibold">{member.name}</p>
							<p className="text-muted-foreground mt-0.5 text-sm">{member.role}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
