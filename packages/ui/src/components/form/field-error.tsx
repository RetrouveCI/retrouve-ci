interface FieldErrorProps {
	errors?: string[]
}

export function FieldError({ errors }: FieldErrorProps) {
	if (!errors || errors.length === 0) return null

	return <p className="text-destructive text-xs">{errors[0]}</p>
}
