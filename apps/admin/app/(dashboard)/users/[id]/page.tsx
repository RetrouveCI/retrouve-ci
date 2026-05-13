'use client'

import { Button } from '@retrouve-ci/ui/components'
import { use } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/admin/topbar'
import { useUser } from '@/application/users/use-users'
import { useQRTokens } from '@/application/qr/use-qr-tokens'
import { usePosts } from '@/application/posts/use-posts'
import { useOrders } from '@/application/orders/use-orders'
import { useEvents } from '@/application/events/use-events'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@retrouve-ci/ui/components'
import { AlertTriangle, QrCode, Package, FileText, Scan } from 'lucide-react'
import { toast } from 'sonner'
import { UserStatsRow } from './components/UserStatsRow'
import { UserProfileCard } from './components/UserProfileCard'
import { UserActionsCard } from './components/UserActionsCard'
import { QrTokensTab } from './components/QrTokensTab'
import { OrdersTab } from './components/OrdersTab'
import { PostsTab } from './components/PostsTab'
import { ActivityTab } from './components/ActivityTab'

export default function UserDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)
	const numericId = parseInt(id)
	const { user, isLoading } = useUser(numericId)
	const { tokens } = useQRTokens()
	const { posts } = usePosts()
	const { orders } = useOrders()
	const { events } = useEvents()

	const userQRTokens = tokens.filter(t => t.userId === numericId)
	const userPosts = posts.filter(p => p.authorId === numericId)
	const userOrders = orders.filter(o => o.userId === numericId)
	const userEvents = events.filter(
		e => e.user === user?.name || (user && e.user.includes(user.name.split(' ')[0])),
	)

	if (isLoading) return null

	if (!user) {
		return (
			<>
				<TopBar title="Utilisateur non trouvé" />
				<div className="pt-16">
					<div className="p-4 lg:p-6">
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<AlertTriangle className="text-muted-foreground h-12 w-12" />
							<h2 className="mt-4 text-xl font-semibold">Utilisateur non trouvé</h2>
							<p className="text-muted-foreground mt-2">
								L&apos;utilisateur demandé n&apos;existe pas ou a été supprimé.
							</p>
							<Button asChild className="mt-4">
								<Link href="/users">Retour aux utilisateurs</Link>
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

	const totalStickersOrdered = userOrders.reduce((sum, o) => sum + o.quantity, 0)

	return (
		<>
			<TopBar title={user.name} />
			<div className="pt-16">
				<div className="space-y-6 p-4 lg:p-6">
					<UserStatsRow
						qrCount={userQRTokens.length}
						postsCount={userPosts.length}
						ordersCount={userOrders.length}
						totalStickers={totalStickersOrdered}
					/>

					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6">
							<UserProfileCard user={user} />
							<UserActionsCard status={user.status} onDeactivate={handleDeactivate} />
						</div>

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

								<TabsContent value="qr" className="mt-4">
									<QrTokensTab tokens={userQRTokens} />
								</TabsContent>
								<TabsContent value="orders" className="mt-4">
									<OrdersTab orders={userOrders} />
								</TabsContent>
								<TabsContent value="posts" className="mt-4">
									<PostsTab posts={userPosts} />
								</TabsContent>
								<TabsContent value="activity" className="mt-4">
									<ActivityTab events={userEvents} />
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
