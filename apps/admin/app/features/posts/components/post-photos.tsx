import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

interface PostPhotosProps {
	photos: string[]
	title: string
}

export function PostPhotos({ photos, title }: PostPhotosProps) {
	const [active, setActive] = useState(0)
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const hasPhotos = photos.length > 0
	const current = photos[active] ?? ''

	const go = (direction: number) =>
		setActive(i => (i + direction + photos.length) % photos.length)

	useEffect(() => {
		if (!lightboxOpen) return

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.stopPropagation()
				setLightboxOpen(false)
			}
			if (e.key === 'ArrowLeft') go(-1)
			if (e.key === 'ArrowRight') go(1)
		}

		// Capture phase + stopPropagation so Escape closes the lightbox without
		// bubbling to the surrounding Radix dialog.
		window.addEventListener('keydown', onKeyDown, true)
		return () => window.removeEventListener('keydown', onKeyDown, true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lightboxOpen, photos.length])

	if (!hasPhotos) {
		return (
			<div className="bg-muted/40 text-muted-foreground flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
				<ImageOff className="h-8 w-8 opacity-40" />
				<span className="text-xs">Aucune photo</span>
			</div>
		)
	}

	return (
		<div className="space-y-2">
			<button
				type="button"
				onClick={() => setLightboxOpen(true)}
				className="bg-muted relative aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl border"
				aria-label="Agrandir la photo"
			>
				<img src={current} alt={title} className="h-full w-full object-cover" />
				{photos.length > 1 && (
					<span className="absolute right-2 bottom-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
						{active + 1} / {photos.length}
					</span>
				)}
			</button>

			{photos.length > 1 && (
				<div className="flex gap-2 overflow-x-auto pb-1">
					{photos.map((url, i) => (
						<button
							key={i}
							type="button"
							onClick={() => setActive(i)}
							className={cn(
								'relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
								i === active
									? 'border-primary'
									: 'border-transparent opacity-60 hover:opacity-100',
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

			{lightboxOpen && (
				<div
					className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4"
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

					{photos.length > 1 && (
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

					{photos.length > 1 && (
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

					{photos.length > 1 && (
						<span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
							{active + 1} / {photos.length}
						</span>
					)}
				</div>
			)}
		</div>
	)
}
