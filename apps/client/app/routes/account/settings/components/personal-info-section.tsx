import type { UserProfile } from '../mappers/profile.mapper'
import { ChangePasswordDialog } from './change-password-dialog'
import { EditNameDialog } from './edit-name-dialog'
import { EditPhoneDialog } from './edit-phone-dialog'
import { EditZoneDialog } from './edit-zone-dialog'
import { SettingsRow } from './settings-row'

/**
 * The four dialogs the artboard folds into one list. The password left
 * « Sécurité », which held nothing else, so that section is gone.
 */
export function PersonalInfoSection({ user }: { user: UserProfile }) {
	return (
		<section className="space-y-2">
			<h2 className="text-[15px] font-bold tracking-tight">Vos informations</h2>

			<div className="bg-background rounded-2xl border px-3">
				<EditNameDialog
					currentName={user.name}
					trigger={<SettingsRow label="Nom" value={user.name} />}
				/>
				<EditPhoneDialog
					trigger={
						<SettingsRow
							label="Téléphone"
							value={user.phone ?? 'Non renseigné'}
						/>
					}
				/>
				<EditZoneDialog
					currentCity={user.city}
					currentCommune={user.commune}
					trigger={
						<SettingsRow
							label="Ville et commune"
							value={user.zone ?? 'Non renseignée'}
						/>
					}
				/>
				<ChangePasswordDialog
					trigger={<SettingsRow label="Mot de passe" last />}
				/>
			</div>

			<p className="text-muted-foreground px-1 text-xs">
				Membre depuis {user.memberSince}.
			</p>
		</section>
	)
}
