import { useState } from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Eye, EyeOff, Lock } from 'lucide-react'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Input,
} from '@app/ui/components'
import type { ResetPasswordInput } from '../reset-password.schema'

interface PasswordFieldProps {
	control: Control<ResetPasswordInput>
	name: 'newPassword' | 'confirmPassword'
	label: string
	placeholder: string
	hint?: string
	disabled?: boolean
	autoFocus?: boolean
}

export function PasswordField({
	control,
	name,
	label,
	placeholder,
	hint,
	disabled,
	autoFocus,
}: PasswordFieldProps) {
	const [isVisible, setIsVisible] = useState(false)

	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field className="gap-2" data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={field.name} className="text-sm font-medium">
						{label}
					</FieldLabel>
					<div className="relative">
						<Lock className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							{...field}
							id={field.name}
							type={isVisible ? 'text' : 'password'}
							placeholder={placeholder}
							className="h-10 rounded-lg pr-10 pl-9"
							aria-invalid={fieldState.invalid}
							disabled={disabled}
							autoComplete="new-password"
							autoFocus={autoFocus}
						/>
						<button
							type="button"
							onClick={() => setIsVisible(visible => !visible)}
							className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
							tabIndex={-1}
							aria-label={
								isVisible
									? 'Masquer le mot de passe'
									: 'Afficher le mot de passe'
							}
						>
							{isVisible ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
					{fieldState.error && <FieldError errors={[fieldState.error]} />}
					{hint && (
						<FieldDescription className="text-xs">{hint}</FieldDescription>
					)}
				</Field>
			)}
		/>
	)
}
