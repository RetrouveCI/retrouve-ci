'use client'

import { Button, Badge, Card, CardContent, CardHeader, CardTitle, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@retrouve-ci/ui/components'
import { use, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/admin/topbar'
import { useQRToken } from '@/application/qr/use-qr-tokens'
import { useEvents } from '@/application/events/use-events'
import {
	ArrowLeft,
	Copy,
	ExternalLink,
	Ban,
	Pause,
	AlertTriangle,
	CheckCircle,
	Package,
	Calendar,
	User,
	Box,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'

export default function QRTokenDetailPage({
	params,
}: {
	params: Promise<{ token: string }>
}) {
	const { token: tokenId } = use(params)
	const [showRevokeDialog, setShowRevokeDialog] = useState(false)
	const { qrToken: token, isLoading, revoke: _revoke } = useQRToken(tokenId)
	const { events } = useEvents()
	const tokenEvents = events.filter(e => e.token === tokenId)

	if (isLoading) return null

	if (!token) {
		return (
			<>
				<TopBar title="Token non trouvé" />
				<div className="pt-16">
					<div className="p-4 lg:p-6">
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<AlertTriangle className="text-muted-foreground h-12 w-12" />
							<h2 className="mt-4 text-xl font-semibold">Token non trouvé</h2>
							<p className="text-muted-foreground mt-2">
								Le QR Token demandé n&apos;existe pas ou a été supprimé.
							</p>
							<Button asChild className="mt-4">
								<Link href="/admin/qr">Retour aux tokens</Link>
							</Button>
						</div>
					</div>
				</div>
			</>
		)
	}

	const qrUrl = `https://retrouveci.com/q/${token.token}`

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text)
		toast.success(`${label} copié`)
	}

	const handleRevoke = async () => {
		await _revoke()
		toast.success(`Token ${token.token} révoqué`)
		setShowRevokeDialog(false)
	}

	return (
		<>
			<TopBar title={`Token ${token.token}`} />
			<div className="pt-16">
				<div className="p-4 lg:p-6">
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Left Column - QR Code & Info */}
						<div className="space-y-6 lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>Détails du Token</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid gap-6 md:grid-cols-2">
										{/* QR Code */}
										<div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg p-6">
											<div className="rounded-lg bg-white p-4">
												<QRCodeSVG value={qrUrl} size={180} />
											</div>
											<p className="mt-4 font-mono text-lg font-semibold">
												{token.token}
											</p>
											<div className="mt-2 flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => copyToClipboard(token.token, 'Token')}
												>
													<Copy className="mr-2 h-3 w-3" />
													Copier
												</Button>
											</div>
										</div>

										{/* Token Info */}
										<div className="space-y-4">
											<div>
												<p className="text-muted-foreground text-sm">
													Statut actuel
												</p>
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
													<p className="text-muted-foreground text-sm">
														Utilisateur lié
													</p>
													{token.userName ? (
														<Link
															href={`/admin/users/${token.userId}`}
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
													<p className="text-muted-foreground text-sm">
														Objet lié
													</p>
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
													<p className="text-muted-foreground text-sm">
														Créé le
													</p>
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
														<p className="text-muted-foreground text-sm">
															Activé le
														</p>
														<p>
															{format(
																new Date(token.activatedAt),
																'dd MMMM yyyy',
																{ locale: fr },
															)}
														</p>
													</div>
												</div>
											)}

											{token.revokedAt && (
												<div className="flex items-start gap-3">
													<Ban className="text-muted-foreground mt-0.5 h-4 w-4" />
													<div>
														<p className="text-muted-foreground text-sm">
															Révoqué le
														</p>
														<p>
															{format(
																new Date(token.revokedAt),
																'dd MMMM yyyy',
																{ locale: fr },
															)}
														</p>
													</div>
												</div>
											)}
										</div>
									</div>

									{/* URL Section */}
									<div className="bg-muted/30 mt-6 rounded-lg border p-4">
										<p className="text-muted-foreground mb-2 text-sm">
											URL du QR Code
										</p>
										<div className="flex items-center gap-2">
											<code className="flex-1 truncate text-sm">{qrUrl}</code>
											<Button
												variant="outline"
												size="sm"
												onClick={() => copyToClipboard(qrUrl, 'URL')}
											>
												<Copy className="h-3 w-3" />
											</Button>
											<Button variant="outline" size="sm" asChild>
												<a
													href={qrUrl}
													target="_blank"
													rel="noopener noreferrer"
												>
													<ExternalLink className="h-3 w-3" />
												</a>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Timeline */}
							<Card>
								<CardHeader>
									<CardTitle>Historique</CardTitle>
								</CardHeader>
								<CardContent>
									{tokenEvents.length > 0 ||
									token.activatedAt ||
									token.createdAt ? (
										<div className="space-y-4">
											{tokenEvents.map(event => (
												<div
													key={event.id}
													className="border-primary/20 flex items-start gap-3 border-l-2 pb-4 pl-4"
												>
													<div
														className={`rounded-full p-1.5 ${
															event.type === 'scan'
																? 'bg-green-100'
																: event.type === 'contact'
																	? 'bg-orange-100'
																	: event.type === 'activation'
																		? 'bg-blue-100'
																		: event.type === 'revocation'
																			? 'bg-red-100'
																			: 'bg-gray-100'
														}`}
													>
														<CheckCircle
															className={`h-3 w-3 ${
																event.type === 'scan'
																	? 'text-green-600'
																	: event.type === 'contact'
																		? 'text-orange-600'
																		: event.type === 'activation'
																			? 'text-blue-600'
																			: event.type === 'revocation'
																				? 'text-red-600'
																				: 'text-gray-600'
															}`}
														/>
													</div>
													<div className="flex-1">
														<p className="text-sm font-medium capitalize">
															{event.type === 'scan'
																? 'Scanné'
																: event.type === 'contact'
																	? 'Contact établi'
																	: event.type === 'activation'
																		? "Activé par l'utilisateur"
																		: event.type === 'generation'
																			? 'Généré'
																			: event.type === 'revocation'
																				? 'Révoqué'
																				: event.type}
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
												!tokenEvents.some(e => e.type === 'activation') && (
													<div className="border-primary/20 flex items-start gap-3 border-l-2 pb-4 pl-4">
														<div className="rounded-full bg-green-100 p-1.5">
															<CheckCircle className="h-3 w-3 text-green-600" />
														</div>
														<div>
															<p className="text-sm font-medium">
																Activé par l&apos;utilisateur
															</p>
															<p className="text-muted-foreground text-xs">
																{format(
																	new Date(token.activatedAt),
																	'dd MMM yyyy',
																	{ locale: fr },
																)}
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
														Généré ({token.batch})
													</p>
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
						</div>

						{/* Right Column - Actions */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Actions</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									{token.status === 'activated' && (
										<>
											<Button
												variant="outline"
												className="w-full justify-start text-orange-600 hover:text-orange-700"
											>
												<Pause className="mr-2 h-4 w-4" />
												Désactiver temporairement
											</Button>
											<Button
												variant="outline"
												className="text-destructive hover:text-destructive w-full justify-start"
												onClick={() => setShowRevokeDialog(true)}
											>
												<Ban className="mr-2 h-4 w-4" />
												Révoquer définitivement
											</Button>
										</>
									)}
									{token.status === 'generated' && (
										<Button
											variant="outline"
											className="text-destructive hover:text-destructive w-full justify-start"
											onClick={() => setShowRevokeDialog(true)}
										>
											<Ban className="mr-2 h-4 w-4" />
											Marquer comme révoqué
										</Button>
									)}
									{token.status === 'revoked' && (
										<p className="text-muted-foreground py-4 text-center text-sm">
											Ce token a été révoqué et ne peut plus être utilisé.
										</p>
									)}
								</CardContent>
							</Card>

							<Button variant="outline" className="w-full" asChild>
								<Link href="/admin/qr">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Retour aux tokens
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Revoke Confirmation */}
			<AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Révoquer ce token ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible. Le token{' '}
							<strong>{token.token}</strong> ne pourra plus être utilisé.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRevoke}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Révoquer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
