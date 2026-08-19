import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'

interface FormRootErrorProps {
	message?: string
	className?: string
}

export function FormRootError({ message, className }: FormRootErrorProps) {
	if (!message) return null

	return (
		<Alert variant="destructive" className={className}>
			<AlertCircle />
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	)
}
