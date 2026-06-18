import { useRef } from 'react'
import { X, ImageIcon } from 'lucide-react'

interface ImageUploadProps {
	preview: string | null
	onRemove: () => void
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	variant?: 'optional' | 'recommended'
	accentColor: string
	name?: string
}

export function ImageUpload({
	preview,
	onRemove,
	onChange,
	variant = 'optional',
	accentColor,
	name = 'photo',
}: ImageUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null)

	const handleRemove = () => {
		if (inputRef.current) inputRef.current.value = ''
		onRemove()
	}

	return (
		<div>
			{preview ? (
				<div className="bg-muted relative aspect-video w-full overflow-hidden rounded-xl border">
					<img
						src={preview}
						alt="Aperçu"
						className="h-full w-full object-cover"
					/>
					<button
						type="button"
						onClick={handleRemove}
						className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			) : (
				<label
					htmlFor={name}
					className="group flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors"
					style={{
						borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
					}}
				>
					<ImageIcon
						className="mb-1.5 h-7 w-7 transition-colors"
						style={{
							color: `color-mix(in srgb, ${accentColor} 50%, transparent)`,
						}}
					/>
					<span className="text-muted-foreground text-sm">
						Cliquez pour ajouter une photo
					</span>
					{variant === 'recommended' && (
						<span className="text-muted-foreground/70 mt-0.5 text-xs">
							Une photo aide beaucoup le propriétaire
						</span>
					)}
				</label>
			)}
			<input
				ref={inputRef}
				id={name}
				name={name}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onChange={onChange}
				className="hidden"
			/>
		</div>
	)
}
