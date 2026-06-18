import { Label } from '@retrouve-ci/ui/components'
import { User, Smartphone, MapPin, Calendar, Check } from 'lucide-react'
import type { UserProfile } from '../mappers/profile.mapper'
import { EditNameDialog } from './edit-name-dialog'
import { EditPhoneDialog } from './edit-phone-dialog'
import { EditZoneDialog } from './edit-zone-dialog'

export function PersonalInfoSection({ user }: { user: UserProfile }) {
	return (
		<div className="bg-background overflow-hidden rounded-2xl border">
			<div className="bg-muted/30 border-b p-5">
				<h2 className="flex items-center gap-2 font-semibold">
					<User className="text-primary-green h-4 w-4" />
					Informations personnelles
				</h2>
			</div>
			<div className="px-5">
				<div className="flex items-center justify-between gap-3 py-4">
					<div className="flex min-w-0 items-center gap-3">
						<div className="bg-primary-green/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
							<User className="text-primary-green h-5 w-5" />
						</div>
						<div className="min-w-0">
							<Label className="text-sm font-medium">Nom et prénoms</Label>
							<p className="text-muted-foreground truncate text-sm">
								{user.name}
							</p>
						</div>
					</div>
					<EditNameDialog currentName={user.name} />
				</div>

				<div className="flex items-center justify-between gap-3 border-t py-4">
					<div className="flex min-w-0 items-center gap-3">
						<div className="bg-primary-green/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
							<Smartphone className="text-primary-green h-5 w-5" />
						</div>
						<div className="min-w-0">
							<Label className="text-sm font-medium">Numéro de téléphone</Label>
							<p className="text-muted-foreground flex items-center gap-1.5 truncate text-sm">
								{user.phone ?? 'Non renseigné'}
								{user.phone && user.phoneVerified && (
									<span className="text-primary-green inline-flex items-center gap-0.5 text-xs font-medium">
										<Check className="h-3 w-3" />
										Vérifié
									</span>
								)}
							</p>
						</div>
					</div>
					<EditPhoneDialog />
				</div>

				<div className="flex items-center justify-between gap-3 border-t py-4">
					<div className="flex min-w-0 items-center gap-3">
						<div className="bg-primary-green/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
							<MapPin className="text-primary-green h-5 w-5" />
						</div>
						<div className="min-w-0">
							<Label className="text-sm font-medium">Zone</Label>
							<p className="text-muted-foreground truncate text-sm">
								{user.zone ?? 'Non renseignée'}
							</p>
						</div>
					</div>
					<EditZoneDialog
						currentCity={user.city}
						currentCommune={user.commune}
					/>
				</div>

				<div className="flex items-center justify-between gap-3 border-t py-4">
					<div className="flex min-w-0 items-center gap-3">
						<div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
							<Calendar className="text-muted-foreground h-5 w-5" />
						</div>
						<div className="min-w-0">
							<Label className="text-sm font-medium">Membre depuis</Label>
							<p className="text-muted-foreground truncate text-sm">
								{user.memberSince}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
