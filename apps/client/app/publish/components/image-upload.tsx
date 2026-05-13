import { X, ImageIcon } from 'lucide-react'

interface ImageUploadProps {
	preview: string | null
	onRemove: () => void
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	variant?: 'optional' | 'recommended'
	accentColor: string
}

export function ImageUpload({
	preview,
	onRemove,
	onChange,
	variant = 'optional',
	accentColor,
}: ImageUploadProps) {
	if (preview) {
		return (
			<div className="bg-muted relative aspect-video w-full overflow-hidden rounded-xl border">
				{
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={preview}
						alt="Aperçu"
						className="h-full w-full object-cover"
					/>
				}
				<button
					type="button"
					onClick={onRemove}
					className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		)
	}

	return (
		<label
			className="group flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors"
			style={{
				borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
			}}
		>
			<ImageIcon
				className="mb-1.5 h-7 w-7 transition-colors"
				style={{ color: `color-mix(in srgb, ${accentColor} 50%, transparent)` }}
			/>
			<span className="text-muted-foreground text-sm">
				Cliquez pour ajouter une photo
			</span>
			{variant === 'recommended' && (
				<span className="text-muted-foreground/70 mt-0.5 text-xs">
					Une photo aide beaucoup le propriétaire
				</span>
			)}
			<input
				type="file"
				accept="image/*"
				onChange={onChange}
				className="hidden"
			/>
		</label>
	)
}
