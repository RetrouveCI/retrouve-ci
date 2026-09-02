import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import {
	FieldError,
	Input,
	Textarea,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { InputLabel } from '@app/ui/components/form'
import { cn } from '@app/ui/utils'
import { Package } from 'lucide-react'
import { PhotosUpload } from './photos-upload'
import { SectionHeader } from './section-header'
import { MIN_DESCRIPTION_LENGTH } from '@app/contracts/lost-items'
import { OBJECT_TYPES } from '../publish.const'
import type { PublishFormInput } from '../publish.schema'

interface ObjectInfoSectionProps {
	control: Control<PublishFormInput>
	accentColor: string
	counterAccentClass: string
	descriptionPlaceholder: string
	photoVariant: 'optional' | 'recommended'
	photoBadge?: string
	photoBadgeClassName?: string
	step?: number
}

export function ObjectInfoSection({
	control,
	accentColor,
	counterAccentClass,
	descriptionPlaceholder,
	photoVariant,
	photoBadge,
	photoBadgeClassName,
	step,
}: ObjectInfoSectionProps) {
	return (
		<div className="bg-background space-y-5 rounded-2xl border p-6">
			<SectionHeader
				step={step}
				icon={Package}
				title="Informations sur l'objet"
				description="Titre, type et description détaillée."
				accentColor={accentColor}
			/>

			<Controller
				control={control}
				name="title"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor={field.name} required>
							Titre
						</InputLabel>
						<Input
							{...field}
							id={field.name}
							value={field.value ?? ''}
							placeholder="Ex : iPhone 14 Pro noir"
							className="h-11"
							aria-invalid={fieldState.invalid || undefined}
						/>
						{fieldState.error && (
							<FieldError errors={[fieldState.error]} className="text-xs" />
						)}
					</div>
				)}
			/>

			<Controller
				control={control}
				name="objectType"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor={field.name} required>
							Type d&apos;objet
						</InputLabel>
						<Select
							value={field.value ?? ''}
							onValueChange={field.onChange}
							onOpenChange={open => !open && field.onBlur()}
						>
							<SelectTrigger
								id={field.name}
								className="h-11"
								aria-invalid={fieldState.invalid || undefined}
							>
								<SelectValue placeholder="Sélectionnez un type" />
							</SelectTrigger>
							<SelectContent>
								{OBJECT_TYPES.map(type => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{fieldState.error && (
							<FieldError errors={[fieldState.error]} className="text-xs" />
						)}
					</div>
				)}
			/>

			<Controller
				control={control}
				name="description"
				render={({ field, fieldState }) => {
					const length = field.value?.length ?? 0
					const isLongEnough = length >= MIN_DESCRIPTION_LENGTH

					return (
						<div className="space-y-2">
							<InputLabel htmlFor={field.name} required>
								Description
							</InputLabel>
							<Textarea
								{...field}
								id={field.name}
								value={field.value ?? ''}
								placeholder={descriptionPlaceholder}
								className="min-h-27.5 resize-none"
								aria-invalid={fieldState.invalid || undefined}
							/>
							<p
								className={cn(
									'text-xs',
									isLongEnough ? counterAccentClass : 'text-muted-foreground',
								)}
							>
								{isLongEnough
									? '✓ Suffisant'
									: `Minimum ${MIN_DESCRIPTION_LENGTH} caractères (${length}/${MIN_DESCRIPTION_LENGTH})`}
							</p>
							{fieldState.error && (
								<FieldError errors={[fieldState.error]} className="text-xs" />
							)}
						</div>
					)
				}}
			/>

			<div className="space-y-2">
				{photoBadge ? (
					<div className="flex items-center gap-2">
						<InputLabel>Photos</InputLabel>
						<span
							className={cn(
								'rounded-full border px-2 py-0.5 text-xs font-semibold',
								photoBadgeClassName,
							)}
						>
							{photoBadge}
						</span>
					</div>
				) : (
					<InputLabel>
						Photos{' '}
						<span className="text-muted-foreground text-xs font-normal">
							(optionnel)
						</span>
					</InputLabel>
				)}
				<PhotosUpload variant={photoVariant} accentColor={accentColor} />
			</div>
		</div>
	)
}
