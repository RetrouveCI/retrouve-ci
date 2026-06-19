import { CheckCircle2, XCircle } from 'lucide-react'
import { BentoCard } from '@/shared/components/bento-card'
import { cn } from '@retrouve-ci/ui/utils'

interface Permission {
	label: string
	allowed: boolean
}

interface PermissionsCardProps {
	role: string
}

export function PermissionsCard({ role }: PermissionsCardProps) {
	const isSuperAdmin = role === 'super_admin'

	const permissions: Permission[] = [
		{ label: 'Gérer les utilisateurs', allowed: true },
		{ label: 'Gérer les QR codes', allowed: true },
		{ label: 'Modérer les posts', allowed: true },
		{ label: 'Gérer les événements', allowed: true },
		{ label: 'Gérer les administrateurs', allowed: isSuperAdmin },
		{ label: 'Accès aux paramètres système', allowed: isSuperAdmin },
	]

	return (
		<BentoCard variant="content" className="lg:col-span-2">
			<div className="p-6">
				<h4 className="mb-4 text-lg font-semibold">Permissions</h4>
				<ul className="space-y-2.5">
					{permissions.map(p => (
						<li
							key={p.label}
							className={cn(
								'flex items-center justify-between rounded-lg px-4 py-2.5 text-sm',
								p.allowed ? 'bg-emerald-500/10' : 'bg-muted/50',
							)}
						>
							<span
								className={p.allowed ? 'font-medium' : 'text-muted-foreground'}
							>
								{p.label}
							</span>
							{p.allowed ? (
								<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
							) : (
								<XCircle className="text-muted-foreground h-4 w-4 shrink-0" />
							)}
						</li>
					))}
				</ul>
			</div>
		</BentoCard>
	)
}
