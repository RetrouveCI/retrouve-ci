import { useEffect } from 'react'
import { useFetcher, useRevalidator } from 'react-router'
import { UserProfileSidebar } from './components/user-profile-sidebar'
import { userLoader } from './servers/user.loader'
import { usersAction } from '../servers/users.action'
import { toast } from 'sonner'
import type { RouteHandle } from '@/shared/lib/page-meta'
import type { Route } from './+types/index'

export const loader = userLoader
export const action = usersAction

export const handle: RouteHandle = {
	title: data =>
		(data as Route.ComponentProps['loaderData'] | undefined)?.user?.name ??
		'Utilisateur',
	breadcrumb: [{ label: 'Utilisateurs', to: '/users' }],
}

interface ActionResult {
	ok: boolean
	intent?: string
	error?: string
}

export default function UserDetailPage({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData
	const revalidator = useRevalidator()
	const fetcher = useFetcher<ActionResult>()

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data.ok) {
			toast.success(
				fetcher.data.intent === 'ban' ? 'Compte désactivé' : 'Compte activé',
			)
			revalidator.revalidate()
		} else if (fetcher.data.error) {
			toast.error(fetcher.data.error)
		}
	}, [fetcher.state, fetcher.data, revalidator])

	const handleToggleBan = () => {
		fetcher.submit(
			{ intent: user.status === 'active' ? 'ban' : 'unban', userId: user.id },
			{ method: 'post' },
		)
	}

	return (
		<>
			<div>
				<div className="space-y-6 p-4 lg:p-6">
					<div className="grid gap-6 lg:grid-cols-3">
						<UserProfileSidebar
							user={user}
							onToggleBan={handleToggleBan}
							isBusy={fetcher.state !== 'idle'}
						/>
						<div className="lg:col-span-2">
							<div className="bg-muted/30 rounded-xl border p-6 text-center">
								<p className="text-muted-foreground text-sm">
									L&apos;historique détaillé (QR codes, commandes, posts) sera
									disponible lorsqu&apos;un domaine utilisateurs sera ajouté à
									l&apos;API.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
