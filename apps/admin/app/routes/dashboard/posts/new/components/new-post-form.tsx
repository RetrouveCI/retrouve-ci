import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { toast } from 'sonner'
import {
	BellOff,
	CheckCircle2,
	ImagePlus,
	Loader2,
	Search,
	X,
} from 'lucide-react'
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Checkbox,
	Field,
	FieldError,
	FieldLabel,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { cn } from '@app/ui/utils'
import {
	DOCUMENT_TYPES,
	LOST_ITEM_CATEGORIES,
	MAX_PHOTOS,
	refusesPhotos,
} from '@app/contracts/lost-items'
import {
	FormInputField,
	FormRootError,
	FormTextareaField,
} from '@app/ui/components/form'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { CATEGORY_LABELS, DOCUMENT_TYPE_LABELS } from '../../posts.const'
import type { Post } from '../../types/posts.types'
import {
	newPostSchema,
	type NewPostData,
	type NewPostInput,
} from '../new-post.schema'
import {
	ALLOWED_PHOTO_TYPES,
	MAX_PHOTO_SIZE,
	TYPE_OPTIONS,
} from '../new-post.const'
import type { action } from '../_index'

const DEFAULT_VALUES: NewPostInput = {
	type: 'found',
	category: '',
	title: '',
	description: '',
	ville: '',
	commune: '',
	eventDate: '',
	contactName: 'Équipe RetrouveCI',
	contactWhatsapp: '',
	documentType: '',
	documentHolderName: '',
	documentNumber: '',
	documentIssuer: '',
	postedFor: '',
}

const PIECE_FIELDS = [
	'documentType',
	'documentHolderName',
	'documentNumber',
	'documentIssuer',
] as const

function Section({
	step,
	title,
	hint,
	children,
}: {
	step: string
	title: string
	hint?: string
	children: React.ReactNode
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<span className="bg-primary-green/10 text-primary-green-text rounded px-1.5 font-mono text-xs">
						{step}
					</span>
					{title}
				</CardTitle>
				{hint && <CardDescription>{hint}</CardDescription>}
			</CardHeader>
			<CardContent className="space-y-4">{children}</CardContent>
		</Card>
	)
}

function Note({ children }: { children: React.ReactNode }) {
	return <p className="text-muted-foreground -mt-2 text-xs">{children}</p>
}

/**
 * The public form's fields and rules on one page. Its three steps exist for a
 * thumb on a phone; at a desk they only add clicks, so each section keeps the
 * number of the public step it comes from instead.
 */
