import {
	Button,
	Badge,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { QrCode } from 'lucide-react'
import { BentoCard } from '@/components/bento-card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { type QRToken } from '@/domain/entities/qr-token'

export function QrTokensTab({ tokens }: { tokens: QRToken[] }) {
	return (
		<BentoCard variant="table">
			<CardContent className="pt-6">
				{tokens.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Token</TableHead>
								<TableHead>Statut</TableHead>
								<TableHead>Batch</TableHead>
								<TableHead>Date activation</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tokens.map(token => (
								<TableRow key={token.token} className="hover:bg-muted/50">
									<TableCell className="font-mono font-medium">
										{token.token}
									</TableCell>
									<TableCell>
										<Badge
											className={
												token.status === 'activated'
													? 'bg-green-100 text-green-700 hover:bg-green-100'
													: token.status === 'generated'
														? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
														: 'bg-red-100 text-red-700 hover:bg-red-100'
											}
										>
											{token.status === 'activated'
												? 'Activé'
												: token.status === 'generated'
													? 'Généré'
													: 'Révoqué'}
										</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{token.batch}
									</TableCell>
									<TableCell>
										{token.activatedAt
											? format(new Date(token.activatedAt), 'dd MMM yyyy', {
													locale: fr,
												})
											: '-'}
									</TableCell>
									<TableCell className="text-right">
										<Button variant="ghost" size="sm" asChild>
											<Link href={`/qr/${token.token}`}>Voir</Link>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="bg-muted rounded-full p-4">
							<QrCode className="text-muted-foreground h-8 w-8" />
						</div>
						<p className="mt-4 font-medium">Aucun QR Token</p>
						<p className="text-muted-foreground mt-1 text-sm">
							Cet utilisateur n&apos;a pas encore de QR codes liés
						</p>
					</div>
				)}
			</CardContent>
		</BentoCard>
	)
}
