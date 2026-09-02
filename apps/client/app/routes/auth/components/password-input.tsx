import { Input, Label } from '@app/ui/components'
import { useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
	id: string
	name?: string
	label: string
	value: string
	onChange: (v: string) => void
	placeholder?: string
	hint?: string
	disabled?: boolean
	autoFocus?: boolean
	/** Sits on the label row, opposite the label — the mockup's "Oublié ?". */
	action?: ReactNode
}

export function PasswordInput({
	id,
	name,
	label,
	value,
	onChange,
	placeholder,
	hint,
	disabled,
	autoFocus,
	action,
}: PasswordInputProps) {
	const [show, setShow] = useState(false)
	return (
		<div className="space-y-2">
			<div className="flex items-baseline justify-between">
				<Label htmlFor={id} className="text-sm font-semibold">
					{label}
				</Label>
				{action}
			</div>
			<div className="relative">
				<Input
					id={id}
					name={name}
					type={show ? 'text' : 'password'}
					placeholder={placeholder ?? '••••••••'}
					value={value}
					onChange={e => onChange(e.target.value)}
					className="border-border bg-background focus:border-primary-green focus:ring-primary-green/15 h-control rounded-xl border-[1.5px] pr-11 transition-all focus:ring-[3px]"
					autoComplete={id === 'password' ? 'current-password' : 'new-password'}
					disabled={disabled}
					autoFocus={autoFocus}
				/>
				<button
					type="button"
					onClick={() => setShow(v => !v)}
					className="touch-target text-muted-foreground hover:text-foreground absolute top-1/2 right-3.5 -translate-y-1/2 p-1 transition-colors"
					aria-label={
						show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
					}
					tabIndex={-1}
				>
					{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				</button>
			</div>
			{hint && <p className="text-muted-foreground text-xs">{hint}</p>}
		</div>
	)
}
