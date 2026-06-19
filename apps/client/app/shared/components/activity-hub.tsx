'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import {
	Zap,
	FileText,
	QrCode,
	Package,
	Bell,
	Plus,
	Search,
	ShoppingCart,
	X,
	Loader2,
} from 'lucide-react'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	Badge,
} from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { useAuth } from '@/shared/auth/auth-context'
import { apiFetch } from '@/shared/lib/api-client'

interface ActivitySummary {
	posts: { total: number; active: number; pending: number }
	stickers: { total: number; activated: number }
	orders: { total: number; inProgress: number }
	unreadNotifications: number
}

export function ActivityHub() {
	const { isAuthenticated, isLoading: authLoading } = useAuth()
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [summary, setSummary] = useState<ActivitySummary | null>(null)
	const [hasUnread, setHasUnread] = useState(false)

	useEffect(() => {
		if (!isAuthenticated) return
		apiFetch<number>('/notifications/unread-count')
			.then(count => setHasUnread(count > 0))
			.catch(() => {})
	}, [isAuthenticated])

	const fetchSummary = useCallback(async () => {
		setLoading(true)
		try {
			const [postsRes, stickersRes, ordersRes, unreadCount] = await Promise.all(
				[
					apiFetch<{
						items: Array<{
							moderationStatus: string
							resolutionStatus: string
						}>
						total: number
					}>('/lost-items/mine?pageSize=50'),
					apiFetch<{ items: Array<{ status: string }>; total: number }>(
						'/qr-codes/mine?pageSize=50',
					),
					apiFetch<{ items: Array<{ status: string }>; total: number }>(
						'/sticker-orders/mine?pageSize=50',
					),
					apiFetch<number>('/notifications/unread-count'),
				],
			)

			const newSummary: ActivitySummary = {
				posts: {
					total: postsRes.total,
					active: postsRes.items.filter(
						i =>
							i.resolutionStatus === 'active' &&
							i.moderationStatus === 'published',
					).length,
					pending: postsRes.items.filter(i => i.moderationStatus === 'pending')
						.length,
				},
				stickers: {
					total: stickersRes.total,
					activated: stickersRes.items.filter(i => i.status === 'activated')
						.length,
				},
				orders: {
					total: ordersRes.total,
					inProgress: ordersRes.items.filter(
						i =>
							i.status === 'pending' ||
							i.status === 'processing' ||
							i.status === 'shipped',
					).length,
				},
				unreadNotifications: unreadCount,
			}
			setSummary(newSummary)
			setHasUnread(unreadCount > 0)
		} catch {
			// non-critical — fail silently
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		if (open && isAuthenticated) {
			fetchSummary()
		}
	}, [open, isAuthenticated, fetchSummary])

	if (authLoading || !isAuthenticated) return null

	const hasActivity =
		hasUnread ||
		(summary !== null &&
			(summary.posts.pending > 0 || summary.orders.inProgress > 0))

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					className={cn(
						'fixed right-8 bottom-6 z-50',
						'flex h-12 w-12 items-center justify-center rounded-full',
						'cursor-pointer transition-all duration-300',
						open
							? 'bg-foreground text-background shadow-foreground/20 ring-foreground/10 shadow-lg ring-1'
							: 'bg-primary-green shadow-primary-green/25 ring-primary-green/20 hover:shadow-primary-green/30 text-white shadow-lg ring-1 hover:scale-105 hover:shadow-xl',
					)}
					aria-label="Mon activité"
				>
					{open ? (
						<X className="h-5 w-5" />
					) : (
						<>
							<Zap className="h-5 w-5" />
							{hasActivity && (
								<span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
									<span className="bg-accent-orange absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
									<span className="bg-accent-orange relative inline-flex h-3.5 w-3.5 rounded-full" />
								</span>
							)}
						</>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent
				side="top"
				align="start"
				sideOffset={12}
				className="w-80 p-0"
			>
				<div className="border-b p-4 pb-3">
					<h3 className="text-sm font-semibold">Mon activité</h3>
					<p className="text-muted-foreground text-xs">
						Résumé de votre compte
					</p>
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
					</div>
				) : summary ? (
					<>
						<div className="divide-y">
							<SummaryRow
								icon={FileText}
								label="Annonces"
								href="/account/posts"
								count={summary.posts.total}
								detail={formatPostsDetail(summary.posts)}
								highlight={summary.posts.pending > 0}
								onClick={() => setOpen(false)}
							/>
							<SummaryRow
								icon={QrCode}
								label="Stickers QR"
								href="/account/stickers"
								count={summary.stickers.total}
								detail={
									summary.stickers.activated > 0
										? `${summary.stickers.activated} actif${summary.stickers.activated > 1 ? 's' : ''}`
										: undefined
								}
								onClick={() => setOpen(false)}
							/>
							<SummaryRow
								icon={Package}
								label="Commandes"
								href="/account/orders"
								count={summary.orders.total}
								detail={
									summary.orders.inProgress > 0
										? `${summary.orders.inProgress} en cours`
										: undefined
								}
								highlight={summary.orders.inProgress > 0}
								onClick={() => setOpen(false)}
							/>
							<SummaryRow
								icon={Bell}
								label="Notifications"
								href="/notifications"
								count={summary.unreadNotifications}
								detail={
									summary.unreadNotifications > 0
										? `${summary.unreadNotifications} non lue${summary.unreadNotifications > 1 ? 's' : ''}`
										: undefined
								}
								highlight={summary.unreadNotifications > 0}
								onClick={() => setOpen(false)}
							/>
						</div>

						<div className="border-t p-3">
							<p className="text-muted-foreground mb-2 text-xs font-medium">
								Actions rapides
							</p>
							<div className="flex flex-col gap-1">
								<QuickAction
									icon={Search}
									label="Déclarer une perte"
									href="/publish/lost"
									onClick={() => setOpen(false)}
								/>
								<QuickAction
									icon={Plus}
									label="Signaler un objet trouvé"
									href="/publish/found"
									onClick={() => setOpen(false)}
								/>
								<QuickAction
									icon={ShoppingCart}
									label="Commander des stickers"
									href="/stickers/order"
									onClick={() => setOpen(false)}
								/>
							</div>
						</div>
					</>
				) : (
					<div className="text-muted-foreground py-8 text-center text-sm">
						Impossible de charger les données
					</div>
				)}
			</PopoverContent>
		</Popover>
	)
}

