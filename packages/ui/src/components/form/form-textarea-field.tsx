import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Textarea } from '../ui/textarea'
import { Field, FieldError, FieldLabel } from '../ui/field'

interface FormTextareaFieldProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> {
	control: Control<TFieldValues, unknown, TTransformedValues>
	name: TName
	label: string
	required?: boolean
	placeholder?: string
	className?: string
}

export function FormTextareaField<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>({
	control,
	name,
	label,
	required,
	placeholder,
	className = 'min-h-20 resize-none',
}: FormTextareaFieldProps<TFieldValues, TName, TTransformedValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={field.name}>
						{label} {required && <span className="text-destructive">*</span>}
					</FieldLabel>
					<Textarea
						{...field}
						value={field.value ?? ''}
						id={field.name}
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
