'use client'

import { Button, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MatchingSuggestions } from '@/components/matching-suggestions'
import { ImageUpload } from '@/components/publish-form/image-upload'
import { LocationDateSection } from '@/components/publish-form/location-date-section'
import { ContactSection } from '@/components/publish-form/contact-section'
import { FormProgress } from '@/components/publish-form/form-progress'
import { TipsPanel } from '@/components/publish-form/tips-panel'
import { usePublishForm } from '@/hooks/use-publish-form'
import { cn } from '@retrouve-ci/ui/utils'

const ACCENT = 'varaccent-orange'

const objectTypes = [
	{ value: 'phone', label: 'Téléphone' },
	{ value: 'keys', label: 'Clés' },
	{ value: 'wallet', label: 'Portefeuille' },
	{ value: 'bag', label: 'Sac' },
	{ value: 'electronics', label: 'Électronique' },
	{ value: 'clothing', label: 'Vêtement' },
	{ value: 'jewelry', label: 'Bijoux' },
	{ value: 'documents', label: 'Documents' },
	{ value: 'other', label: 'Autre' },
]

const tips = [
	'Soyez précis sur la couleur et la marque',
	'Ajoutez une photo pour de meilleurs résultats',
	'Mentionnez le lieu exact de la perte',
	'Vos coordonnées restent privées',
]

const progressItems = (
	formData: ReturnType<typeof usePublishForm>['formData'],
) => [
	{ label: "Type d'objet", done: !!formData.objectType },
	{
		label: 'Description (20 car. min)',
		done: formData.description.length >= 20,
	},
	{ label: 'Lieu de perte', done: !!formData.ville },
	{ label: 'Votre nom', done: !!formData.name },
	{ label: 'WhatsApp', done: !!formData.whatsapp },
]

export default function PublierPerduPage() {
	const router = useRouter()

	const {
		formData,
		update,
		imagePreview,
		setImagePreview,
		handleImageChange,
		progress,
		isSubmitting,
		handleSubmit,
	} = usePublishForm('Votre annonce est maintenant visible par tous.')

	return (
		<>
			<Header />
			<main className="bg-muted/20 flex-1">
				<div className="container mx-auto px-4 py-8 md:py-12">
					<Link
						href="/publish"
						className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour
					</Link>

					<div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
						<div className="space-y-6">
							<div className="flex items-center gap-3 pb-2">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-orange/10">
									<AlertCircle className="h-5 w-5 text-accent-orange" />
								</div>
								<div>
									<h1 className="text-2xl font-bold">Objet perdu</h1>
									<p className="text-muted-foreground text-sm">
										Décrivez votre objet pour que quelqu&apos;un puisse vous
										aider.
									</p>
								</div>
							</div>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="bg-background space-y-5 rounded-2xl border p-6">
									<h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
										Informations sur l&apos;objet
									</h2>

									<div className="space-y-2">
										<Label htmlFor="objectType">
											Type d&apos;objet{' '}
											<span className="text-destructive">*</span>
										</Label>
										<Select
											value={formData.objectType}
											onValueChange={update('objectType')}
										>
											<SelectTrigger id="objectType" className="h-11">
												<SelectValue placeholder="Sélectionnez un type" />
											</SelectTrigger>
											<SelectContent>
												{objectTypes.map(t => (
													<SelectItem key={t.value} value={t.value}>
														{t.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description">
											Description <span className="text-destructive">*</span>
										</Label>
										<Textarea
											id="description"
											placeholder="Couleur, marque, signes distinctifs, contenu..."
											value={formData.description}
											onChange={e => update('description')(e.target.value)}
											className="min-h-27.5 resize-none"
										/>
										<p
											className={cn(
												'text-xs',
												formData.description.length >= 20
													? 'text-accent-orange'
													: 'text-muted-foreground',
											)}
										>
											{formData.description.length >= 20
												? '✓ Suffisant'
												: `Minimum 20 caractères (${formData.description.length}/20)`}
										</p>
									</div>

									<div className="space-y-2">
										<Label>
											Photo{' '}
											<span className="text-muted-foreground text-xs font-normal">
												(optionnel)
											</span>
										</Label>
										<ImageUpload
											preview={imagePreview}
											onRemove={() => setImagePreview(null)}
											onChange={handleImageChange}
											variant="optional"
											accentColor={ACCENT}
										/>
									</div>
								</div>

								<LocationDateSection
									ville={formData.ville}
									commune={formData.commune}
									date={formData.date}
									dateLabel="Date de perte"
									sectionTitle="Lieu & date de perte"
									onVilleChange={update('ville')}
									onCommuneChange={update('commune')}
									onDateChange={update('date')}
								/>

								<ContactSection
									name={formData.name}
									whatsapp={formData.whatsapp}
									onNameChange={update('name')}
									onWhatsappChange={update('whatsapp')}
								/>

								<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
									<Button
										type="button"
										variant="outline"
										onClick={() => router.back()}
									>
										Annuler
									</Button>
									<Button
										type="submit"
										className="h-12 bg-accent-orange text-white hover:bg-accent-orange-dark sm:flex-1"
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Publication...
											</>
										) : (
											"Publier l'annonce"
										)}
									</Button>
								</div>
							</form>
						</div>

						<div className="space-y-4 self-start lg:sticky lg:top-24">
							<FormProgress
								progress={progress}
								items={progressItems(formData)}
								accentColor={ACCENT}
							/>

							{formData.objectType && formData.ville ? (
								<MatchingSuggestions
									objectType={formData.objectType}
									ville={formData.ville}
									commune={formData.commune}
									formType="perdu"
								/>
							) : (
								<TipsPanel
									tips={tips}
									accentColor={ACCENT}
									hint="Remplissez le type d'objet et la ville pour voir les correspondances."
								/>
							)}
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	)
}
