import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@retrouve-ci/ui/components'
import { Check, EyeOff, Eye, Trash2 } from 'lucide-react'

interface ModerationCardProps {
	status: 'published' | 'pending' | 'hidden'
	onApprove: () => void
	onHide: () => void
	onDelete: () => void
}

export function ModerationCard({ status, onApprove, onHide, onDelete }: ModerationCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Modération</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<p className="text-muted-foreground mb-2 text-sm">Statut actuel</p>
					<Badge
						className={
							status === 'published'
								? 'bg-green-100 text-green-700 hover:bg-green-100'
								: status === 'pending'
									? 'bg-orange-100 text-orange-700 hover:bg-orange-100'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-100'
						}
					>
						{status === 'published' ? 'Publié' : status === 'pending' ? 'En attente' : 'Masqué'}
					</Badge>
				</div>

				<div className="space-y-2">
					{status === 'pending' && (
						<Button className="w-full" onClick={onApprove}>
							<Check className="mr-2 h-4 w-4" />
							Approuver
						</Button>
					)}
					{status !== 'hidden' && (
						<Button variant="outline" className="w-full" onClick={onHide}>
							<EyeOff className="mr-2 h-4 w-4" />
							Masquer
						</Button>
					)}
					{status === 'hidden' && (
						<Button variant="outline" className="w-full" onClick={onApprove}>
							<Eye className="mr-2 h-4 w-4" />
							Afficher
						</Button>
					)}
					<Button
						variant="outline"
						className="text-destructive hover:text-destructive w-full"
						onClick={onDelete}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Supprimer
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
