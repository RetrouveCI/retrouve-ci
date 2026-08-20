import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Input } from '../ui/input'
import { Field, FieldError, FieldLabel } from '../ui/field'

interface FormInputFieldProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> {
	control: Control<TFieldValues, unknown, TTransformedValues>
	name: TName
	label: string
	required?: boolean
	type?: 'text' | 'tel' | 'date' | 'email' | 'password' | 'datetime-local'
	placeholder?: string
	className?: string
}

export function FormInputField<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>({
	control,
	name,
	label,
	required,
	type = 'text',
	placeholder,
	className = 'h-11',
}: FormInputFieldProps<TFieldValues, TName, TTransformedValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={field.name}>
						{label} {required && <span className="text-destructive">*</span>}
					</FieldLabel>
					<Input
						{...field}
						value={field.value ?? ''}
						id={field.name}
						type={type}
						placeholder={placeholder}
						className={className}
						aria-invalid={fieldState.invalid}
					/>
					{fieldState.error && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	)
}
