import {
	Avatar,
	AvatarFallback,
	Badge,
	Separator,
} from '@retrouve-ci/ui/components'
import { Mail, Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import { BentoCard } from '@/shared/components/bento-card'

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType }> =
	{
		super_admin: { label: 'Super Administrateur', icon: ShieldCheck },
		admin: { label: 'Administrateur', icon: Shield },
		moderator: { label: 'Modérateur', icon: ShieldAlert },
	}

interface ProfileIdentityCardProps {
	name: string
	email: string
	role: string
}

export function ProfileIdentityCard({
	name,
	email,
	role,
}: ProfileIdentityCardProps) {
	const roleConfig = ROLE_CONFIG[role] ?? { label: role, icon: Shield }
	const RoleIcon = roleConfig.icon

	return (
		<BentoCard variant="content" className="lg:col-span-1">
			<div className="flex flex-col items-center gap-4 p-6 text-center">
				<Avatar className="h-20 w-20">
					<AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
						{name.charAt(0)}
					</AvatarFallback>
				</Avatar>
				<div className="space-y-2">
					<h3 className="text-lg font-semibold">{name}</h3>
					<Badge variant="secondary" className="gap-1">
						<RoleIcon className="h-3.5 w-3.5" />
						{roleConfig.label}
					</Badge>
				</div>
				<Separator className="w-full" />
				<div className="w-full space-y-3 text-left text-sm">
					<div className="flex items-center gap-3">
						<Mail className="text-muted-foreground h-4 w-4 shrink-0" />
						<span className="truncate">{email}</span>
					</div>
				</div>
			</div>
		</BentoCard>
	)
}
