import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { CheckCircle, Package } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { QrToken } from '../../qr.types'

interface TokenTimelineProps {
	token: QrToken
}

export function TokenTimeline({ token }: TokenTimelineProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Historique</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{token.revokedAt && (
						<div className="border-destructive/30 flex items-start gap-3 border-l-2 pb-4 pl-4">
							<div className="rounded-full bg-red-100 p-1.5">
								<CheckCircle className="h-3 w-3 text-red-600" />
							</div>
							<div>
								<p className="text-sm font-medium">Révoqué</p>
								<p className="text-muted-foreground text-xs">
									{format(new Date(token.revokedAt), "dd MMM yyyy 'à' HH:mm", {
										locale: fr,
									})}
								</p>
							</div>
						</div>
					)}

					{token.activatedAt && (
						<div className="border-primary/20 flex items-start gap-3 border-l-2 pb-4 pl-4">
							<div className="rounded-full bg-green-100 p-1.5">
								<CheckCircle className="h-3 w-3 text-green-600" />
							</div>
							<div>
								<p className="text-sm font-medium">Activé</p>
								<p className="text-muted-foreground text-xs">
									{format(new Date(token.activatedAt), "dd MMM yyyy 'à' HH:mm", {
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
							<p className="text-sm font-medium">
								Généré{token.batch ? ` (${token.batch})` : ''}
							</p>
							<p className="text-muted-foreground text-xs">
								{format(new Date(token.createdAt), "dd MMM yyyy 'à' HH:mm", {
									locale: fr,
								})}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
