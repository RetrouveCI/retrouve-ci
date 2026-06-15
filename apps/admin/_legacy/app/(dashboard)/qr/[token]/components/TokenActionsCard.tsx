import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { ArrowLeft, Ban, Pause } from 'lucide-react'

interface TokenActionsCardProps {
	status: string
	onRevokeClick: () => void
}

export function TokenActionsCard({
	status,
	onRevokeClick,
}: TokenActionsCardProps) {
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Actions</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{status === 'activated' && (
						<>
							<Button
								variant="outline"
								className="w-full justify-start text-orange-600 hover:text-orange-700"
							>
								<Pause className="mr-2 h-4 w-4" />
								Désactiver temporairement
							</Button>
							<Button
								variant="outline"
								className="text-destructive hover:text-destructive w-full justify-start"
								onClick={onRevokeClick}
							>
								<Ban className="mr-2 h-4 w-4" />
								Révoquer définitivement
							</Button>
						</>
					)}
					{status === 'generated' && (
						<Button
							variant="outline"
							className="text-destructive hover:text-destructive w-full justify-start"
							onClick={onRevokeClick}
						>
							<Ban className="mr-2 h-4 w-4" />
							Marquer comme révoqué
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
				<Link href="/qr">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Retour aux tokens
				</Link>
			</Button>
		</>
	)
}