function formatPostsDetail(
	posts: ActivitySummary['posts'],
): string | undefined {
	const parts: string[] = []
	if (posts.active > 0)
		parts.push(`${posts.active} active${posts.active > 1 ? 's' : ''}`)
	if (posts.pending > 0) parts.push(`${posts.pending} en attente`)
	return parts.length > 0 ? parts.join(', ') : undefined
}

function SummaryRow({
	icon: Icon,
	label,
	href,
	count,
	detail,
	highlight,
	onClick,
}: {
	icon: React.ComponentType<{ className?: string }>
	label: string
	href: string
	count: number
	detail?: string
	highlight?: boolean
	onClick: () => void
}) {
	return (
		<Link
			to={href}
			onClick={onClick}
			className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 transition-colors"
		>
			<div
				className={cn(
					'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
					highlight
						? 'bg-accent-orange/10 text-accent-orange'
						: 'bg-muted text-muted-foreground',
				)}
			>
				<Icon className="h-4 w-4" />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">{label}</span>
					<Badge
						variant={highlight ? 'default' : 'secondary'}
						className={cn(
							'h-5 min-w-5 px-1.5 text-[10px]',
							highlight && 'bg-accent-orange hover:bg-accent-orange/90',
						)}
					>
						{count}
					</Badge>
				</div>
				{detail && (
					<p
						className={cn(
							'text-xs',
							highlight ? 'text-accent-orange' : 'text-muted-foreground',
						)}
					>
						{detail}
					</p>
				)}
			</div>
		</Link>
	)
}

function QuickAction({
	icon: Icon,
	label,
	href,
	onClick,
}: {
	icon: React.ComponentType<{ className?: string }>
	label: string
	href: string
	onClick: () => void
}) {
	return (
		<Link
			to={href}
			onClick={onClick}
			className="hover:bg-muted/50 flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors"
		>
			<Icon className="text-muted-foreground h-4 w-4" />
			<span>{label}</span>
		</Link>
	)
}
