import { Textarea } from '@retrouve-ci/ui/components'
import { getTextareaProps, type FieldMetadata } from '@conform-to/react'
import { InputLabel } from './input-label'
import { FieldError } from './field-error'

interface TextareaFieldProps {
	field: FieldMetadata<string>
	label: string
	required?: boolean
	placeholder?: string
	className?: string
}

export function TextareaField({
	field,
	label,
	required,
	placeholder,
	className = 'min-h-20 resize-none',
}: TextareaFieldProps) {
	return (
		<div className="space-y-2">
			<InputLabel htmlFor={field.id} required={required}>
				{label}
			</InputLabel>
			<Textarea
				{...getTextareaProps(field)}
				key={field.key}
				placeholder={placeholder}
				className={className}
			/>
			<FieldError errors={field.errors} />
		</div>
	)
}
