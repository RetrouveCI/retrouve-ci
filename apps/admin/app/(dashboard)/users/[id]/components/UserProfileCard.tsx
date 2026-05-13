import { Badge, CardContent, Avatar, AvatarFallback } from '@retrouve-ci/ui/components'
import { Phone, Mail, Calendar } from 'lucide-react'
import { BentoCard } from '@/components/admin/bento-card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface User {
	id: number
	name: string
	phone: string
	email: string
	status: string
	createdAt: string
}

export function UserProfileCard({ user }: { user: User }) {
	return (
		<BentoCard variant="content">
			<CardContent className="pt-6">
				<div className="flex flex-col items-center text-center">
					<Avatar className="ring-primary/10 h-24 w-24 ring-4">
						<AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
							{user.name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<h2 className="mt-4 text-xl font-bold">{user.name}</h2>
					<p className="text-muted-foreground text-sm">ID: #{user.id}</p>
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
								{format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })}
							</span>
						</span>
					</div>
				</div>
			</CardContent>
		</BentoCard>
	)
}
