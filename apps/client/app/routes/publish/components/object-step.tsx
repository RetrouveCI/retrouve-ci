import { useEffect } from 'react'
import { Link } from 'react-router'
import type { Control } from 'react-hook-form'
import { Controller, useWatch } from 'react-hook-form'
import { FieldError, Input, Textarea } from '@app/ui/components'
import { InputLabel } from '@app/ui/components/form'
import { cn } from '@app/ui/utils'
import { ShieldCheck } from 'lucide-react'
import {
	MIN_DESCRIPTION_LENGTH,
	describesDocument,
} from '@app/contracts/lost-items'
import type { LostItemType } from '@/shared/types/lost-item'
import { MAX_PHOTOS, PUBLISH_ACCENT } from '../publish.const'
import type { PublishFormInput } from '../publish.schema'
import { CategoryPills } from './category-pills'
import { DocumentSection } from './document-section'
import { PhotosUpload } from './photos-upload'
import { StepIntro } from './step-intro'

const TYPES: { type: LostItemType; to: string; label: string }[] = [
	{ type: 'lost', to: '/publish/lost', label: "J'ai perdu" },
	{ type: 'found', to: '/publish/found', label: "J'ai trouvé" },
]

interface ObjectStepProps {
	control: Control<PublishFormInput>
	type: LostItemType
	onPhotoCountChange: (count: number) => void
}

export function ObjectStep({
	control,
	type,
	onPhotoCountChange,
}: ObjectStepProps) {
	const accent = PUBLISH_ACCENT[type]

	const [objectType, documentType, documentHolderName] = useWatch({
		control,
		name: ['objectType', 'documentType', 'documentHolderName'],
	})

	const isDocument = objectType === 'documents'
	// The floor the contract waives once the piece names both its type and its
	// holder: the two say more than a paragraph ever did.
	const describesPiece =
		isDocument &&
		describesDocument({
			documentType: documentType || undefined,
			documentHolderName,
		})

	// The picker is unmounted below, and the count it last reported would
	// otherwise stay on step 3's summary.
	useEffect(() => {
		if (isDocument) onPhotoCountChange(0)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDocument])

	return (
		<div className="flex flex-col gap-5.5">
			<StepIntro
				title="L'objet"
				description="Plus la description est précise, plus les chances de correspondance sont élevées."
			/>

			{/* Two routes, so the toggle navigates: the accent, the wording and the
			    action all follow the type, and the draft outlives the move. */}
			<div
				role="group"
				aria-label="Type d'annonce"
				className="bg-muted flex gap-0 rounded-[14px] p-1"
			>
				{TYPES.map(entry => (
					<Link
						key={entry.type}
						to={entry.to}
						aria-current={entry.type === type ? 'page' : undefined}
						className={cn(
							'flex h-11 flex-1 items-center justify-center rounded-[11px] text-base font-semibold transition-colors',
							entry.type === type
								? PUBLISH_ACCENT[entry.type].fill
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						{entry.label}
					</Link>
				))}
			</div>

			<Controller
				control={control}
				name="title"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor={field.name} required className="text-sm">
							Titre de l&apos;annonce
						</InputLabel>
						<Input
							{...field}
							id={field.name}
							value={field.value ?? ''}
							placeholder="Ex : Téléphone Tecno noir"
							className="h-control text-base"
							aria-invalid={fieldState.invalid || undefined}
						/>
						{fieldState.error && <FieldError errors={[fieldState.error]} />}
					</div>
				)}
			/>

			<Controller
				control={control}
				name="objectType"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel required className="text-sm">
							Type d&apos;objet
						</InputLabel>
						<CategoryPills
							value={field.value ?? ''}
							onChange={field.onChange}
							onBlur={field.onBlur}
						/>
						{fieldState.error && <FieldError errors={[fieldState.error]} />}
					</div>
				)}
			/>

			{isDocument && <DocumentSection control={control} type={type} />}

			<Controller
				control={control}
				name="description"
				render={({ field, fieldState }) => {
					const length = field.value?.length ?? 0

					return (
						<div className="space-y-2">
							<div className="flex items-baseline justify-between gap-3">
								<InputLabel
									htmlFor={field.name}
									required={!describesPiece}
									className="text-sm"
								>
									Description
								</InputLabel>
								<span
									className={cn(
										'shrink-0 text-xs tabular-nums',
										describesPiece || length >= MIN_DESCRIPTION_LENGTH
											? 'text-muted-foreground'
											: 'text-accent-orange-text',
									)}
								>
									{describesPiece
										? 'Facultatif'
										: `${length} / ${MIN_DESCRIPTION_LENGTH} min.`}
								</span>
							</div>
							<Textarea
								{...field}
								id={field.name}
								value={field.value ?? ''}
								placeholder={
									type === 'lost'
										? 'Couleur, marque, signes distinctifs, contenu…'
										: "Couleur, marque, signes distinctifs, état de l'objet…"
								}
								className="min-h-27.5 resize-none text-base"
								aria-invalid={fieldState.invalid || undefined}
							/>
							{fieldState.error && <FieldError errors={[fieldState.error]} />}
						</div>
					)
				}}
			/>

			{isDocument ? (
				<div className="bg-muted/30 flex items-start gap-2.5 rounded-[14px] border p-4">
					<ShieldCheck className="text-primary-green-text mt-0.5 h-4.5 w-4.5 shrink-0" />
					<div className="space-y-1">
						<p className="text-sm font-semibold">Aucune photo</p>
						<p className="text-muted-foreground text-sm leading-relaxed">
							La photo d&apos;une pièce livre d&apos;un coup le nom, le numéro
							et la date de naissance sur une page publique. Le type et le nom
							du titulaire suffisent à la retrouver.
						</p>
					</div>
				</div>
			) : (
				<div className="space-y-2">
					<div className="flex items-baseline justify-between gap-3">
						<InputLabel className="text-sm">Photos</InputLabel>
						<span className="text-muted-foreground shrink-0 text-xs">
							Facultatif · {MAX_PHOTOS} max.
						</span>
					</div>
					<PhotosUpload
						variant={type === 'lost' ? 'optional' : 'recommended'}
						accentColor={accent.cssVar}
						onCountChange={onPhotoCountChange}
					/>
				</div>
			)}
		</div>
	)
}
