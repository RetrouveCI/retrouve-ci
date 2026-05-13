import { Button, Badge, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import Image from 'next/image'
import {
	Eye,
	MessageCircle,
	Trash2,
	CheckCircle,
	XCircle,
	MapPin,
	Calendar,
	Package,
	ChevronRight,
} from 'lucide-react'
import type { UserListing } from '@/contexts/auth-context'
import { cn } from '@retrouve-ci/ui/utils'

const STATUS_CONFIG = {
	active: {
		label: 'Active',
		color: 'bg-primary-green text-white',
		border: 'border-primary-green/20',
	},
	resolved: {
		label: 'Résolue',
		color: 'bg-blue-500 text-white',
		border: 'border-blue-500/20',
	},
	expired: {
		label: 'Expirée',
		color: 'bg-muted text-muted-foreground',
		border: 'border-muted',
	},
}

interface ListingCardProps {
	listing: UserListing
	onDelete: () => void
	onStatusChange: (status: UserListing['status']) => void
}

export function ListingCard({ listing, onDelete, onStatusChange }: ListingCardProps) {
	return (
		<div
			className={cn(
				'group bg-background relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg',
				STATUS_CONFIG[listing.status].border,
			)}
		>
			<div
				className={cn(
					'h-1',
					listing.status === 'active'
						? 'bg-primary-green'
						: listing.status === 'resolved'
							? 'bg-blue-500'
							: 'bg-muted',
				)}
			/>

			<div className="flex gap-4 p-4">
				<div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
					{listing.image ? (
						<Image
							src={listing.image}
							alt={listing.title}
							fill
							className="object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<Package className="text-muted-foreground/30 h-8 w-8" />
						</div>
					)}
					<div
						className={cn(
							'absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium',
							listing.type === 'lost'
								? 'bg-red-500 text-white'
								: 'bg-primary-green text-white',
						)}
					>
						{listing.type === 'lost' ? 'Perdu' : 'Trouvé'}
					</div>
				</div>

				<div className="flex min-w-0 flex-1 flex-col justify-between">
					<div>
						<div className="mb-1 flex items-center gap-2">
							<Badge
								className={cn(
									'text-[10px] font-medium',
									STATUS_CONFIG[listing.status].color,
								)}
							>
								{STATUS_CONFIG[listing.status].label}
							</Badge>
						</div>
						<h4 className="truncate font-semibold">{listing.title}</h4>
						<div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
							<span className="flex items-center gap-1">
								<MapPin className="h-3 w-3" />
								{listing.location}
							</span>
							<span className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								{listing.date}
							</span>
						</div>
					</div>

					<div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
						<span className="flex items-center gap-1">
							<Eye className="h-3.5 w-3.5" />
							{listing.views} vues
						</span>
						<span className="flex items-center gap-1">
							<MessageCircle className="h-3.5 w-3.5" />
							{listing.contacts} contacts
						</span>
					</div>
				</div>
			</div>

			<div className="bg-muted/30 flex items-center justify-between border-t px-4 py-3">
				<div className="flex items-center gap-2">
					{listing.status === 'active' && (
						<Button
							variant="ghost"
							size="sm"
							className="h-8 gap-1.5 rounded-lg text-xs"
							onClick={() => onStatusChange('resolved')}
						>
							<CheckCircle className="h-3.5 w-3.5" />
							Marquer résolue
						</Button>
					)}
					{listing.status === 'resolved' && (
						<Button
							variant="ghost"
							size="sm"
							className="h-8 gap-1.5 rounded-lg text-xs"
							onClick={() => onStatusChange('active')}
						>
							<XCircle className="h-3.5 w-3.5" />
							Réactiver
						</Button>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="h-8 rounded-lg text-xs"
					>
						<Link href={`/posts/${listing.id}`}>
							Voir <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
						</Link>
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
							>
								<Trash2 className="h-3.5 w-3.5" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
								<AlertDialogDescription>
									Cette action est irréversible. L&apos;annonce sera
									définitivement supprimée.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
								<AlertDialogAction
									onClick={onDelete}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
								>
									Supprimer
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
	)
}
