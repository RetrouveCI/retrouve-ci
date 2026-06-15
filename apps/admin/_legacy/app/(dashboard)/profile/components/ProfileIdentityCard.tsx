import {
	Badge,
	Avatar,
	AvatarFallback,
	Separator,
} from '@retrouve-ci/ui/components'
import { Phone, Mail, Calendar, User, ShieldCheck } from 'lucide-react'
import { BentoCard } from '@/components/bento-card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ProfileIdentityCardProps {
	name?: string
	email?: string
	phone: string
	role: string
	createdAt: string
	lastLogin: string
}

const getRoleLabel = (role: string) => {
	switch (role) {
		case 'super_admin':
			return 'Super Administrateur'
		case 'admin':
			return 'Administrateur'
		case 'moderator':
			return 'Modérateur'
		default:
			return role
	}
}

export function ProfileIdentityCard({
	name,
	email,
	phone,
	role,
	createdAt,
	lastLogin,
}: ProfileIdentityCardProps) {
	return (
		<BentoCard variant="content" className="lg:col-span-1">
			<div className="flex flex-col items-center gap-4 p-6 text-center">
				<Avatar className="h-20 w-20">
					<AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
						{name?.charAt(0) || 'A'}
					</AvatarFallback>
				</Avatar>
				<div>
					<h3 className="text-xl font-bold">{name || 'Admin User'}</h3>
					<p className="text-muted-foreground mb-2 text-sm">
						{email || 'admin@retrouveci.com'}
					</p>
					<Badge className="gap-1">
						<ShieldCheck className="h-3.5 w-3.5" />
						{getRoleLabel(role)}
					</Badge>
				</div>
				<Separator className="w-full" />
				<div className="w-full space-y-3 text-left text-sm">
					<div className="flex items-center gap-3">
						<Phone className="text-muted-foreground h-4 w-4 shrink-0" />
						<span>{phone}</span>
					</div>
					<div className="flex items-center gap-3">
						<Mail className="text-muted-foreground h-4 w-4 shrink-0" />
						<span className="truncate">{email || 'admin@retrouveci.com'}</span>
					</div>
					<div className="flex items-center gap-3">
						<Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
						<span>
							Depuis {format(new Date(createdAt), 'MMMM yyyy', { locale: fr })}
						</span>
					</div>
					<div className="flex items-center gap-3">
						<User className="text-muted-foreground h-4 w-4 shrink-0" />
						<span className="text-muted-foreground text-xs">
							Dernière connexion :{' '}
							{format(new Date(lastLogin), "d MMM yyyy 'à' HH:mm", {
								locale: fr,
							})}
						</span>
					</div>
				</div>
			</div>
		</BentoCard>
	)
}
