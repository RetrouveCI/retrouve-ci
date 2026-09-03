import { useState } from 'react'
import type { Control } from 'react-hook-form'
import { Controller, useWatch } from 'react-hook-form'
import {
	FieldError,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { InputLabel } from '@app/ui/components/form'
import { IdCard, Lock, Plus } from 'lucide-react'
import type { LostItemType } from '@/shared/types/lost-item'
import {
	DOCUMENT_FIELDS,
	DOCUMENT_TYPE_OPTIONS,
} from '@/shared/constants/documents'
import type { PublishFormInput } from '../publish.schema'

interface DocumentSectionProps {
	control: Control<PublishFormInput>
	type: LostItemType
}

/** The one sentence that justifies the field, said where the field is. */
function NumberNotice({ type }: { type: LostItemType }) {
	return (
		<p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
			<Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
			<span>
				{type === 'found' ? 'Recopiez-le tel qu’il est imprimé. ' : null}
				Il n&apos;apparaît sur aucune page publique. Il sert à rapprocher votre
				annonce et à vérifier à la remise.
			</span>
		</p>
	)
}

/**
 * Only the holder's name is required: whoever lost their card rarely knows its
 * number. That asymmetry is also why the number sits forward on the « found »
 * side — the piece is in hand there — and folded on the « lost » one.
 */
export function DocumentSection({ control, type }: DocumentSectionProps) {
	const documentType = useWatch({ control, name: 'documentType' })
	const storedNumber = useWatch({ control, name: 'documentNumber' })
	const [numberOpen, setNumberOpen] = useState(() => Boolean(storedNumber))

	const spec = documentType ? DOCUMENT_FIELDS[documentType] : null
	const issuer = spec?.issuer ?? null
	const showsNumber = type === 'found' || numberOpen

	return (
		<div className="bg-muted/30 space-y-4 rounded-[14px] border p-4">
			<div className="flex items-center gap-2.5">
				<IdCard className="text-muted-foreground h-4.5 w-4.5 shrink-0" />
				<h3 className="text-sm font-semibold">La pièce</h3>
			</div>

			<Controller
				control={control}
				name="documentType"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor={field.name} className="text-sm">
							Type de pièce
						</InputLabel>
						<Select
							value={field.value ?? ''}
							// Radix answers once with an empty value as it mounts a
							// `Select` that starts with none, which would clear the type a
							// restored draft had just filled in — and collapse the block.
							onValueChange={value => value && field.onChange(value)}
							onOpenChange={open => !open && field.onBlur()}
						>
							<SelectTrigger
								id={field.name}
								className="h-control w-full text-base"
								aria-invalid={fieldState.invalid || undefined}
							>
								<SelectValue placeholder="Sélectionnez la pièce" />
							</SelectTrigger>
							<SelectContent>
								{DOCUMENT_TYPE_OPTIONS.map(option => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{fieldState.error && <FieldError errors={[fieldState.error]} />}
					</div>
				)}
			/>

			{spec && (
				<>
					<Controller
						control={control}
						name="documentHolderName"
						render={({ field, fieldState }) => (
							<div className="space-y-2">
								<InputLabel htmlFor={field.name} required className="text-sm">
									Nom du titulaire
								</InputLabel>
								<Input
									{...field}
									id={field.name}
									value={field.value ?? ''}
									placeholder="Ex : KOUASSI Jean"
									autoComplete="off"
									className="h-control text-base"
									aria-invalid={fieldState.invalid || undefined}
								/>
								<p className="text-muted-foreground text-xs leading-relaxed">
									{type === 'found'
										? 'Le nom imprimé sur la pièce, dans n’importe quel ordre.'
										: 'Le nom imprimé sur la pièce — c’est lui qui la retrouvera.'}
								</p>
								{fieldState.error && <FieldError errors={[fieldState.error]} />}
							</div>
						)}
					/>

					{issuer && (
						<Controller
							control={control}
							name="documentIssuer"
							render={({ field, fieldState }) => (
								<div className="space-y-2">
									<InputLabel htmlFor={field.name} className="text-sm">
										{issuer.label}
									</InputLabel>
									<Input
										{...field}
										id={field.name}
										value={field.value ?? ''}
										placeholder={issuer.placeholder}
										className="h-control text-base"
										aria-invalid={fieldState.invalid || undefined}
									/>
									{fieldState.error && (
										<FieldError errors={[fieldState.error]} />
									)}
								</div>
							)}
						/>
					)}

					{/* Folded on the « lost » side so no one reads the empty field as a
					    condition for declaring. */}
					{!showsNumber && (
						<button
							type="button"
							onClick={() => setNumberOpen(true)}
							className="border-border hover:bg-muted flex h-11 w-full items-center justify-center gap-2 rounded-[11px] border-[1.5px] text-sm font-semibold transition-colors"
						>
							<Plus className="h-4 w-4" />
							Je connais le numéro
						</button>
					)}

					{showsNumber && (
						<Controller
							control={control}
							name="documentNumber"
							render={({ field, fieldState }) => (
								<div className="space-y-2">
									<InputLabel htmlFor={field.name} className="text-sm">
										{spec.number.label}
									</InputLabel>
									<Input
										{...field}
										id={field.name}
										value={field.value ?? ''}
										placeholder={spec.number.placeholder}
										autoComplete="off"
										inputMode={
											documentType === 'bank_card' ? 'numeric' : undefined
										}
										className="h-control text-base"
										aria-invalid={fieldState.invalid || undefined}
									/>
									<NumberNotice type={type} />
									{fieldState.error && (
										<FieldError errors={[fieldState.error]} />
									)}
								</div>
							)}
						/>
					)}
				</>
			)}
		</div>
	)
}
