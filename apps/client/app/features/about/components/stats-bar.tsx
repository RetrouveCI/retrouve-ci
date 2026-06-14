const stats = [
	{ value: '2 000+', label: 'Objets retrouvés' },
	{ value: '15 000+', label: 'Utilisateurs actifs' },
	{ value: '26', label: 'Villes couvertes' },
	{ value: '94%', label: 'Taux de satisfaction' },
]

export function StatsBar() {
	return (
		<section className="bg-muted/30 border-b">
			<div className="container mx-auto px-4 py-6">
				<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
					{stats.map(s => (
						<div key={s.label} className="text-center">
							<p className="text-primary-green text-2xl font-bold md:text-3xl">
								{s.value}
							</p>
							<p className="text-muted-foreground mt-0.5 text-xs">{s.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
