import { useEffect, useRef, useState } from 'react'
import { X, ImageIcon } from 'lucide-react'
import { FieldError } from '@retrouve-ci/ui/components/form'
import {
	ALLOWED_PHOTO_TYPES,
	MAX_PHOTO_SIZE,
	MAX_PHOTOS,
} from '../publish.const'

interface PhotoSlot {
	id: string
	/** Set when the photo is an already-uploaded remote URL (edit flow). */
	url?: string
	/** Remote URL for existing photos, object URL for newly added files. */
	preview: string
}

interface PhotosUploadProps {
	initialPhotos?: string[]
	variant?: 'optional' | 'recommended'
	accentColor: string
	max?: number
}

export function PhotosUpload({
	initialPhotos = [],
	variant = 'optional',
	accentColor,
	max = MAX_PHOTOS,
}: PhotosUploadProps) {
	const [slots, setSlots] = useState<PhotoSlot[]>(() =>
		initialPhotos.map((url, index) => ({
			id: `existing-${index}`,
			url,
			preview: url,
		})),
	)
	const [error, setError] = useState<string | null>(null)

	const fileMapRef = useRef<Map<string, File>>(new Map())
	const nextIdRef = useRef(0)

	// Revoke object URLs created for newly added files on unmount.
	useEffect(() => {
		return () => {
			for (const slot of slots) {
				if (!slot.url) URL.revokeObjectURL(slot.preview)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const setFileInputRef = (id: string) => (el: HTMLInputElement | null) => {
		if (!el) return
		const file = fileMapRef.current.get(id)
		if (file && el.files?.length !== 1) {
			const transfer = new DataTransfer()
			transfer.items.add(file)
			el.files = transfer.files
		}
	}

	const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
		const picked = Array.from(e.target.files ?? [])
		e.target.value = ''
		if (picked.length === 0) return

		setError(null)
		setSlots(prev => {
			const accepted: PhotoSlot[] = []
			let nextError: string | null = null

			for (const file of picked) {
				if (prev.length + accepted.length >= max) {
					nextError = `Vous pouvez ajouter ${max} photos maximum`
					break
				}
				if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
					nextError =
						'Format non supporté : utilisez une image JPEG, PNG ou WebP'
					continue
				}
				if (file.size > MAX_PHOTO_SIZE) {
					nextError = 'Image trop volumineuse : 5 Mo maximum'
					continue
				}

				const id = `new-${nextIdRef.current++}`
				fileMapRef.current.set(id, file)
				accepted.push({ id, preview: URL.createObjectURL(file) })
			}

			if (nextError) setError(nextError)
			return [...prev, ...accepted]
		})
	}

	const handleRemove = (id: string) => {
		setSlots(prev => {
			const slot = prev.find(s => s.id === id)
			if (slot && !slot.url) URL.revokeObjectURL(slot.preview)
			return prev.filter(s => s.id !== id)
		})
		fileMapRef.current.delete(id)
		setError(null)
	}

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
				{slots.map(slot => (
					<div
						key={slot.id}
						className="bg-muted relative aspect-square overflow-hidden rounded-xl border"
					>
						<img
							src={slot.preview}
							alt="Aperçu"
							className="h-full w-full object-cover"
						/>
						<button
							type="button"
							onClick={() => handleRemove(slot.id)}
							className="absolute top-1.5 right-1.5 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
						>
							<X className="h-3.5 w-3.5" />
						</button>
						{slot.url ? (
							<input type="hidden" name="existingPhotos" value={slot.url} />
						) : (
							<input
								ref={setFileInputRef(slot.id)}
								type="file"
								name="photos"
								accept="image/jpeg,image/png,image/webp"
								className="hidden"
							/>
						)}
					</div>
				))}

				{slots.length < max && (
					<label
						className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-center transition-colors"
						style={{
							borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
						}}
					>
						<ImageIcon
							className="h-6 w-6"
							style={{
								color: `color-mix(in srgb, ${accentColor} 50%, transparent)`,
							}}
						/>
						<span className="text-muted-foreground px-1 text-xs">Ajouter</span>
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							multiple
							onChange={handleAdd}
							className="hidden"
						/>
					</label>
				)}
			</div>

			{variant === 'recommended' && slots.length === 0 && (
				<p className="text-muted-foreground/70 text-xs">
					Une photo aide beaucoup le propriétaire
				</p>
			)}

			{error && <FieldError errors={[error]} />}
		</div>
	)
}
