import { useEffect, useState } from 'react'
import { Badge } from '@retrouve-ci/ui/components'
import { ChevronLeft, ChevronRight, Package, X } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

interface PostGalleryProps {
	images: string[]
	title: string
	isLost: boolean
}

export function PostGallery({ images, title, isLost }: PostGalleryProps) {
	const [active, setActive] = useState(0)
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const hasImages = images.length > 0
	const current = images[active] ?? ''

	const go = (direction: number) =>
		setActive(i => (i + direction + images.length) % images.length)

	useEffect(() => {
		if (!lightboxOpen) return

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setLightboxOpen(false)
			if (e.key === 'ArrowLeft') go(-1)
			if (e.key === 'ArrowRight') go(1)
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lightboxOpen, images.length])

	return (
		<div className="space-y-3">
			<div className="bg-muted relative aspect-4/3 overflow-hidden rounded-2xl">
				{hasImages ? (
					<button
						type="button"
						onClick={() => setLightboxOpen(true)}
						className="absolute inset-0 h-full w-full cursor-zoom-in"
						aria-label="Agrandir la photo"
					>
						<img
							src={current}
							alt={title}
							className="h-full w-full object-cover"
						/>
					</button>
				) : (
					<div className="from-muted to-muted/50 absolute inset-0 flex items-center justify-center bg-linear-to-br">
						<Package className="text-muted-foreground/30 h-24 w-24" />
					</div>
				)}

				<Badge
					className={cn(
						'absolute top-4 left-4 px-3 py-1 text-sm',
						isLost
							? 'bg-accent-orange border-0 text-white'
							: 'bg-primary-green border-0 text-white',
					)}
				>
					{isLost ? 'Objet perdu' : 'Objet retrouvé'}
				</Badge>
			</div>

			{images.length > 1 && (
				<div className="flex gap-2 overflow-x-auto pb-1">
					{images.map((url, i) => (
						<button
							key={i}
							type="button"
							onClick={() => setActive(i)}
							className={cn(
								'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
								i === active
									? 'border-primary-green'
									: 'border-transparent opacity-70 hover:opacity-100',
							)}
							aria-label={`Voir la photo ${i + 1}`}
						>
							<img
								src={url}
								alt={`${title} — photo ${i + 1}`}
								className="h-full w-full object-cover"
							/>
						</button>
					))}
				</div>
			)}

			{lightboxOpen && hasImages && (
				<div
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
					onClick={() => setLightboxOpen(false)}
				>
					<button
						type="button"
						onClick={() => setLightboxOpen(false)}
						className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
						aria-label="Fermer"
					>
						<X className="h-5 w-5" />
					</button>

					{images.length > 1 && (
						<button
							type="button"
							onClick={e => {
								e.stopPropagation()
								go(-1)
							}}
							className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
							aria-label="Photo précédente"
						>
							<ChevronLeft className="h-6 w-6" />
						</button>
					)}

					<img
						src={current}
						alt={title}
						className="max-h-[85vh] max-w-full rounded-lg object-contain"
						onClick={e => e.stopPropagation()}
					/>

					{images.length > 1 && (
						<button
							type="button"
							onClick={e => {
								e.stopPropagation()
								go(1)
							}}
							className="absolute right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
							aria-label="Photo suivante"
						>
							<ChevronRight className="h-6 w-6" />
						</button>
					)}

					{images.length > 1 && (
						<span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
							{active + 1} / {images.length}
						</span>
					)}
				</div>
			)}
		</div>
	)
}
