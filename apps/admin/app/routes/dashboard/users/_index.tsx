import { useRef } from 'react'
import { Button } from '@app/ui/components'
import { Download } from 'lucide-react'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import { useRevalidator } from 'react-router'
import { BentoCard } from '@/components/bento-card'
import { DensityToggle } from '@/components/density-toggle'
import { ListToolbar } from '@/components/list-toolbar'
import { UsersTable } from './components/users-table'
import { usersLoader } from './servers/users.loader'
import { usersAction } from './servers/users.action'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { User } from './types/users.types'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

export const loader = usersLoader
export const action = usersAction

export const handle: RouteHandle = { title: 'Utilisateurs' }

export default function UsersPage({ loaderData }: Route.ComponentProps) {
	const { users, total, page, pageSize } = loaderData
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

	const handleToggleBan = (user: User) => {
		asked.current = user.status === 'active' ? 'ban' : 'unban'
		fetcher.submit(
			{ intent: asked.current, userId: user.id },
			{ method: 'post' },
		)
	}

	// The page on screen, and said so: the list is paged on the server now.
	const handleExportCSV = () => {
		const headers = [
			'ID',
			'Nom',
			'Email',
			'Téléphone',
			'Statut',
			"Date d'inscription",
		]
		const rows = users.map(u => [
			u.id,
			u.name,
			u.email,
			u.phone ?? '',
			u.status === 'active' ? 'Actif' : 'Inactif',
			format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: fr }),
		])
		const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'utilisateurs.csv'
		a.click()
		URL.revokeObjectURL(url)
		toast.success('Export CSV téléchargé')
	}

	return (
		<>
			<div>
				<div className="space-y-4 p-4 lg:p-6">
					<BentoCard variant="table">
						<ListToolbar searchPlaceholder="Nom, ou numéro de téléphone…">
							<DensityToggle />
							<Button variant="outline" size="sm" onClick={handleExportCSV}>
								<Download className="mr-2 h-4 w-4" /> Exporter la page
							</Button>
						</ListToolbar>
						<div className="p-4">
							<UsersTable
								data={users}
								pagination={{ page, pageSize, total }}
								onToggleBan={handleToggleBan}
								isBusy={fetcher.state !== 'idle'}
							/>
						</div>
					</BentoCard>
				</div>
			</div>
		</>
	)
}
