'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
	FileText,
	Plus,
	Eye,
	MessageCircle,
	Trash2,
	CheckCircle,
	XCircle,
	ArrowLeft,
	MapPin,
	Calendar,
	Package,
	ChevronRight,
	Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Badge } from '@repo/ui/components/ui/badge'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@repo/ui/components/ui/alert-dialog'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth, type UserListing } from '@/contexts/auth-context'
import { cn } from '@repo/ui/lib/utils'
import { redirect } from 'next/navigation'
import { useState, useMemo } from 'react'

// Listing Card Component
function ListingCard({
	listing,
	onDelete,
	onStatusChange,
}: {
	listing: UserListing
	onDelete: () => void
	onStatusChange: (status: UserListing['status']) => void
}) {
	const statusConfig = {
		active: {
			label: 'Active',
			color: 'bg-[var(--primary-green)] text-white',
			border: 'border-[var(--primary-green)]/20',
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

	return (
		<div
			className={cn(
				'group bg-background relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg',
				statusConfig[listing.status].border,
			)}
		>
			{/* Status bar */}
			<div
				className={cn(
					'h-1',
					listing.status === 'active'
						? 'bg-[var(--primary-green)]'
						: listing.status === 'resolved'
							? 'bg-blue-500'
							: 'bg-muted',
				)}
			/>

			<div className="flex gap-4 p-4">
				{/* Image */}
				<div className="bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
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
					{/* Type badge overlay */}
					<div
						className={cn(
							'absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium',
							listing.type === 'lost'
								? 'bg-red-500 text-white'
								: 'bg-[var(--primary-green)] text-white',
						)}
					>
						{listing.type === 'lost' ? 'Perdu' : 'Trouvé'}
					</div>
				</div>

				{/* Content */}
				<div className="flex min-w-0 flex-1 flex-col justify-between">
					<div>
						<div className="mb-1 flex items-center gap-2">
							<Badge
								className={cn(
									'text-[10px] font-medium',
									statusConfig[listing.status].color,
								)}
							>
								{statusConfig[listing.status].label}
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

					{/* Stats */}
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

			{/* Actions */}
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
						<Link href={`/annonces/${listing.id}`}>
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
								<AlertDialogCancel className="rounded-xl">
									Annuler
								</AlertDialogCancel>
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

export default function AnnoncesPage() {
	const {
		isAuthenticated,
		isLoading,
		listings,
		deleteListing,
		updateListingStatus,
	} = useAuth()
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')

	if (!isLoading && !isAuthenticated) {
		redirect('/auth')
	}

	const filteredListings = useMemo(() => {
		return listings.filter(l => {
			const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase())
			const matchesFilter = filter === 'all' || l.status === filter
			return matchesSearch && matchesFilter
		})
	}, [listings, search, filter])

	const activeCount = listings.filter(l => l.status === 'active').length
	const resolvedCount = listings.filter(l => l.status === 'resolved').length

	const handleDelete = (id: string) => {
		deleteListing(id)
		toast.success('Annonce supprimée')
	}

	if (isLoading) {
		return (
			<>
				<Header />
				<main className="flex flex-1 items-center justify-center">
					<div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary-green)] border-t-transparent" />
				</main>
				<Footer />
			</>
		)
	}

	return (
		<>
			<Header />
			<main className="flex-1">
				{/* Header */}
				<section className="relative overflow-hidden border-b">
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute -top-20 right-0 h-96 w-96 rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
					</div>
					<div className="relative container mx-auto px-4 py-8">
						<Link
							href="/compte"
							className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							Retour au compte
						</Link>
						<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
							<div className="flex items-center gap-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-orange)]/10">
									<FileText className="h-7 w-7 text-[var(--accent-orange)]" />
								</div>
								<div>
									<h1 className="text-2xl font-bold">Mes Annonces</h1>
									<p className="text-muted-foreground">
										{listings.length} annonce{listings.length > 1 ? 's' : ''} ·{' '}
										{activeCount} active{activeCount > 1 ? 's' : ''}
									</p>
								</div>
							</div>
							<Button
								asChild
								className="gap-2 rounded-xl bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-dark)]"
							>
								<Link href="/publier">
									<Plus className="h-4 w-4" />
									Nouvelle annonce
								</Link>
							</Button>
						</div>
					</div>
				</section>

				{/* Filters */}
				<section className="border-b py-4">
					<div className="container mx-auto px-4">
						<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
							<div className="relative max-w-xs flex-1">
								<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									placeholder="Rechercher..."
									value={search}
									onChange={e => setSearch(e.target.value)}
									className="h-10 rounded-xl pl-9"
								/>
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={() => setFilter('all')}
									className={cn(
										'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
										filter === 'all'
											? 'bg-foreground text-background'
											: 'bg-muted text-muted-foreground hover:bg-muted/80',
									)}
								>
									Toutes ({listings.length})
								</button>
								<button
									onClick={() => setFilter('active')}
									className={cn(
										'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
										filter === 'active'
											? 'bg-[var(--primary-green)] text-white'
											: 'bg-muted text-muted-foreground hover:bg-muted/80',
									)}
								>
									Actives ({activeCount})
								</button>
								<button
									onClick={() => setFilter('resolved')}
									className={cn(
										'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
										filter === 'resolved'
											? 'bg-blue-500 text-white'
											: 'bg-muted text-muted-foreground hover:bg-muted/80',
									)}
								>
									Résolues ({resolvedCount})
								</button>
							</div>
						</div>
					</div>
				</section>

				{/* Content */}
				<section className="py-8">
					<div className="container mx-auto px-4">
						{filteredListings.length > 0 ? (
							<div className="grid gap-4 lg:grid-cols-2">
								{filteredListings.map(listing => (
									<ListingCard
										key={listing.id}
										listing={listing}
										onDelete={() => handleDelete(listing.id)}
										onStatusChange={status =>
											updateListingStatus(listing.id, status)
										}
									/>
								))}
							</div>
						) : listings.length > 0 ? (
							<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-12 text-center">
								<Search className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
								<h3 className="mb-2 text-lg font-semibold">Aucun résultat</h3>
								<p className="text-muted-foreground text-sm">
									Aucune annonce ne correspond à votre recherche.
								</p>
							</div>
						) : (
							<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-16 text-center">
								<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
									<FileText className="text-muted-foreground h-8 w-8" />
								</div>
								<h3 className="mb-2 text-lg font-semibold">Aucune annonce</h3>
								<p className="text-muted-foreground mx-auto mb-6 max-w-sm">
									Vous n&apos;avez pas encore publié d&apos;annonce. Commencez
									maintenant !
								</p>
								<Button
									asChild
									className="gap-2 rounded-xl bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-dark)]"
								>
									<Link href="/publier">
										<Plus className="h-4 w-4" />
										Publier une annonce
									</Link>
								</Button>
							</div>
						)}
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
