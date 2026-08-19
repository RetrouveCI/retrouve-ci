import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

interface FormRootErrorProps {
	message?: string
	/**
	 * Optional heading above the message, so a form can name what failed
	 * ("Erreur lors de la connexion") rather than showing the message alone.
	 */
	title?: string
	className?: string
}

export function FormRootError({
	message,
	title,
	className,
}: FormRootErrorProps) {
	if (!message) return null

	return (
		<Alert variant="destructive" className={className}>
			<AlertCircle />
			{title && <AlertTitle>{title}</AlertTitle>}
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	)
}
