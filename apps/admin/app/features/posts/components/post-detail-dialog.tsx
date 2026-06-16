import {
	Badge,
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@retrouve-ci/ui/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
	MapPin,
	Phone,
	User,
	Eye,
	MessageCircle,
	CalendarDays,
} from 'lucide-react'
import type { Post, ModerationStatus } from '../posts.types'

const MODERATION_CONFIG: Record<
	ModerationStatus,
	{ label: string; className: string }
> = {
	pending: {
		label: 'En attente',
		className: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
	},
	published: {
		label: 'Publié',
		className: 'bg-green-100 text-green-700 hover:bg-green-100',
	},
	hidden: {
		label: 'Masqué',
		className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
	},
}

const CATEGORY_LABELS: Record<string, string> = {
	phone: 'Téléphone',
	keys: 'Clés',
	wallet: 'Portefeuille',
	bag: 'Sac',
	electronics: 'Électronique',
	clothing: 'Vêtement',
	jewelry: 'Bijou',
	documents: 'Documents',
	other: 'Autre',
}

interface PostDetailDialogProps {
	post: Post | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onModerate: (id: string, status: ModerationStatus) => void
	isModerating?: boolean
}

export function PostDetailDialog({
	post,
	open,
	onOpenChange,
	onModerate,
	isModerating = false,
}: PostDetailDialogProps) {
	if (!post) return null

	const moderationCfg = MODERATION_CONFIG[post.moderationStatus]

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 pr-6">
						<Badge
							className={
								post.type === 'lost'
									? 'bg-red-100 text-red-700 hover:bg-red-100'
									: 'bg-green-100 text-green-700 hover:bg-green-100'
							}
						>
							{post.type === 'lost' ? 'Perdu' : 'Retrouvé'}
						</Badge>
						<span className="truncate">{post.title}</span>
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge className={moderationCfg.className}>
							{moderationCfg.label}
						</Badge>
						<Badge variant="outline">
							{CATEGORY_LABELS[post.category] ?? post.category}
						</Badge>
						{post.resolutionStatus === 'resolved' && (
							<Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
								Résolu
							</Badge>
						)}
					</div>

					<p className="text-sm leading-relaxed">{post.description}</p>

					<div className="grid grid-cols-2 gap-3 text-sm">
						<div className="flex items-center gap-2">
							<MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
							<span>
								{post.ville}
								{post.commune ? ` · ${post.commune}` : ''}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<CalendarDays className="text-muted-foreground h-4 w-4 shrink-0" />
							<span>
								{format(new Date(post.eventDate), 'dd MMM yyyy', { locale: fr })}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<User className="text-muted-foreground h-4 w-4 shrink-0" />
							<span>{post.contactName}</span>
						</div>
						<div className="flex items-center gap-2">
							<Phone className="text-muted-foreground h-4 w-4 shrink-0" />
							<span className="font-mono">{post.contactWhatsapp}</span>
						</div>
						<div className="flex items-center gap-2">
							<Eye className="text-muted-foreground h-4 w-4 shrink-0" />
							<span>{post.views} vues</span>
						</div>
						<div className="flex items-center gap-2">
							<MessageCircle className="text-muted-foreground h-4 w-4 shrink-0" />
							<span>{post.contactsCount} contacts</span>
						</div>
					</div>

					{post.photos.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{post.photos.map((url, i) => (
								<img
									key={i}
									src={url}
									alt={`Photo ${i + 1}`}
									className="h-20 w-20 rounded-lg object-cover"
								/>
							))}
						</div>
					)}

					<p className="text-muted-foreground text-xs">
						Publié le{' '}
						{format(new Date(post.createdAt), "dd MMM yyyy 'à' HH:mm", {
							locale: fr,
						})}
					</p>
				</div>

				<DialogFooter className="flex-wrap gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Fermer
					</Button>
					{post.moderationStatus !== 'published' && (
						<Button
							className="bg-green-600 hover:bg-green-700"
							onClick={() => onModerate(post.id, 'published')}
							disabled={isModerating}
						>
							Approuver
						</Button>
					)}
					{post.moderationStatus !== 'hidden' && (
						<Button
							variant="outline"
							className="text-destructive hover:bg-destructive/10"
							onClick={() => onModerate(post.id, 'hidden')}
							disabled={isModerating}
						>
							Masquer
						</Button>
					)}
					{post.moderationStatus !== 'pending' && (
						<Button
							variant="ghost"
							onClick={() => onModerate(post.id, 'pending')}
							disabled={isModerating}
						>
							Remettre en attente
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
