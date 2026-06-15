import { Link, Form } from 'react-router'
import { CheckCircle } from 'lucide-react'
import { getFormProps } from '@conform-to/react'
import { ArrowLeft } from 'lucide-react'
import { LocationDateSection } from '../components/location-date-section'
import { ContactSection } from '../components/contact-section'
import { ObjectInfoSection } from '../components/object-info-section'
import { PublishPageHeader } from '../components/publish-page-header'
import { PublishSidebar } from '../components/publish-sidebar'
import { PublishFormActions } from '../components/publish-form-actions'
import { usePublishForm } from '../hooks/use-publish-form'
import { FOUND_TIPS } from '../publish.const'
import { publishLoader } from '../servers/publish.loader'
import { publishAction } from '../servers/publish.action'
import type { Route } from './+types/index'

const ACCENT = 'varprimary-green'

export const loader = publishLoader

export const action = ({ request }: Route.ActionArgs) =>
	publishAction(request, 'found')

export function meta() {
	return [
		{ title: 'Publier un objet retrouvé — RetrouveCI' },
		{
			name: 'description',
			content:
				"Décrivez l'objet que vous avez retrouvé pour aider son propriétaire à le récupérer.",
		},
	]
}

const progressItems = (
	fields: ReturnType<typeof usePublishForm>['fields'],
) => [
	{ label: 'Titre', done: !!fields.title.value },
	{ label: "Type d'objet", done: !!fields.objectType.value },
	{
		label: 'Description (20 car. min)',
		done: (fields.description.value?.length ?? 0) >= 20,
	},
	{ label: 'Lieu de la trouvaille', done: !!fields.ville.value },
	{ label: 'Votre nom', done: !!fields.name.value },
	{ label: 'WhatsApp', done: !!fields.whatsapp.value },
]

export default function PublishFoundPage() {
	const {
		form,
		fields,
		imagePreview,
		setImagePreview,
		handleImageChange,
		progress,
		isSubmitting,
	} = usePublishForm()

	return (
		<main className="bg-muted/20 flex-1">
			<div className="container mx-auto px-4 py-8 md:py-12">
				<Link
					to="/publish"
					className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour
				</Link>

				<div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
					<div className="space-y-6">
						<PublishPageHeader
							icon={CheckCircle}
							iconBgClass="bg-primary-green/10"
							iconColorClass="text-primary-green"
							title="Objet retrouvé"
							description="Aidez le propriétaire à récupérer son bien."
						/>

						<Form
							method="post"
							{...getFormProps(form)}
							className="space-y-5"
						>
							<ObjectInfoSection
								title={fields.title}
								objectType={fields.objectType}
								description={fields.description}
								imagePreview={imagePreview}
								setImagePreview={setImagePreview}
								handleImageChange={handleImageChange}
								accentColor={ACCENT}
								counterAccentClass="text-primary-green"
								descriptionPlaceholder="Couleur, marque, signes distinctifs, état de l'objet..."
								photoVariant="recommended"
								photoBadge="Recommandé"
								photoBadgeClassName="border-primary-green/20 bg-primary-green/10 text-primary-green"
							/>

							<LocationDateSection
								ville={fields.ville}
								commune={fields.commune}
								date={fields.date}
								dateLabel="Date de la trouvaille"
								sectionTitle="Lieu & date de la trouvaille"
							/>

							<ContactSection
								name={fields.name}
								whatsapp={fields.whatsapp}
								showPrivacyNote
							/>

							<PublishFormActions
								isSubmitting={isSubmitting}
								submitClassName="bg-primary-green hover:bg-primary-green-dark"
							/>
						</Form>
					</div>

					<PublishSidebar
						progress={progress}
						items={progressItems(fields)}
						accentColor={ACCENT}
						objectType={fields.objectType.value ?? ''}
						ville={fields.ville.value ?? ''}
						commune={fields.commune.value ?? ''}
						formType="retrouve"
						tips={FOUND_TIPS}
						hint="Remplissez le type d'objet et la ville pour voir les correspondances."
					/>
				</div>
			</div>
		</main>
	)
}
