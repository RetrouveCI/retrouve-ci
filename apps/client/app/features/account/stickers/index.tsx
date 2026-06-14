import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { QrCode, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/shared/auth/auth-context'
import type { Sticker } from '@/shared/types/sticker'
import { StickerCard } from './components/sticker-card'
import { ActivateStickerDialog } from './components/activate-sticker-dialog'
import { OrderMoreCta } from './components/order-more-cta'

export default function StickersPage() {
	const navigate = useNavigate()
	const {
		isAuthenticated,
		isLoading,
		stickers,
		activateSticker,
		deactivateSticker,
		updateSticker,
	} = useAuth()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) navigate('/auth')
	}, [isLoading, isAuthenticated, navigate])

	const activeStickers = stickers.filter(s => s.isActive).length

	const handleToggleSticker = (sticker: Sticker) => {
		if (sticker.isActive) {
			deactivateSticker(sticker.id)
			toast.success('Sticker désactivé')
		} else {
			updateSticker(sticker.id, {
				isActive: true,
				activatedAt: new Date().toISOString().split('T')[0],
			})
			toast.success('Sticker réactivé')
		}
	}

	if (isLoading) {
		return (
			<main className="flex flex-1 items-center justify-center">
				<div className="border-primary-green h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
			</main>
		)
	}

	return (
		<main className="flex-1">
			<section className="relative overflow-hidden border-b">
				<div className="pointer-events-none absolute inset-0">
					<div className="bg-primary-green/5 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
				</div>
				<div className="relative container mx-auto px-4 py-8">
					<Link
						to="/account"
						className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour au compte
					</Link>
					<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<div className="flex items-center gap-4">
							<div className="bg-primary-green/10 flex h-14 w-14 items-center justify-center rounded-2xl">
								<QrCode className="text-primary-green h-7 w-7" />
							</div>
							<div>
								<h1 className="text-2xl font-bold">Mes Stickers QR</h1>
								<p className="text-muted-foreground">
									{stickers.length} sticker{stickers.length > 1 ? 's' : ''} ·{' '}
									{activeStickers} actif{activeStickers > 1 ? 's' : ''}
								</p>
							</div>
						</div>
						<ActivateStickerDialog onActivate={activateSticker} />
					</div>
				</div>
			</section>

			<section className="border-b py-4">
				<div className="container mx-auto px-4">
					<div className="flex items-center gap-6 text-sm">
						<div className="flex items-center gap-2">
							<div className="bg-primary-green h-2 w-2 rounded-full" />
							<span className="text-muted-foreground">
								Actifs:{' '}
								<span className="text-foreground font-semibold">
									{activeStickers}
								</span>
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="bg-muted-foreground h-2 w-2 rounded-full" />
							<span className="text-muted-foreground">
								Inactifs:{' '}
								<span className="text-foreground font-semibold">
									{stickers.length - activeStickers}
								</span>
							</span>
						</div>
					</div>
				</div>
			</section>

			<section className="py-8">
				<div className="container mx-auto px-4">
					{stickers.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{stickers.map(sticker => (
								<StickerCard
									key={sticker.id}
									sticker={sticker}
									onToggle={() => handleToggleSticker(sticker)}
									onUpdate={updates => updateSticker(sticker.id, updates)}
								/>
							))}
						</div>
					) : (
						<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-16 text-center">
							<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
								<QrCode className="text-muted-foreground h-8 w-8" />
							</div>
							<h3 className="mb-2 text-lg font-semibold">Aucun sticker</h3>
							<p className="text-muted-foreground mx-auto mb-6 max-w-sm">
								Activez votre premier sticker QR pour protéger vos objets
								précieux.
							</p>
							<ActivateStickerDialog onActivate={activateSticker} />
						</div>
					)}

					<OrderMoreCta />
				</div>
			</section>
		</main>
	)
}
