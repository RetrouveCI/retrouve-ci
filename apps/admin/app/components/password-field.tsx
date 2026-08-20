import { useState, type ComponentType } from 'react'
import {
	Controller,
	type Control,
	type FieldPath,
	type FieldValues,
} from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Input,
} from '@app/ui/components'
import { cn } from '@app/ui/utils'

interface PasswordFieldProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> {
	control: Control<TFieldValues, unknown, TTransformedValues>
	name: TName
	label: string
	placeholder?: string
	hint?: string
	/** Rendered inside the input, on the left — the auth panel's look. */
	icon?: ComponentType<{ className?: string }>
	inputClassName?: string
	autoComplete?: 'current-password' | 'new-password'
	disabled?: boolean
	autoFocus?: boolean
}

export function PasswordField<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>({
	control,
	name,
	label,
	placeholder,
	hint,
	icon: Icon,
	inputClassName,
	autoComplete = 'new-password',
	disabled,
	autoFocus,
}: PasswordFieldProps<TFieldValues, TName, TTransformedValues>) {
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
						{Icon && (
							<Icon className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						)}
						<Input
							{...field}
							id={field.name}
							type={isVisible ? 'text' : 'password'}
							placeholder={placeholder}
							className={cn('pr-10', Icon && 'pl-9', inputClassName)}
							aria-invalid={fieldState.invalid}
							disabled={disabled}
							autoComplete={autoComplete}
							autoFocus={autoFocus}
						/>
						<button
							type="button"
							onClick={() => setIsVisible(visible => !visible)}
							className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
							tabIndex={-1}
							aria-label={`${isVisible ? 'Masquer' : 'Afficher'} le champ ${label}`}
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