export function NewPostForm() {
	const navigate = useNavigate()
	const submitted = useRef(false)
	const fetcher = useActionFetcher<typeof action, NewPostInput, Post>()

	const form = useForm<NewPostInput, unknown, NewPostData>({
		resolver: standardSchemaResolver(newPostSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: DEFAULT_VALUES,
		errors: fetcher.errors,
	})

	const category = useWatch({ control: form.control, name: 'category' })
	const isDocument = category === 'documents'
	const [carriesPiece, setCarriesPiece] = useState(false)
	const showPiece = isDocument || carriesPiece

	const [files, setFiles] = useState<File[]>([])
	const [photoError, setPhotoError] = useState<string | null>(null)
	const previews = useMemo(
		() => files.map(file => URL.createObjectURL(file)),
		[files],
	)
	useEffect(
		() => () => previews.forEach(url => URL.revokeObjectURL(url)),
		[previews],
	)

	useEffect(() => {
		if (!submitted.current || !fetcher.isOk) return

		submitted.current = false
		toast.success('Annonce publiée — elle est déjà visible')
		void navigate('/posts')
	}, [fetcher.isOk, navigate])

	const addFiles = (list: FileList | null) => {
		if (!list) return

		const incoming = [...list]
		const fits = (file: File) =>
			ALLOWED_PHOTO_TYPES.includes(file.type) && file.size <= MAX_PHOTO_SIZE

		setPhotoError(
			incoming.every(fits) ? null : 'Photos JPEG, PNG ou WebP de 5 Mo au plus.',
		)
		setFiles(current =>
			[...current, ...incoming.filter(fits)].slice(0, MAX_PHOTOS),
		)
	}

	const togglePiece = (checked: boolean) => {
		setCarriesPiece(checked)
		if (!checked) for (const name of PIECE_FIELDS) form.setValue(name, '')
	}

	const onSubmit = (values: NewPostData) => {
		const body = new FormData()
		for (const [name, value] of Object.entries(form.getValues())) {
			body.set(name, String(value ?? ''))
		}
		if (!refusesPhotos(values.category)) {
			for (const file of files) body.append('photos', file)
		}

		submitted.current = true
		void fetcher.submit(body, {
			method: 'post',
			encType: 'multipart/form-data',
		})
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="grid items-start gap-4 lg:grid-cols-[1fr_300px]"
		>
			<div className="space-y-4">
				<FormRootError
					title="Impossible de publier l’annonce"
					message={form.formState.errors.root?.message}
				/>

				<Section step="1" title="Type d’annonce">
					<Controller
						control={form.control}
						name="type"
						render={({ field }) => (
							<div
								role="radiogroup"
								aria-label="Type d’annonce"
								className="grid gap-2 sm:grid-cols-2"
							>
								{TYPE_OPTIONS.map(option => (
									<button
										key={option.value}
										type="button"
										role="radio"
										aria-checked={field.value === option.value}
										onClick={() => field.onChange(option.value)}
										className={cn(
											'rounded-lg border p-3 text-left transition-colors',
											field.value === option.value
												? 'border-primary-green bg-primary-green/5'
												: 'hover:bg-muted/50',
										)}
									>
										<span className="block text-sm font-semibold">
											{option.label}
										</span>
										<span className="text-muted-foreground block text-xs">
											{option.hint}
										</span>
									</button>
								))}
							</div>
						)}
					/>
				</Section>

				<Section step="2" title="L’objet" hint="Étape 1 du formulaire public">
					<Controller
						control={form.control}
						name="category"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Catégorie</FieldLabel>
								<Select
									value={field.value}
									onValueChange={field.onChange}
									onOpenChange={open => !open && field.onBlur()}
								>
									<SelectTrigger
										id={field.name}
										aria-invalid={fieldState.invalid}
									>
										<SelectValue placeholder="Choisir une catégorie" />
									</SelectTrigger>
									<SelectContent>
										{LOST_ITEM_CATEGORIES.map(value => (
											<SelectItem key={value} value={value}>
												{CATEGORY_LABELS[value]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.error && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>
					<FormInputField
						control={form.control}
						name="title"
						label="Titre"
						required
						maxLength={120}
					/>
					<FormTextareaField
						control={form.control}
						name="description"
						label="Description"
						placeholder="Où, quand, dans quel état — ce qui permet de le reconnaître."
					/>
					<Note>
						20 caractères au moins, sauf pour une pièce d’identité : son type et
						son titulaire suffisent.
					</Note>
				</Section>

				{!isDocument && (
					<Field orientation="horizontal" className="gap-2 px-1">
						<Checkbox
							id="carries-piece"
							checked={carriesPiece}
							onCheckedChange={checked => togglePiece(checked === true)}
						/>
						<FieldLabel htmlFor="carries-piece" className="cursor-pointer">
							L’objet contient une pièce d’identité
						</FieldLabel>
					</Field>
				)}

				{showPiece && (
					<Section
						step="3"
						title="La pièce"
						hint="Le nom du titulaire est ce qui pèse le plus dans le rapprochement."
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<Controller
								control={form.control}
								name="documentType"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Type de pièce</FieldLabel>
										<Select
											value={field.value ?? ''}
											onValueChange={field.onChange}
											onOpenChange={open => !open && field.onBlur()}
										>
											<SelectTrigger
												id={field.name}
												aria-invalid={fieldState.invalid}
											>
												<SelectValue placeholder="Choisir un type" />
											</SelectTrigger>
											<SelectContent>
												{DOCUMENT_TYPES.map(value => (
													<SelectItem key={value} value={value}>
														{DOCUMENT_TYPE_LABELS[value]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{fieldState.error && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<FormInputField
								control={form.control}
								name="documentHolderName"
								label="Nom du titulaire"
							/>
							<FormInputField
								control={form.control}
								name="documentNumber"
								label="Numéro (optionnel)"
							/>
							<FormInputField
								control={form.control}
								name="documentIssuer"
								label="Émetteur (optionnel)"
								placeholder="ONECI, préfecture…"
							/>
						</div>
						<Note>
							Le numéro n’est jamais affiché publiquement : il sert au
							rapprochement.
						</Note>
					</Section>
				)}

				{isDocument ? (
					<p className="text-muted-foreground px-1 text-xs">
						Une annonce de pièce d’identité est publiée sans photo : le type et
						le nom du titulaire suffisent à la retrouver.
					</p>
				) : (
					<Section step="4" title="Photos" hint={`Jusqu’à ${MAX_PHOTOS}.`}>
						<div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
							{previews.map((url, index) => (
								<div
									key={url}
									className="bg-muted relative aspect-square overflow-hidden rounded-md border"
								>
									<img
										src={url}
										alt=""
										className="h-full w-full object-cover"
									/>
									<button
										type="button"
										aria-label={`Retirer la photo ${index + 1}`}
										onClick={() =>
											setFiles(current => current.filter((_, i) => i !== index))
										}
										className="bg-background/90 absolute top-1 right-1 rounded-full border p-0.5"
									>
										<X className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
							{files.length < MAX_PHOTOS && (
								<label className="hover:border-primary-green text-muted-foreground flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs">
									<ImagePlus className="h-4 w-4" />
									Ajouter
									<input
										type="file"
										accept={ALLOWED_PHOTO_TYPES.join(',')}
										multiple
										className="sr-only"
										onChange={event => {
											addFiles(event.target.files)
											event.target.value = ''
										}}
									/>
								</label>
							)}
						</div>
						{photoError && (
							<p role="alert" className="text-destructive text-xs">
								{photoError}
							</p>
						)}
					</Section>
				)}

				<Section
					step="5"
					title="Le lieu et la date"
					hint="Étape 2 du formulaire public"
				>
					<div className="grid gap-4 sm:grid-cols-3">
						<FormInputField
							control={form.control}
							name="ville"
							label="Ville"
							required
						/>
						<FormInputField
							control={form.control}
							name="commune"
							label="Commune ou quartier"
						/>
						<FormInputField
							control={form.control}
							name="eventDate"
							label="Date des faits"
							type="date"
							required
						/>
					</div>
				</Section>

				<Section
					step="6"
					title="Le contact"
					hint="Étape 3 du formulaire public"
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<FormInputField
							control={form.control}
							name="contactName"
							label="Nom affiché"
							required
						/>
						<FormInputField
							control={form.control}
							name="contactWhatsapp"
							label="Numéro WhatsApp"
							type="tel"
							inputMode="tel"
							placeholder="07 XX XX XX XX"
							required
						/>
					</div>
					<Note>
						La ligne de l’équipe, ou celle de la personne à joindre directement.
					</Note>
					<FormInputField
						control={form.control}
						name="postedFor"
						label="Déposée pour (optionnel)"
						placeholder="La personne au nom de qui l’équipe publie"
					/>
					<Note>
						Jamais affiché publiquement — il sert au bureau à la restitution.
					</Note>
				</Section>
			</div>

			<aside className="space-y-4 lg:sticky lg:top-20">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">À la publication</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2.5 text-sm">
							<li className="flex gap-2">
								<CheckCircle2 className="text-primary-green-text mt-0.5 h-4 w-4 shrink-0" />
								<span>Visible aussitôt, sans passer par la modération.</span>
							</li>
							<li className="flex gap-2">
								<Search className="text-primary-green-text mt-0.5 h-4 w-4 shrink-0" />
								<span>Le rapprochement se lance.</span>
							</li>
							<li className="flex gap-2">
								<CheckCircle2 className="text-primary-green-text mt-0.5 h-4 w-4 shrink-0" />
								<span>
									Badge « Équipe RetrouveCI » sur la carte et le détail.
								</span>
							</li>
							<li className="text-muted-foreground flex gap-2">
								<BellOff className="mt-0.5 h-4 w-4 shrink-0" />
								<span>Aucune notification au bureau.</span>
							</li>
						</ul>
						<p className="text-muted-foreground mt-4 text-xs">
							L’annonce appartient au compte de l’équipe, pas au vôtre : elle
							survit à votre départ.
						</p>
					</CardContent>
				</Card>

				<Button
					type="submit"
					className="w-full"
					disabled={fetcher.isSubmitting}
				>
					{fetcher.isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Publication…
						</>
					) : (
						'Publier maintenant'
					)}
				</Button>
			</aside>
		</form>
	)
}
