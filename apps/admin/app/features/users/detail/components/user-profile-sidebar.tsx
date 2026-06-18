import { Link } from 'react-router'
import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	CardContent,
} from '@retrouve-ci/ui/components'
import { BentoCard } from '@/shared/components/bento-card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
	Phone,
	Mail,
	Calendar,
	Ban,
	CheckCircle,
	ArrowLeft,
} from 'lucide-react'
import type { User } from '../../users.types'

interface UserProfileSidebarProps {
	user: User
	onToggleBan: () => void
	isBusy: boolean
}

export function UserProfileSidebar({
	user,
	onToggleBan,
	isBusy,
}: UserProfileSidebarProps) {
	return (
		<div className="space-y-4">
			<BentoCard variant="content">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center text-center">
						<Avatar className="ring-primary/10 h-24 w-24 ring-4">
							<AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
								{user.name.charAt(0)}
							</AvatarFallback>
						</Avatar>
						<h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
						<p className="text-muted-foreground text-xs">ID: {user.id}</p>
						<Badge
							className={`mt-3 ${
								user.status === 'active'
									? 'bg-green-50 text-green-700 hover:bg-green-50'
									: 'bg-gray-50 text-gray-700 hover:bg-gray-50'
							}`}
						>
							{user.status === 'active' ? 'Actif' : 'Inactif'}
						</Badge>
					</div>

					<div className="mt-6 space-y-3">
						{user.phone && (
							<div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
								<Phone className="text-primary h-4 w-4 shrink-0" />
								<span className="font-mono font-medium">{user.phone}</span>
							</div>
						)}
						<div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
							<Mail className="text-primary h-4 w-4 shrink-0" />
							<span className="font-medium break-all">{user.email}</span>
						</div>
						<div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
							<Calendar className="text-primary h-4 w-4 shrink-0" />
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

			<Button
				variant={user.status === 'active' ? 'destructive' : 'default'}
				className="w-full"
				onClick={onToggleBan}
				disabled={isBusy}
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
	)
}
