import { useRef } from 'react'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import { useRevalidator } from 'react-router'
import { UserProfileSidebar } from './components/user-profile-sidebar'
import { userLoader } from './servers/user.loader'
import { usersAction } from '../servers/users.action'
import { toast } from 'sonner'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

export const loader = userLoader
export const action = usersAction

export const handle: RouteHandle = {
	title: data =>
		(data as Route.ComponentProps['loaderData'] | undefined)?.user?.name ??
		'Utilisateur',
	breadcrumb: [{ label: 'Utilisateurs', to: '/users' }],
}

export default function UserDetailPage({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData
	const revalidator = useRevalidator()
	const fetcher = useActionFetcher<typeof usersAction>()
	// The page knows what it asked: the action has no business echoing it back.
	const asked = useRef<'ban' | 'unban'>('ban')

	useSettledSubmission(fetcher.response, result => {
		if (result.success) {
			toast.success(
				asked.current === 'ban' ? 'Compte désactivé' : 'Compte activé',
			)
			revalidator.revalidate()
			return
		}

		if (result.errors?.root?.message) toast.error(result.errors.root.message)
	})

	const handleToggleBan = () => {
		asked.current = user.status === 'active' ? 'ban' : 'unban'
		fetcher.submit(
			{ intent: asked.current, userId: user.id },
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
