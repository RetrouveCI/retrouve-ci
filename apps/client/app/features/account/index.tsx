import { Button } from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { User, LogIn } from 'lucide-react'
import type { UserLostItem } from '@/shared/types/lost-item'
import type { Sticker } from '@/shared/types/sticker'
import { getServerSession } from '@/shared/auth/auth.server'
import { toUserLostItem } from '@/features/lost-items/mappers/lost-item.mapper'
import { getMyLostItems } from '@/features/account/posts/servers/account-posts.service'
import { toSticker } from '@/features/account/stickers/mappers/sticker.mapper'
import { getMyStickers } from '@/features/account/stickers/servers/stickers.service'
import { ProfileHeader } from './components/profile-header'
import { AccountStats } from './components/account-stats'
import { AccountNav } from './components/account-nav'
import { useAuth } from '@/shared/auth/auth-context'
import type { Route } from './+types/index'

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getServerSession(request)
	if (!session) return { listings: [], stickers: [] }
	const [items, stickerItems] = await Promise.all([
		getMyLostItems(request),
		getMyStickers(request),
	])
	return {
		listings: items.map(toUserLostItem),
		stickers: stickerItems.map(toSticker),
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
						<User className="text-primary-green h-10 w-10" />
					</div>
					<h1 className="mb-3 text-2xl font-bold md:text-3xl">
						Connectez-vous
					</h1>
					<p className="text-muted-foreground mb-8">
						Accédez à votre compte pour gérer vos annonces et vos stickers QR.
					</p>
					<Button
						asChild
						size="lg"
						className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-white"
					>
						<Link to="/auth/login" className="gap-2">
							<LogIn className="h-5 w-5" />
							Se connecter
						</Link>
					</Button>
					<p className="text-muted-foreground mt-4 text-sm">
						Pas encore de compte ?{' '}
						<Link
							to="/auth/register"
							className="text-primary-green font-medium hover:underline"
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
}: {
	listings: UserLostItem[]
	stickers: Sticker[]
}) {
	const { user, logout } = useAuth()

	if (!user) return null

	return (
		<main className="flex-1">
			<ProfileHeader user={user} onLogout={logout} />
			<AccountStats stickers={stickers} listings={listings} />
			<AccountNav stickers={stickers} listings={listings} />
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
		/>
	) : (
		<NotLoggedInView />
	)
}
