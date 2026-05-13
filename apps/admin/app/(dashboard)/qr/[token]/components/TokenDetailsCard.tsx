import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { Copy, ExternalLink, Ban, CheckCircle, Package, Calendar, User, Box } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { QRCodeSVG } from 'qrcode.react'
import type { QRToken } from '@/domain/entities/qr-token'

interface TokenDetailsCardProps {
	token: QRToken
	qrUrl: string
	onCopy: (text: string, label: string) => void
}

export function TokenDetailsCard({ token, qrUrl, onCopy }: TokenDetailsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Détails du Token</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-6 md:grid-cols-2">
					<div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-6">
						<div className="rounded-lg bg-white p-4">
							<QRCodeSVG value={qrUrl} size={180} />
						</div>
						<p className="mt-4 font-mono text-lg font-semibold">{token.token}</p>
						<div className="mt-2 flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onCopy(token.token, 'Token')}
							>
								<Copy className="mr-2 h-3 w-3" />
								Copier
							</Button>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<p className="text-muted-foreground text-sm">Statut actuel</p>
							<Badge
								className={`mt-1 ${
									token.status === 'activated'
										? 'bg-green-100 text-green-700 hover:bg-green-100'
										: token.status === 'generated'
											? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
											: 'bg-red-100 text-red-700 hover:bg-red-100'
								}`}
							>
								{token.status === 'activated'
									? 'Activé'
									: token.status === 'generated'
										? 'Généré'
										: 'Révoqué'}
							</Badge>
						</div>

						<div className="flex items-start gap-3">
							<User className="text-muted-foreground mt-0.5 h-4 w-4" />
							<div>
								<p className="text-muted-foreground text-sm">Utilisateur lié</p>
								{token.userName ? (
									<Link
										href={`/users/${token.userId}`}
										className="text-primary hover:underline"
									>
										{token.userName}
									</Link>
								) : (
									<span className="text-muted-foreground">-</span>
								)}
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Box className="text-muted-foreground mt-0.5 h-4 w-4" />
							<div>
								<p className="text-muted-foreground text-sm">Objet lié</p>
								<p>{token.linkedObject || '-'}</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Package className="text-muted-foreground mt-0.5 h-4 w-4" />
							<div>
								<p className="text-muted-foreground text-sm">Batch</p>
								<p>{token.batch}</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
							<div>
								<p className="text-muted-foreground text-sm">Créé le</p>
								<p>
									{format(new Date(token.createdAt), 'dd MMMM yyyy', {
										locale: fr,
									})}
								</p>
							</div>
						</div>

						{token.activatedAt && (
							<div className="flex items-start gap-3">
								<CheckCircle className="text-muted-foreground mt-0.5 h-4 w-4" />
								<div>
									<p className="text-muted-foreground text-sm">Activé le</p>
									<p>
										{format(new Date(token.activatedAt), 'dd MMMM yyyy', {
											locale: fr,
										})}
									</p>
								</div>
							</div>
						)}

						{token.revokedAt && (
							<div className="flex items-start gap-3">
								<Ban className="text-muted-foreground mt-0.5 h-4 w-4" />
								<div>
									<p className="text-muted-foreground text-sm">Révoqué le</p>
									<p>
										{format(new Date(token.revokedAt), 'dd MMMM yyyy', {
											locale: fr,
										})}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="bg-muted/30 mt-6 rounded-lg border p-4">
					<p className="text-muted-foreground mb-2 text-sm">URL du QR Code</p>
					<div className="flex items-center gap-2">
						<code className="flex-1 truncate text-sm">{qrUrl}</code>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onCopy(qrUrl, 'URL')}
						>
							<Copy className="h-3 w-3" />
						</Button>
						<Button variant="outline" size="sm" asChild>
							<a href={qrUrl} target="_blank" rel="noopener noreferrer">
								<ExternalLink className="h-3 w-3" />
							</a>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
