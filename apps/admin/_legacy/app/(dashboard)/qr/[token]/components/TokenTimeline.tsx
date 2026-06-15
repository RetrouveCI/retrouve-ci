import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { CheckCircle, Package } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { QRToken } from '@/domain/entities/qr-token'
import type { Event } from '@/domain/entities/event'

interface TokenTimelineProps {
	token: QRToken
	events: Event[]
}

const eventIconBg: Record<string, string> = {
	scan: 'bg-green-100',
	contact: 'bg-orange-100',
	activation: 'bg-blue-100',
	revocation: 'bg-red-100',
}

const eventIconColor: Record<string, string> = {
	scan: 'text-green-600',
	contact: 'text-orange-600',
	activation: 'text-blue-600',
	revocation: 'text-red-600',
}

const eventLabel: Record<string, string> = {
	scan: 'Scanné',
	contact: 'Contact établi',
	activation: "Activé par l'utilisateur",
	generation: 'Généré',
	revocation: 'Révoqué',
}

export function TokenTimeline({ token, events }: TokenTimelineProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Historique</CardTitle>
			</CardHeader>
			<CardContent>
				{events.length > 0 || token.activatedAt || token.createdAt ? (
					<div className="space-y-4">
						{events.map(event => (
							<div
								key={event.id}
								className="border-primary/20 flex items-start gap-3 border-l-2 pb-4 pl-4"
							>
								<div
									className={`rounded-full p-1.5 ${eventIconBg[event.type] ?? 'bg-gray-100'}`}
								>
									<CheckCircle
										className={`h-3 w-3 ${eventIconColor[event.type] ?? 'text-gray-600'}`}
									/>
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium capitalize">
										{eventLabel[event.type] ?? event.type}
									</p>
									<p className="text-muted-foreground text-xs">
										{format(
											new Date(event.timestamp),
											"dd MMM yyyy 'à' HH:mm",
											{ locale: fr },
										)}
									</p>
								</div>
							</div>
						))}
						{token.activatedAt &&
							!events.some(e => e.type === 'activation') && (
								<div className="border-primary/20 flex items-start gap-3 border-l-2 pb-4 pl-4">
									<div className="rounded-full bg-green-100 p-1.5">
										<CheckCircle className="h-3 w-3 text-green-600" />
									</div>
									<div>
										<p className="text-sm font-medium">
											Activé par l&apos;utilisateur
										</p>
										<p className="text-muted-foreground text-xs">
											{format(new Date(token.activatedAt), 'dd MMM yyyy', {
												locale: fr,
											})}
										</p>
									</div>
								</div>
							)}
						<div className="border-primary/20 flex items-start gap-3 border-l-2 pl-4">
							<div className="rounded-full bg-blue-100 p-1.5">
								<Package className="h-3 w-3 text-blue-600" />
							</div>
							<div>
								<p className="text-sm font-medium">Généré ({token.batch})</p>
								<p className="text-muted-foreground text-xs">
									{format(new Date(token.createdAt), 'dd MMM yyyy', {
										locale: fr,
									})}
								</p>
							</div>
						</div>
					</div>
				) : (
					<p className="text-muted-foreground text-sm">
						Aucun événement enregistré
					</p>
				)}
			</CardContent>
		</Card>
	)
}
