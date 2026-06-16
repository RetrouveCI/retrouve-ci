import { useEffect } from 'react'
import { Link, useFetcher, useRevalidator } from 'react-router'
import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	CardContent,
} from '@retrouve-ci/ui/components'
import { TopBar } from '@/shared/components/topbar'
import { BentoCard } from '@/shared/components/bento-card'
import { userLoader } from '../servers/user.loader'
import { usersAction } from '../servers/users.action'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { ArrowLeft, Phone, Mail, Calendar, Ban, CheckCircle } from 'lucide-react'
import type { Route } from './+types/index'

export const loader = userLoader
export const action = usersAction

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
			<TopBar title={user.name} />
			<div className="pt-16">
				<div className="space-y-6 p-4 lg:p-6">
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-4">
							<BentoCard variant="content">
								<CardContent className="pt-6">
									<div className="flex flex-col items-center text-center">
										<Avatar className="ring-primary/10 h-24 w-24 ring-4">
											<AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
												{user.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<h2 className="mt-4 text-xl font-bold">{user.name}</h2>
										<p className="text-muted-foreground text-xs">
											ID: {user.id}
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
										{user.phone && (
											<div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
												<Phone className="text-primary h-4 w-4 shrink-0" />
												<span className="font-mono font-medium">
													{user.phone}
												</span>
											</div>
										)}
										<div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
											<Mail className="text-primary h-4 w-4 shrink-0" />
											<span className="break-all font-medium">
												{user.email}
											</span>
										</div>
										<div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
											<Calendar className="text-primary h-4 w-4 shrink-0" />
											<span>
												Inscrit le{' '}
												<span className="font-medium">
													{format(
														new Date(user.createdAt),
														'dd MMMM yyyy',
														{ locale: fr },
													)}
												</span>
											</span>
										</div>
									</div>
								</CardContent>
							</BentoCard>

							<Button
								variant={user.status === 'active' ? 'destructive' : 'default'}
								className="w-full"
								onClick={handleToggleBan}
								disabled={fetcher.state !== 'idle'}
							>
								{user.status === 'active' ? (
									<>
										<Ban className="mr-2 h-4 w-4" /> Désactiver le compte
									</>
								) : (
									<>
										<CheckCircle className="mr-2 h-4 w-4" /> Activer le compte
									</>
								)}
							</Button>

							<Button variant="outline" className="w-full" asChild>
								<Link to="/users">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Retour aux utilisateurs
								</Link>
							</Button>
						</div>

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
