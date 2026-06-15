import { Input } from '@retrouve-ci/ui/components'
import { getInputProps, type FieldMetadata } from '@conform-to/react'
import { InputLabel } from './input-label'
import { FieldError } from './field-error'

interface InputFieldProps {
	field: FieldMetadata<string>
	label: string
	required?: boolean
	type?: 'text' | 'tel' | 'date' | 'email'
	placeholder?: string
	className?: string
}

export function InputField({
	field,
	label,
	required,
	type = 'text',
	placeholder,
	className = 'h-11',
}: InputFieldProps) {
	return (
		<div className="space-y-2">
			<InputLabel htmlFor={field.id} required={required}>
				{label}
			</InputLabel>
			<Input
				{...getInputProps(field, { type })}
				key={field.key}
				placeholder={placeholder}
				className={className}
			/>
			<FieldError errors={field.errors} />
		</div>
	)
}
