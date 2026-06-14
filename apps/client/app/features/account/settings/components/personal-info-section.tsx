import { Button, Label } from '@retrouve-ci/ui/components'
import { User, Smartphone, Mail, Calendar, Check } from 'lucide-react'

interface UserInfo {
	name?: string
	phone?: string
	email?: string
	createdAt?: string
}

export function PersonalInfoSection({ user }: { user: UserInfo | null }) {
	return (
		<div className="bg-background overflow-hidden rounded-2xl border">
			<div className="bg-muted/30 border-b p-5">
				<h2 className="flex items-center gap-2 font-semibold">
					<User className="text-primary-green h-4 w-4" />
					Informations personnelles
				</h2>
			</div>
			<div className="space-y-4 p-5">
				<div className="flex items-center justify-between py-3">
					<div className="flex items-center gap-3">
						<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
							<User className="text-muted-foreground h-5 w-5" />
						</div>
						<div>
							<Label className="text-sm font-medium">Nom complet</Label>
							<p className="text-muted-foreground text-sm">{user?.name}</p>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between border-t py-3">
					<div className="flex items-center gap-3">
						<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
							<Smartphone className="text-muted-foreground h-5 w-5" />
						</div>
						<div>
							<Label className="text-sm font-medium">Téléphone</Label>
							<p className="text-muted-foreground text-sm">
								+225 {user?.phone}
							</p>
						</div>
					</div>
					<span className="bg-primary-green/10 text-primary-green flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
						<Check className="h-3 w-3" />
						Vérifié
					</span>
				</div>
				<div className="flex items-center justify-between border-t py-3">
					<div className="flex items-center gap-3">
						<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
							<Mail className="text-muted-foreground h-5 w-5" />
						</div>
						<div>
							<Label className="text-sm font-medium">Email</Label>
							<p className="text-muted-foreground text-sm">
								{user?.email || 'Non renseigné'}
							</p>
						</div>
					</div>
					<Button variant="ghost" size="sm" className="rounded-lg text-xs">
						Modifier
					</Button>
				</div>
				<div className="flex items-center justify-between border-t py-3">
					<div className="flex items-center gap-3">
						<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
							<Calendar className="text-muted-foreground h-5 w-5" />
						</div>
						<div>
							<Label className="text-sm font-medium">Membre depuis</Label>
							<p className="text-muted-foreground text-sm">{user?.createdAt}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
