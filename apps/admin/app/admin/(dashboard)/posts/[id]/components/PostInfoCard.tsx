import { Card, CardContent, CardHeader, CardTitle } from '@retrouve-ci/ui/components'
import { Eye, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface PostInfoCardProps {
	createdAt: string
	updatedAt: string
	views: number
	contacts: number
}

export function PostInfoCard({ createdAt, updatedAt, views, contacts }: PostInfoCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Informations</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Créé le</span>
					<span>{format(new Date(createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Dernière modification</span>
					<span>{format(new Date(updatedAt), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground flex items-center gap-1">
						<Eye className="h-4 w-4" />
						Vues
					</span>
					<span>{views}</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground flex items-center gap-1">
						<MessageSquare className="h-4 w-4" />
						Contacts
					</span>
					<span>{contacts}</span>
				</div>
			</CardContent>
		</Card>
	)
}
