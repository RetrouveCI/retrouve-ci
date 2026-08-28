import { Check, Circle } from 'lucide-react'
import { PASSWORD_MIN_LENGTH } from '@app/contracts/shared'
import { cn } from '@app/ui/utils'

/**
 * The three halves of `passwordSchema`, shown as they are met. It replaces the
 * single `PASSWORD_HINT` line: the rule is the same, but someone who fails it
 * can see which part is missing instead of re-reading the whole sentence.
 */
const RULES = [
	{
		label: `Au moins ${PASSWORD_MIN_LENGTH} caractères`,
		met: (value: string) => value.length >= PASSWORD_MIN_LENGTH,
	},
	{
		label: 'Une majuscule et une minuscule',
		met: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value),
	},
	{ label: 'Un chiffre', met: (value: string) => /[0-9]/.test(value) },
]

export function PasswordChecklist({ value }: { value: string }) {
	return (
		<ul className="bg-muted/40 flex flex-col gap-2.5 rounded-xl border p-3.5">
			{RULES.map(rule => {
				const met = rule.met(value)

				return (
					<li key={rule.label} className="flex items-center gap-2.5">
						{met ? (
							<Check className="text-primary-green h-4 w-4 shrink-0" />
						) : (
							<Circle className="text-muted-foreground/50 h-4 w-4 shrink-0" />
						)}
						<span
							className={cn(
								'text-xs',
								met ? 'text-foreground' : 'text-muted-foreground',
							)}
						>
							{rule.label}
						</span>
						<span className="sr-only">{met ? '(rempli)' : '(à remplir)'}</span>
					</li>
				)
			})}
		</ul>
	)
}
