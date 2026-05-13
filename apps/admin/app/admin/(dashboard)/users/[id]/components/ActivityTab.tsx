import { Badge, CardContent } from '@retrouve-ci/ui/components'
import { Scan, Phone, CheckCircle, QrCode } from 'lucide-react'
import { BentoCard } from '@/components/admin/bento-card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Event {
	id: number
	type: 'scan' | 'contact' | 'activation' | string
	token: string | null
	timestamp: string
	source: string
}

export function ActivityTab({ events }: { events: Event[] }) {
	return (
		<BentoCard variant="table">
			<CardContent className="pt-6">
				{events.length > 0 ? (
					<div className="space-y-3">
						{events.map(event => (
							<div
								key={event.id}
								className="bg-card flex items-start gap-4 rounded-lg border p-4 transition-all hover:shadow-sm"
							>
								<div
									className={`rounded-full p-2.5 ${
										event.type === 'scan'
											? 'bg-green-100'
											: event.type === 'contact'
												? 'bg-orange-100'
												: event.type === 'activation'
													? 'bg-blue-100'
													: 'bg-gray-100'
									}`}
								>
									{event.type === 'scan' ? (
										<Scan className="h-4 w-4 text-green-600" />
									) : event.type === 'contact' ? (
										<Phone className="h-4 w-4 text-orange-600" />
									) : event.type === 'activation' ? (
										<CheckCircle className="h-4 w-4 text-blue-600" />
									) : (
										<QrCode className="h-4 w-4 text-gray-600" />
									)}
								</div>
								<div className="flex-1">
									<p className="font-medium">
										<span className="capitalize">{event.type}</span>
										{event.token && (
											<span className="bg-muted ml-2 rounded px-2 py-0.5 font-mono text-sm">
												{event.token}
											</span>
										)}
									</p>
									<p className="text-muted-foreground mt-1 text-sm">
										{format(
											new Date(event.timestamp),
											"dd MMM yyyy 'à' HH:mm",
											{
												locale: fr,
											},
										)}
									</p>
								</div>
								<Badge variant="outline" className="text-xs">
									{event.source}
								</Badge>
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="bg-muted rounded-full p-4">
							<Scan className="text-muted-foreground h-8 w-8" />
						</div>
						<p className="mt-4 font-medium">Aucune activité</p>
						<p className="text-muted-foreground mt-1 text-sm">
							Aucune activité enregistrée pour cet utilisateur
						</p>
					</div>
				)}
			</CardContent>
		</BentoCard>
	)
}
