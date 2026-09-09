import { AuthNote } from './auth-note'
import { IvorianFlag } from './ivorian-flag'

/**
 * Only where a number is written for the first time. Sign-in and account
 * recovery read what is already stored, so they must not advertise a rule they
 * deliberately do not enforce (§2.2, flow E, invariant 1).
 */
export function PhoneRuleCard() {
	return (
		<AuthNote
			icon={
				<IvorianFlag className="h-3.5 w-5 rounded-[2px] ring-1 ring-black/10" />
			}
		>
			<p className="text-foreground mb-0.5 text-sm font-semibold">
				Numéros ivoiriens uniquement
			</p>
			<p>
				Dix chiffres commençant par{' '}
				<b className="text-foreground font-semibold">01</b>,{' '}
				<b className="text-foreground font-semibold">05</b> ou{' '}
				<b className="text-foreground font-semibold">07</b>. Ce sont les seuls
				que le SMS peut atteindre.
			</p>
		</AuthNote>
	)
}
