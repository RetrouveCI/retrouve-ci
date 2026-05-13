import { Check, AlertCircle, Shield } from 'lucide-react'
import { BentoCard } from '@/components/admin/bento-card'

interface Permission {
	label: string
	allowed: boolean
}

export function PermissionsCard({ permissions }: { permissions: Permission[] }) {
	return (
		<BentoCard variant="content" className="lg:col-span-2">
			<div className="p-6">
				<div className="mb-4 flex items-center gap-2">
					<Shield className="text-primary h-5 w-5" />
					<h4 className="text-lg font-semibold">Permissions</h4>
				</div>
				<p className="text-muted-foreground mb-5 text-sm">
					Les actions que vous pouvez effectuer sur la plateforme.
				</p>
				<div className="grid gap-3 sm:grid-cols-2">
					{permissions.map(permission => (
						<div
							key={permission.label}
							className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${
								permission.allowed ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
							}`}
						>
							{permission.allowed ? (
								<div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
									<Check className="text-primary h-3.5 w-3.5" />
								</div>
							) : (
								<div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
									<AlertCircle className="text-muted-foreground h-3.5 w-3.5" />
								</div>
							)}
							<span
								className={`text-sm ${permission.allowed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
							>
								{permission.label}
							</span>
						</div>
					))}
				</div>
			</div>
		</BentoCard>
	)
}
