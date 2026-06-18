import { Form, Link } from 'react-router'
import { getFormProps, getTextareaProps } from '@conform-to/react'
import {
	AlertCircle,
	CheckCircle,
	ArrowLeft,
	Loader2,
	Package,
} from 'lucide-react'
import { Button, Textarea } from '@retrouve-ci/ui/components'
import {
	InputField,
	FieldError,
	InputLabel,
} from '@retrouve-ci/ui/components/form'
import { cn } from '@retrouve-ci/ui/utils'
import { SectionHeader } from '@/features/publish/components/section-header'
import { LocationDateSection } from '@/features/publish/components/location-date-section'
import { ContactSection } from '@/features/publish/components/contact-section'
import { PublishPageHeader } from '@/features/publish/components/publish-page-header'
import { ImageUpload } from '@/features/publish/components/image-upload'
import { OBJECT_TYPES } from '@/features/publish/publish.const'
import { useEditPostForm } from './hooks/use-edit-post-form'
import { editPostLoader } from './servers/edit-post.loader'
import { editPostAction } from './servers/edit-post.action'
import type { Route } from './+types/index'

export const loader = ({ request, params }: Route.LoaderArgs) =>
	editPostLoader(request, params.id)

export const action = ({ request, params }: Route.ActionArgs) =>
	editPostAction(request, params.id)

export function meta() {
	return [{ title: "Modifier l'annonce — RetrouveCI" }]
}

export default function EditPostPage({ loaderData }: Route.ComponentProps) {
	const { item } = loaderData
	const isLost = item.type === 'lost'
	const categoryLabel =
		OBJECT_TYPES.find(t => t.value === item.category)?.label ?? item.category

	const {
		form,
		fields,
		imagePreview,
		setImagePreview,
		handleImageChange,
		isSubmitting,
	} = useEditPostForm(
		{
			title: item.title,
			objectType: item.category,
			description: item.description,
			ville: item.ville,
			commune: item.commune ?? undefined,
			date: item.eventDate.slice(0, 10),
			name: item.contactName,
			whatsapp: item.contactWhatsapp.replace(/^\+225/, ''),
		},
		item.photos[0] ?? null,
	)

	return (
		<main className="bg-muted/20 flex-1">
			<div className="container mx-auto px-4 py-8 md:py-12">
				<Link
					to="/account/posts"
					className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Mes annonces
				</Link>

				<div className="mx-auto max-w-2xl space-y-6">
					<PublishPageHeader
						icon={isLost ? AlertCircle : CheckCircle}
						iconBgClass={isLost ? 'bg-accent-orange/10' : 'bg-primary-green/10'}
						iconColorClass={
							isLost ? 'text-accent-orange' : 'text-primary-green'
						}
						title="Modifier l'annonce"
						description="Corrigez les informations avant validation par l'administrateur."
					/>

					<Form method="post" {...getFormProps(form)} className="space-y-5">
						<input
							type="hidden"
							name={fields.objectType.name}
							value={item.category}
						/>

						<div className="bg-background space-y-5 rounded-2xl border p-6">
							<SectionHeader
								icon={Package}
								title="Informations sur l'objet"
								accentColor={
									isLost ? 'var(--accent-orange)' : 'var(--primary-green)'
								}
							/>

							<InputField
								field={fields.title}
								label="Titre"
								required
								placeholder="Ex : iPhone 14 Pro noir"
							/>

							<div className="space-y-2">
								<InputLabel>Type d&apos;objet</InputLabel>
								<div className="bg-muted/50 text-muted-foreground flex h-11 items-center rounded-md border px-3 text-sm">
									{categoryLabel}
								</div>
							</div>

							<div className="space-y-2">
								<InputLabel htmlFor={fields.description.id} required>
									Description
								</InputLabel>
								<Textarea
									{...getTextareaProps(fields.description)}
									key={fields.description.key}
									placeholder={
										isLost
											? 'Couleur, marque, signes distinctifs, contenu...'
											: "Couleur, marque, signes distinctifs, état de l'objet..."
									}
									className="min-h-27.5 resize-none"
								/>
								<p
									className={cn(
										'text-xs',
										(fields.description.value?.length ?? 0) >= 20
											? isLost
												? 'text-accent-orange'
												: 'text-primary-green'
											: 'text-muted-foreground',
									)}
								>
									{(fields.description.value?.length ?? 0) >= 20
										? '✓ Suffisant'
										: `Minimum 20 caractères (${fields.description.value?.length ?? 0}/20)`}
								</p>
								<FieldError errors={fields.description.errors} />
							</div>

							<div className="space-y-2">
								<InputLabel>
									Photo{' '}
									{isLost ? (
										<span className="text-muted-foreground text-xs font-normal">
											(optionnel)
										</span>
									) : (
										<span className="border-primary-green/20 bg-primary-green/10 text-primary-green ml-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold">
											Recommandé
										</span>
									)}
								</InputLabel>
								<ImageUpload
									preview={imagePreview}
									onRemove={() => setImagePreview(null)}
									onChange={handleImageChange}
									variant={isLost ? 'optional' : 'recommended'}
									accentColor={
										isLost ? 'var(--accent-orange)' : 'var(--primary-green)'
									}
								/>
							</div>
						</div>

						<LocationDateSection
							ville={fields.ville}
							commune={fields.commune}
							date={fields.date}
							dateLabel={isLost ? 'Date de perte' : 'Date de la trouvaille'}
							sectionTitle={
								isLost ? 'Lieu & date de perte' : 'Lieu & date de la trouvaille'
							}
							accentColor={
								isLost ? 'var(--accent-orange)' : 'var(--primary-green)'
							}
						/>

						<ContactSection
							name={fields.name}
							whatsapp={fields.whatsapp}
							accentColor={
								isLost ? 'var(--accent-orange)' : 'var(--primary-green)'
							}
							showPrivacyNote={!isLost}
						/>

						{form.errors && form.errors.length > 0 && (
							<p className="text-destructive text-sm">{form.errors[0]}</p>
						)}

						<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
							<Button type="button" variant="outline" asChild>
								<Link to="/account/posts">Annuler</Link>
							</Button>
							<Button
								type="submit"
								className={cn(
									'h-12 text-white sm:flex-1',
									isLost
										? 'bg-accent-orange hover:bg-accent-orange-dark'
										: 'bg-primary-green hover:bg-primary-green-dark',
								)}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Enregistrement...
									</>
								) : (
									'Enregistrer les modifications'
								)}
							</Button>
						</div>
					</Form>
				</div>
			</div>
		</main>
	)
}
