'use client'

import { use } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/admin/topbar'
import { BentoCard } from '@/components/admin/bento-card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Avatar, AvatarFallback } from '@repo/ui/components/ui/avatar'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@repo/ui/components/ui/tabs'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@repo/ui/components/ui/table'
import {
	mockUsers,
	mockQRTokens,
	mockPosts,
	mockEvents,
	mockStickerOrders,
} from '@/lib/mock-data'
import {
	ArrowLeft,
	Edit,
	Ban,
	Phone,
	Mail,
	Calendar,
	QrCode,
	FileText,
	CheckCircle,
	Scan,
	AlertTriangle,
	Package,
	MapPin,
	Truck,
	Clock,
	User,
	ShoppingBag,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

const orderStatusConfig = {
	pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
	processing: {
		label: 'En traitement',
		className: 'bg-blue-100 text-blue-700',
	},
	shipped: { label: 'Expédiée', className: 'bg-purple-100 text-purple-700' },
	delivered: { label: 'Livrée', className: 'bg-green-100 text-green-700' },
	cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
}

export default function UserDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)

	const user = mockUsers.find(u => u.id === parseInt(id))
	const userQRTokens = mockQRTokens.filter(t => t.userId === parseInt(id))
	const userPosts = mockPosts.filter(p => p.authorId === parseInt(id))
	const userOrders = mockStickerOrders.filter(o => o.userId === parseInt(id))
	const userEvents = mockEvents.filter(
		e =>
			e.user === user?.name ||
			(user && e.user.includes(user.name.split(' ')[0])),
	)

	if (!user) {
		return (
			<>
				<TopBar title="Utilisateur non trouvé" />
				<div className="pt-16">
					<div className="p-4 lg:p-6">
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<AlertTriangle className="text-muted-foreground h-12 w-12" />
							<h2 className="mt-4 text-xl font-semibold">
								Utilisateur non trouvé
							</h2>
							<p className="text-muted-foreground mt-2">
								L&apos;utilisateur demandé n&apos;existe pas ou a été supprimé.
							</p>
							<Button asChild className="mt-4">
								<Link href="/admin/users">Retour aux utilisateurs</Link>
							</Button>
						</div>
					</div>
				</div>
			</>
		)
	}

	const handleDeactivate = () => {
		toast.success(
			user.status === 'active'
				? `Compte de ${user.name} désactivé`
				: `Compte de ${user.name} activé`,
		)
	}

	const totalStickersOrdered = userOrders.reduce(
		(sum, o) => sum + o.quantity,
		0,
	)
	const deliveredOrders = userOrders.filter(
		o => o.status === 'delivered',
	).length

	return (
		<>
			<TopBar title={user.name} />
			<div className="pt-16">
				<div className="space-y-6 p-4 lg:p-6">
					{/* Stats Row */}
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<BentoCard
							title="QR Codes"
							value={userQRTokens.length}
							icon={QrCode}
							iconColor="text-blue-600"
							iconBgColor="bg-blue-100"
						/>
						<BentoCard
							title="Posts"
							value={userPosts.length}
							icon={FileText}
							iconColor="text-orange-600"
							iconBgColor="bg-orange-100"
						/>
						<BentoCard
							title="Commandes"
							value={userOrders.length}
							icon={Package}
							iconColor="text-purple-600"
							iconBgColor="bg-purple-100"
						/>
						<BentoCard
							title="Stickers commandés"
							value={totalStickersOrdered}
							icon={ShoppingBag}
							iconColor="text-green-600"
							iconBgColor="bg-green-100"
						/>
					</div>

					{/* Main Content */}
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Left Column - Profile */}
						<div className="space-y-6">
							<BentoCard variant="content">
								<CardContent className="pt-6">
									<div className="flex flex-col items-center text-center">
										<Avatar className="ring-primary/10 h-24 w-24 ring-4">
											<AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
												{user.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<h2 className="mt-4 text-xl font-bold">{user.name}</h2>
										<p className="text-muted-foreground text-sm">
											ID: #{user.id}
										</p>
										<Badge
											className={`mt-3 ${
												user.status === 'active'
													? 'bg-green-100 text-green-700 hover:bg-green-100'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-100'
											}`}
										>
											{user.status === 'active' ? 'Actif' : 'Inactif'}
										</Badge>
									</div>

									<div className="mt-6 space-y-3">
										<div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
											<Phone className="text-primary h-4 w-4" />
											<span className="font-medium">{user.phone}</span>
										</div>
										<div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
											<Mail className="text-primary h-4 w-4" />
											<span className="font-medium">{user.email}</span>
										</div>
										<div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
											<Calendar className="text-primary h-4 w-4" />
											<span>
												Inscrit le{' '}
												<span className="font-medium">
													{format(new Date(user.createdAt), 'dd MMMM yyyy', {
														locale: fr,
													})}
												</span>
											</span>
										</div>
									</div>
								</CardContent>
							</BentoCard>

							{/* Actions */}
							<BentoCard variant="content">
								<CardHeader className="pb-3">
									<CardTitle className="text-base font-semibold">
										Actions rapides
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<Button variant="outline" className="w-full justify-start">
										<Edit className="mr-2 h-4 w-4" />
										Modifier le profil
									</Button>
									<Button
										variant="outline"
										className={`w-full justify-start ${
											user.status === 'active'
												? 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
												: 'text-green-600 hover:bg-green-50 hover:text-green-700'
										}`}
										onClick={handleDeactivate}
									>
										<Ban className="mr-2 h-4 w-4" />
										{user.status === 'active'
											? 'Désactiver le compte'
											: 'Activer le compte'}
									</Button>
									<Button
										variant="outline"
										className="w-full justify-start"
										asChild
									>
										<Link href="/admin/users">
											<ArrowLeft className="mr-2 h-4 w-4" />
											Retour aux utilisateurs
										</Link>
									</Button>
								</CardContent>
							</BentoCard>
						</div>

						{/* Right Column - Tabs */}
						<div className="lg:col-span-2">
							<Tabs defaultValue="qr" className="w-full">
								<TabsList className="bg-muted/50 w-full justify-start p-1">
									<TabsTrigger
										value="qr"
										className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
									>
										<QrCode className="h-4 w-4" />
										QR Tokens ({userQRTokens.length})
									</TabsTrigger>
									<TabsTrigger
										value="orders"
										className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
									>
										<Package className="h-4 w-4" />
										Commandes ({userOrders.length})
									</TabsTrigger>
									<TabsTrigger
										value="posts"
										className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
									>
										<FileText className="h-4 w-4" />
										Posts ({userPosts.length})
									</TabsTrigger>
									<TabsTrigger
										value="activity"
										className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
									>
										<Scan className="h-4 w-4" />
										Activité
									</TabsTrigger>
								</TabsList>

								{/* QR Tokens Tab */}
								<TabsContent value="qr" className="mt-4">
									<BentoCard variant="table">
										<CardContent className="pt-6">
											{userQRTokens.length > 0 ? (
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Token</TableHead>
															<TableHead>Statut</TableHead>
															<TableHead>Batch</TableHead>
															<TableHead>Date activation</TableHead>
															<TableHead className="text-right">
																Actions
															</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{userQRTokens.map(token => (
															<TableRow
																key={token.token}
																className="hover:bg-muted/50"
															>
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
																		? format(
																				new Date(token.activatedAt),
																				'dd MMM yyyy',
																				{
																					locale: fr,
																				},
																			)
																		: '-'}
																</TableCell>
																<TableCell className="text-right">
																	<Button variant="ghost" size="sm" asChild>
																		<Link href={`/admin/qr/${token.token}`}>
																			Voir
																		</Link>
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
								</TabsContent>

								{/* Orders Tab */}
								<TabsContent value="orders" className="mt-4">
									<BentoCard variant="table">
										<CardContent className="pt-6">
											{userOrders.length > 0 ? (
												<div className="space-y-4">
													{userOrders.map(order => {
														const statusInfo = orderStatusConfig[order.status]
														return (
															<div
																key={order.id}
																className="bg-card rounded-xl border p-4 transition-all hover:shadow-md"
															>
																<div className="flex flex-wrap items-start justify-between gap-4">
																	<div className="space-y-1">
																		<div className="flex items-center gap-2">
																			<span className="font-mono font-bold">
																				{order.id}
																			</span>
																			<Badge
																				className={`${statusInfo.className} hover:${statusInfo.className}`}
																			>
																				{statusInfo.label}
																			</Badge>
																		</div>
																		<div className="text-muted-foreground flex items-center gap-4 text-sm">
																			<span className="flex items-center gap-1">
																				<Package className="h-3.5 w-3.5" />
																				{order.quantity} sticker
																				{order.quantity > 1 ? 's' : ''}
																			</span>
																			<span className="flex items-center gap-1">
																				<Calendar className="h-3.5 w-3.5" />
																				{format(
																					new Date(order.createdAt),
																					'dd MMM yyyy',
																					{ locale: fr },
																				)}
																			</span>
																		</div>
																	</div>
																	<Button variant="outline" size="sm" asChild>
																		<Link href="/admin/orders">
																			Voir détails
																		</Link>
																	</Button>
																</div>

																<div className="mt-4 grid gap-3 sm:grid-cols-2">
																	<div className="bg-muted/50 flex items-start gap-2 rounded-lg p-3">
																		<MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
																		<div className="text-sm">
																			<p className="font-medium">
																				{order.deliveryCity}
																			</p>
																			<p className="text-muted-foreground">
																				{order.deliveryAddress}
																			</p>
																		</div>
																	</div>
																	{order.trackingNumber && (
																		<div className="bg-muted/50 flex items-start gap-2 rounded-lg p-3">
																			<Truck className="text-muted-foreground mt-0.5 h-4 w-4" />
																			<div className="text-sm">
																				<p className="font-medium">Suivi</p>
																				<p className="text-muted-foreground font-mono">
																					{order.trackingNumber}
																				</p>
																			</div>
																		</div>
																	)}
																	{order.deliveryNotes && (
																		<div className="flex items-start gap-2 rounded-lg bg-orange-50 p-3 sm:col-span-2">
																			<Clock className="mt-0.5 h-4 w-4 text-orange-600" />
																			<div className="text-sm">
																				<p className="font-medium text-orange-700">
																					Note de livraison
																				</p>
																				<p className="text-orange-600">
																					{order.deliveryNotes}
																				</p>
																			</div>
																		</div>
																	)}
																</div>
															</div>
														)
													})}
												</div>
											) : (
												<div className="flex flex-col items-center justify-center py-12 text-center">
													<div className="bg-muted rounded-full p-4">
														<Package className="text-muted-foreground h-8 w-8" />
													</div>
													<p className="mt-4 font-medium">Aucune commande</p>
													<p className="text-muted-foreground mt-1 text-sm">
														Cet utilisateur n&apos;a pas encore passé de
														commande de stickers
													</p>
												</div>
											)}
										</CardContent>
									</BentoCard>
								</TabsContent>

								{/* Posts Tab */}
								<TabsContent value="posts" className="mt-4">
									<BentoCard variant="table">
										<CardContent className="pt-6">
											{userPosts.length > 0 ? (
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Titre</TableHead>
															<TableHead>Type</TableHead>
															<TableHead>Statut</TableHead>
															<TableHead>Date</TableHead>
															<TableHead className="text-right">
																Actions
															</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{userPosts.map(post => (
															<TableRow
																key={post.id}
																className="hover:bg-muted/50"
															>
																<TableCell className="font-medium">
																	{post.title}
																</TableCell>
																<TableCell>
																	<Badge
																		className={
																			post.type === 'lost'
																				? 'bg-red-100 text-red-700 hover:bg-red-100'
																				: 'bg-green-100 text-green-700 hover:bg-green-100'
																		}
																	>
																		{post.type === 'lost'
																			? 'Perdu'
																			: 'Retrouvé'}
																	</Badge>
																</TableCell>
																<TableCell>
																	<Badge
																		className={
																			post.status === 'published'
																				? 'bg-green-100 text-green-700 hover:bg-green-100'
																				: post.status === 'pending'
																					? 'bg-orange-100 text-orange-700 hover:bg-orange-100'
																					: 'bg-gray-100 text-gray-700 hover:bg-gray-100'
																		}
																	>
																		{post.status === 'published'
																			? 'Publié'
																			: post.status === 'pending'
																				? 'En attente'
																				: 'Masqué'}
																	</Badge>
																</TableCell>
																<TableCell>
																	{format(
																		new Date(post.createdAt),
																		'dd MMM yyyy',
																		{
																			locale: fr,
																		},
																	)}
																</TableCell>
																<TableCell className="text-right">
																	<Button variant="ghost" size="sm" asChild>
																		<Link href={`/admin/posts/${post.id}`}>
																			Voir
																		</Link>
																	</Button>
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											) : (
												<div className="flex flex-col items-center justify-center py-12 text-center">
													<div className="bg-muted rounded-full p-4">
														<FileText className="text-muted-foreground h-8 w-8" />
													</div>
													<p className="mt-4 font-medium">Aucun post</p>
													<p className="text-muted-foreground mt-1 text-sm">
														Cet utilisateur n&apos;a pas encore créé de posts
													</p>
												</div>
											)}
										</CardContent>
									</BentoCard>
								</TabsContent>

								{/* Activity Tab */}
								<TabsContent value="activity" className="mt-4">
									<BentoCard variant="table">
										<CardContent className="pt-6">
											{userEvents.length > 0 ? (
												<div className="space-y-3">
													{userEvents.map(event => (
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
																	<span className="capitalize">
																		{event.type}
																	</span>
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
																		{ locale: fr },
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
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
