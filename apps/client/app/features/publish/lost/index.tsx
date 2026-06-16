import { Link, Form } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { getFormProps } from '@conform-to/react'
import { ArrowLeft } from 'lucide-react'
import { LocationDateSection } from '../components/location-date-section'
import { ContactSection } from '../components/contact-section'
import { ObjectInfoSection } from '../components/object-info-section'
import { PublishPageHeader } from '../components/publish-page-header'
import { PublishSidebar } from '../components/publish-sidebar'
import { PublishFormActions } from '../components/publish-form-actions'
import { usePublishForm } from '../hooks/use-publish-form'
import { LOST_TIPS } from '../publish.const'
import { publishLoader } from '../servers/publish.loader'
import { publishAction } from '../servers/publish.action'
import type { Route } from './+types/index'

const ACCENT = 'varaccent-orange'

export const loader = publishLoader

export const action = ({ request }: Route.ActionArgs) =>
	publishAction(request, 'lost')

export function meta() {
	return [
		{ title: 'Publier un objet perdu — RetrouveCI' },
		{
			name: 'description',
			content:
				"Décrivez l'objet que vous avez perdu pour que quelqu'un puisse vous aider.",
		},
	]
}

const progressItems = (fields: ReturnType<typeof usePublishForm>['fields']) => [
	{ label: 'Titre', done: !!fields.title.value },
	{ label: "Type d'objet", done: !!fields.objectType.value },
	{
		label: 'Description (20 car. min)',
		done: (fields.description.value?.length ?? 0) >= 20,
	},
	{ label: 'Lieu de perte', done: !!fields.ville.value },
	{ label: 'Votre nom', done: !!fields.name.value },
	{ label: 'WhatsApp', done: !!fields.whatsapp.value },
]

export default function PublishLostPage() {
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
							icon={AlertCircle}
							iconBgClass="bg-accent-orange/10"
							iconColorClass="text-accent-orange"
							title="Objet perdu"
							description="Décrivez votre objet pour que quelqu'un puisse vous aider."
						/>

						<Form method="post" {...getFormProps(form)} className="space-y-5">
							<ObjectInfoSection
								title={fields.title}
								objectType={fields.objectType}
								description={fields.description}
								imagePreview={imagePreview}
								setImagePreview={setImagePreview}
								handleImageChange={handleImageChange}
								accentColor={ACCENT}
								counterAccentClass="text-accent-orange"
								descriptionPlaceholder="Couleur, marque, signes distinctifs, contenu..."
								photoVariant="optional"
							/>

							<LocationDateSection
								ville={fields.ville}
								commune={fields.commune}
								date={fields.date}
								dateLabel="Date de perte"
								sectionTitle="Lieu & date de perte"
							/>

							<ContactSection name={fields.name} whatsapp={fields.whatsapp} />

							<PublishFormActions
								isSubmitting={isSubmitting}
								submitClassName="bg-accent-orange hover:bg-accent-orange-dark"
							/>
						</Form>
					</div>

					<PublishSidebar
						progress={progress}
						items={progressItems(fields)}
						accentColor={ACCENT}
						objectType={fields.objectType.value ?? ''}
						ville={fields.ville.value ?? ''}
						formType="perdu"
						tips={LOST_TIPS}
						hint="Remplissez le type d'objet et la ville pour voir les correspondances."
					/>
				</div>
			</div>
		</main>
	)
}
