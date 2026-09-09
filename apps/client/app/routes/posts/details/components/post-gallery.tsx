import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Package, X } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { imageUrl } from '@/shared/utils/image'

interface PostGalleryProps {
	images: string[]
	title: string
}

/**
 * The photos are a horizontal scroll-snap track rather than one image swapped by
 * an index, because on a phone the gesture that changes a photo is a swipe. Each
 * slide is a named button, so the track is navigable by keyboard too.
 *
 * `active` is derived from the scroll offset rather than driving it: the browser
 * owns the position, and reading it back is what keeps the indicators honest when
 * the move came from the user's thumb.
 */
export function PostGallery({ images, title }: PostGalleryProps) {
	const trackRef = useRef<HTMLDivElement>(null)
	const [active, setActive] = useState(0)
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const hasImages = images.length > 0
	const hasSeveral = images.length > 1
	const current = images[active] ?? ''

	function goTo(index: number) {
		const next = (index + images.length) % images.length
		setActive(next)

		const track = trackRef.current
		if (!track || track.clientWidth === 0) return

		track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
	}

	function onTrackScroll() {
		const track = trackRef.current
		if (!track || track.clientWidth === 0) return

		setActive(Math.round(track.scrollLeft / track.clientWidth))
	}

	useEffect(() => {
		if (!lightboxOpen) return

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setLightboxOpen(false)
			if (e.key === 'ArrowLeft') goTo(active - 1)
			if (e.key === 'ArrowRight') goTo(active + 1)
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lightboxOpen, active, images.length])

	return (
		<>
			<div className="bg-muted relative overflow-hidden sm:rounded-2xl">
				{hasImages ? (
					<div
						ref={trackRef}
						onScroll={onTrackScroll}
						className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
					>
						{images.map((url, i) => (
							<button
								key={i}
								type="button"
								onClick={() => setLightboxOpen(true)}
								className="relative aspect-4/3 w-full shrink-0 basis-full cursor-zoom-in snap-center"
								aria-label={`Agrandir la photo ${i + 1}`}
							>
								<img
									src={imageUrl(url, { width: 1600 })}
									alt={`${title} — photo ${i + 1}`}
									decoding="async"
									// Only the first slide is on screen; the rest sit outside the
									// viewport, which is exactly what `lazy` defers.
									{...(i === 0
										? { fetchPriority: 'high' as const }
										: { loading: 'lazy' as const })}
									className="h-full w-full object-cover"
								/>
							</button>
						))}
					</div>
				) : (
					<div className="from-muted to-muted/50 flex aspect-4/3 items-center justify-center bg-linear-to-br">
						<Package className="text-muted-foreground/30 h-20 w-20" />
					</div>
				)}

				{hasSeveral && (
					<>
						{/* A photo is any colour, so the dots need a ground of their own. */}
						<div
							className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/45 to-transparent"
							aria-hidden
						/>
						{/*
						 * Indicators, not controls — which is what the maquette draws and
						 * what saves them from being unreachable: 44 px targets six pixels
						 * apart overlap by 28, and the last one wins every tap. The gesture
						 * moves the track, and each slide is a named button of its own.
						 */}
						<div
							className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5"
							aria-hidden
						>
							{images.map((_, i) => (
								<span
									key={i}
									className={cn(
										'h-1.5 rounded-full transition-all',
										i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/60',
									)}
								/>
							))}
						</div>
					</>
				)}
			</div>

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

					{hasSeveral && (
						<button
							type="button"
							onClick={e => {
								e.stopPropagation()
								goTo(active - 1)
							}}
							className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
							aria-label="Photo précédente"
						>
							<ChevronLeft className="h-6 w-6" />
						</button>
					)}

					<img
						src={imageUrl(current, { width: 1600 })}
						alt={title}
						decoding="async"
						className="max-h-[85vh] max-w-full rounded-lg object-contain"
						onClick={e => e.stopPropagation()}
					/>

					{hasSeveral && (
						<button
							type="button"
							onClick={e => {
								e.stopPropagation()
								goTo(active + 1)
							}}
							className="absolute right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
							aria-label="Photo suivante"
						>
							<ChevronRight className="h-6 w-6" />
						</button>
					)}

					{hasSeveral && (
						<span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
							{active + 1} / {images.length}
						</span>
					)}
				</div>
			)}
		</>
	)
}
