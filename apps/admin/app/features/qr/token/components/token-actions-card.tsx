import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { ArrowLeft, Ban } from 'lucide-react'

interface TokenActionsCardProps {
	status: string
	onRevokeClick: () => void
	isRevoking?: boolean
}

export function TokenActionsCard({
	status,
	onRevokeClick,
	isRevoking = false,
}: TokenActionsCardProps) {
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Actions</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{status !== 'revoked' && (
						<Button
							variant="outline"
							className="text-destructive hover:text-destructive w-full justify-start"
							onClick={onRevokeClick}
							disabled={isRevoking}
						>
							<Ban className="mr-2 h-4 w-4" />
							{isRevoking ? 'Révocation...' : 'Révoquer définitivement'}
						</Button>
					)}
					{status === 'revoked' && (
						<p className="text-muted-foreground py-4 text-center text-sm">
							Ce token a été révoqué et ne peut plus être utilisé.
						</p>
					)}
				</CardContent>
			</Card>

			<Button variant="outline" className="w-full" asChild>
				<Link to="/qr">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Retour aux tokens
				</Link>
			</Button>
		</>
	)
}
