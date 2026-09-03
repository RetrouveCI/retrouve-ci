import { Button } from '@app/ui/components'
import { Link } from 'react-router'
import { User, LogIn } from 'lucide-react'
import type { UserLostItem } from '@/shared/types/lost-item'
import type { Sticker } from '@/shared/types/sticker'
import type { ActivitySummary as Summary } from '@/shared/types/activity'
import { getServerSession } from '@/shared/helpers/session.server'
import { toUserLostItem } from '@/shared/mappers/lost-item.mapper'
import { getMyLostItems } from '@/routes/account/posts/servers/account-posts.service'
import { toSticker } from '@/routes/account/stickers/mappers/sticker.mapper'
import { getMyStickers } from '@/routes/account/stickers/servers/stickers.service'
import { getMyStickerOrders } from '@/routes/account/orders/servers/orders.service'
import { ProfileHeader } from './components/profile-header'
import { NameReminder } from './components/name-reminder'
import { AccountStats } from './components/account-stats'
import { RecentListings } from './components/recent-listings'
import { AccountNav } from './components/account-nav'
import { ActivitySummary } from './components/activity-summary'
import { getActivitySummary } from './servers/activity.service'
import { useAuth } from '@/context/auth'
import { isPhoneLikeName } from '@/shared/utils/display-name'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: 'Mon compte',
		description: 'Gérez vos annonces, vos informations et vos préférences.',
	})
}

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getServerSession(request)
	if (!session)
		return { listings: [], stickers: [], ordersCount: 0, summary: null }

	const [items, stickerItems, orders, summary] = await Promise.all([
		getMyLostItems(request),
		getMyStickers(request),
		getMyStickerOrders(request),
		getActivitySummary(request),
	])

	return {
		listings: items.map(toUserLostItem),
		stickers: stickerItems.map(toSticker),
		ordersCount: orders.length,
		summary,
	}
}

function NotLoggedInView() {
	return (
		<main className="flex flex-1 items-center justify-center py-16 md:py-24">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="bg-primary-green/5 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
				<div className="bg-accent-orange/5 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
			</div>
			<div className="relative container mx-auto px-4">
				<div className="mx-auto max-w-md text-center">
					<div className="bg-primary-green/10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl">
						<User className="text-primary-green-text h-10 w-10" />
					</div>
					<h1 className="mb-3 text-2xl font-bold md:text-3xl">
						Connectez-vous
					</h1>
					<p className="text-muted-foreground mb-8">
						Accédez à votre compte pour gérer vos annonces.
					</p>
					<Button
						asChild
						size="lg"
						className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-white"
					>
						<Link to="/login" className="gap-2">
							<LogIn className="h-5 w-5" />
							Se connecter
						</Link>
					</Button>
					<p className="text-muted-foreground mt-4 text-sm">
						Pas encore de compte ?{' '}
						<Link
							to="/register"
							className="text-primary-green-text font-medium hover:underline"
						>
							Créer un compte
						</Link>
					</p>
				</div>
			</div>
		</main>
	)
}

function DashboardView({
	listings,
	stickers,
	ordersCount,
	summary,
}: {
	listings: UserLostItem[]
	stickers: Sticker[]
	ordersCount: number
	summary: Summary | null
}) {
	const { user, logout } = useAuth()

	if (!user) return null

	return (
		<main className="flex-1">
			<ProfileHeader user={user} onLogout={logout} />
			{isPhoneLikeName(user.name) && <NameReminder />}
			<ActivitySummary summary={summary} />
			<AccountStats listings={listings} stickers={stickers} />
			<section className="pb-12">
				<div className="container mx-auto px-4">
					<div className="grid gap-6 lg:grid-cols-3">
						<RecentListings listings={listings} className="lg:col-span-2" />
						<AccountNav
							listings={listings}
							stickers={stickers}
							ordersCount={ordersCount}
							className="lg:col-span-1"
						/>
					</div>
				</div>
			</section>
		</main>
	)
}

export default function ComptePage({ loaderData }: Route.ComponentProps) {
	const { isAuthenticated, isLoading } = useAuth()

	if (isLoading) {
		return (
			<main className="flex flex-1 items-center justify-center">
				<div className="border-primary-green h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
			</main>
		)
	}

	return isAuthenticated ? (
		<DashboardView
			listings={loaderData.listings}
			stickers={loaderData.stickers}
			ordersCount={loaderData.ordersCount}
			summary={loaderData.summary}
		/>
	) : (
		<NotLoggedInView />
	)
}
