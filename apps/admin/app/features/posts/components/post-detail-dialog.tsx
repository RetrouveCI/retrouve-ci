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
	CheckCircle2,
	EyeOff,
	Clock,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { STATUS_TONE_CLASSES } from '@/shared/lib/status-tone'
import { PostPhotos } from './post-photos'
import type { Post, ModerationStatus } from '../posts.types'

const MODERATION_CONFIG: Record<
	ModerationStatus,
	{ label: string; className: string }
> = {
	pending: { label: 'En attente', className: STATUS_TONE_CLASSES.warning },
	published: { label: 'Publié', className: STATUS_TONE_CLASSES.success },
	hidden: { label: 'Masqué', className: STATUS_TONE_CLASSES.neutral },
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

interface MetaItem {
	icon: typeof MapPin
	value: string
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
	const isLost = post.type === 'lost'

	const metaItems: MetaItem[] = [
		{
			icon: MapPin,
			value: `${post.ville}${post.commune ? ` · ${post.commune}` : ''}`,
		},
		{
			icon: CalendarDays,
			value: format(new Date(post.eventDate), 'dd MMM yyyy', { locale: fr }),
		},
		{ icon: User, value: post.contactName },
		{ icon: Phone, value: post.contactWhatsapp },
		{ icon: Eye, value: `${post.views} vues` },
		{ icon: MessageCircle, value: `${post.contactsCount} contacts` },
	]

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
				<DialogHeader className="space-y-0 px-6 pt-6 pb-4">
					<DialogTitle className="flex items-center gap-2 pr-6 text-lg">
						<Badge
							className={cn(
								'border-0',
								isLost
									? STATUS_TONE_CLASSES.danger
									: STATUS_TONE_CLASSES.success,
							)}
						>
							{isLost ? 'Perdu' : 'Retrouvé'}
						</Badge>
						<span className="truncate">{post.title}</span>
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-5 px-6 pb-6">
					<PostPhotos photos={post.photos} title={post.title} />

					<div className="flex flex-wrap items-center gap-2">
						<Badge className={moderationCfg.className}>
							{moderationCfg.label}
						</Badge>
						<Badge variant="outline">
							{CATEGORY_LABELS[post.category] ?? post.category}
						</Badge>
						{post.resolutionStatus === 'resolved' && (
							<Badge className={STATUS_TONE_CLASSES.info}>Résolu</Badge>
						)}
					</div>

					<div className="bg-muted/40 rounded-xl border p-4">
						<p className="text-sm leading-relaxed whitespace-pre-line">
							{post.description}
						</p>
					</div>

					<div className="grid gap-2.5 sm:grid-cols-2">
						{metaItems.map(({ icon: Icon, value }, i) => (
							<div
								key={i}
								className="bg-muted/30 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm"
							>
								<span className="bg-background text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
									<Icon className="h-4 w-4" />
								</span>
								<span className="truncate">{value}</span>
							</div>
						))}
					</div>

					<p className="text-muted-foreground text-xs">
						Publié le{' '}
						{format(new Date(post.createdAt), "dd MMM yyyy 'à' HH:mm", {
							locale: fr,
						})}
					</p>
				</div>

				<DialogFooter className="bg-muted/20 flex-wrap gap-2 border-t px-6 py-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Fermer
					</Button>
					{post.moderationStatus !== 'published' && (
						<Button
							className="bg-green-600 hover:bg-green-700"
							onClick={() => onModerate(post.id, 'published')}
							disabled={isModerating}
						>
							<CheckCircle2 className="mr-2 h-4 w-4" />
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
							<EyeOff className="mr-2 h-4 w-4" />
							Masquer
						</Button>
					)}
					{post.moderationStatus !== 'pending' && (
						<Button
							variant="ghost"
							onClick={() => onModerate(post.id, 'pending')}
							disabled={isModerating}
						>
							<Clock className="mr-2 h-4 w-4" />
							Remettre en attente
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
