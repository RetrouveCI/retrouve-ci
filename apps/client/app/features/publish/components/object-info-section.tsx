import {
	Textarea,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import {
	getTextareaProps,
	useInputControl,
	type FieldMetadata,
} from '@conform-to/react'
import { cn } from '@retrouve-ci/ui/utils'
import { Package } from 'lucide-react'
import type { LostItemCategory } from '@/shared/types/lost-item'
import {
	InputLabel,
	InputField,
	FieldError,
} from '@retrouve-ci/ui/components/form'
import { ImageUpload } from './image-upload'
import { SectionHeader } from './section-header'
import { OBJECT_TYPES } from '../publish.const'

interface ObjectInfoSectionProps {
	title: FieldMetadata<string>
	objectType: FieldMetadata<LostItemCategory>
	description: FieldMetadata<string>
	imagePreview: string | null
	setImagePreview: (preview: string | null) => void
	handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	accentColor: string
	counterAccentClass: string
	descriptionPlaceholder: string
	photoVariant: 'optional' | 'recommended'
	photoBadge?: string
	photoBadgeClassName?: string
	step?: number
}

export function ObjectInfoSection({
	title,
	objectType,
	description,
	imagePreview,
	setImagePreview,
	handleImageChange,
	accentColor,
	counterAccentClass,
	descriptionPlaceholder,
	photoVariant,
	photoBadge,
	photoBadgeClassName,
	step,
}: ObjectInfoSectionProps) {
	const objectTypeControl = useInputControl(objectType)

	return (
		<div className="bg-background space-y-5 rounded-2xl border p-6">
			<SectionHeader
				step={step}
				icon={Package}
				title="Informations sur l'objet"
				description="Titre, type et description détaillée."
				accentColor={accentColor}
			/>

			<InputField
				field={title}
				label="Titre"
				required
				placeholder="Ex : iPhone 14 Pro noir"
			/>

			<div className="space-y-2">
				<InputLabel htmlFor={objectType.id} required>
					Type d&apos;objet
				</InputLabel>
				<Select
					value={objectTypeControl.value ?? ''}
					onValueChange={objectTypeControl.change}
					onOpenChange={open => !open && objectTypeControl.blur()}
				>
					<SelectTrigger id={objectType.id} className="h-11">
						<SelectValue placeholder="Sélectionnez un type" />
					</SelectTrigger>
					<SelectContent>
						{OBJECT_TYPES.map(t => (
							<SelectItem key={t.value} value={t.value}>
								{t.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<FieldError errors={objectType.errors} />
			</div>

			<div className="space-y-2">
				<InputLabel htmlFor={description.id} required>
					Description
				</InputLabel>
				<Textarea
					{...getTextareaProps(description)}
					key={description.key}
					placeholder={descriptionPlaceholder}
					className="min-h-27.5 resize-none"
				/>
				<p
					className={cn(
						'text-xs',
						(description.value?.length ?? 0) >= 20
							? counterAccentClass
							: 'text-muted-foreground',
					)}
				>
					{(description.value?.length ?? 0) >= 20
						? '✓ Suffisant'
						: `Minimum 20 caractères (${description.value?.length ?? 0}/20)`}
				</p>
				<FieldError errors={description.errors} />
			</div>

			<div className="space-y-2">
				{photoBadge ? (
					<div className="flex items-center gap-2">
						<InputLabel>Photo</InputLabel>
						<span
							className={cn(
								'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
								photoBadgeClassName,
							)}
						>
							{photoBadge}
						</span>
					</div>
				) : (
					<InputLabel>
						Photo{' '}
						<span className="text-muted-foreground text-xs font-normal">
							(optionnel)
						</span>
					</InputLabel>
				)}
				<ImageUpload
					preview={imagePreview}
					onRemove={() => setImagePreview(null)}
					onChange={handleImageChange}
					variant={photoVariant}
					accentColor={accentColor}
				/>
			</div>
		</div>
	)
}
