import { Input, Label } from '@retrouve-ci/ui/components'
import { useState } from 'react'
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
}: PasswordInputProps) {
	const [show, setShow] = useState(false)
	return (
		<div className="space-y-2">
			<Label htmlFor={id} className="text-sm font-medium">
				{label}
			</Label>
			<div className="relative">
				<Input
					id={id}
					name={name}
					type={show ? 'text' : 'password'}
					placeholder={placeholder ?? '••••••••'}
					value={value}
					onChange={e => onChange(e.target.value)}
					className="border-border bg-background focus:border-primary-green focus:ring-primary-green/20 h-12 rounded-xl border-2 pr-11 transition-all focus:ring-2"
					autoComplete={id === 'password' ? 'current-password' : 'new-password'}
					disabled={disabled}
					autoFocus={autoFocus}
				/>
				<button
					type="button"
					onClick={() => setShow(v => !v)}
					className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3.5 -translate-y-1/2 p-1 transition-colors"
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
