import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { pageMeta } from '@/shared/helpers/page-meta'
import { FINDER_STEPS, GUIDE_STEPS, type GuideStep } from './lost-guide.const'

export function meta() {
	return pageMeta({
		title: "Objet ou document perdu en Côte d'Ivoire : que faire",
		description:
			"Les étapes après la perte d'un objet ou d'une pièce d'identité en Côte d'Ivoire : déclaration aux autorités, annonce publique, et sticker QR pour être joint sans donner son numéro.",
	})
}

function Step({ step, index }: { step: GuideStep; index: number }) {
	return (
		<li className="border-border bg-card rounded-[14px] border p-5">
			<h3 className="flex items-baseline gap-2.5 text-lg font-bold tracking-tight">
				<span className="text-primary-green-text shrink-0">{index + 1}.</span>
				{step.title}
			</h3>
			<p className="text-muted-foreground mt-2 leading-relaxed">{step.body}</p>
			{step.to && step.action && (
				<Link
					to={step.to}
					className="text-primary-green-text mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold"
				>
					{step.action}
					<ArrowRight className="h-4 w-4 shrink-0" />
				</Link>
			)}
		</li>
	)
}

/**
 * « objet perdu côte d'ivoire » is answered by an AI overview that walks through
 * the declaration and then names a platform — and nothing of ours addressed the
 * question, so nothing of ours was quotable for it. Prose with real headings:
 * what a model lifts is a sentence that answers something.
 */
export default function LostGuidePage() {
	return (
		<main className="flex-1 px-4 py-8 lg:py-12">
			<div className="mx-auto w-full max-w-160 space-y-8">
				<header className="space-y-3">
					<h1 className="text-3xl leading-tight font-bold tracking-tight text-balance lg:text-4xl">
						Vous avez perdu un objet ou un document en Côte d&apos;Ivoire
					</h1>
					<p className="text-muted-foreground text-lg leading-relaxed">
						Il y a trois choses à faire, dans cet ordre&nbsp;: déclarer la perte
						si c&apos;est un document officiel, la rendre visible pour que
						quiconque trouve l&apos;objet puisse vous joindre, et regarder ce
						que d&apos;autres ont déjà trouvé.
					</p>
				</header>

				<section className="space-y-3">
					<h2 className="text-xl font-bold tracking-tight">
						Les étapes, dans l&apos;ordre
					</h2>
					<ol className="space-y-3">
						{GUIDE_STEPS.map((step, index) => (
							<Step key={step.title} step={step} index={index} />
						))}
					</ol>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-bold tracking-tight">
						Et si c&apos;est vous qui avez trouvé quelque chose&nbsp;?
					</h2>
					<ol className="space-y-3">
						{FINDER_STEPS.map((step, index) => (
							<Step key={step.title} step={step} index={index} />
						))}
					</ol>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-bold tracking-tight">
						Une pièce d&apos;identité perdue, c&apos;est différent
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						Une photo de pièce livre d&apos;un coup le nom, le numéro et la date
						de naissance sur une page que les moteurs de recherche indexent.
						RetrouveCI n&apos;en publie donc aucune&nbsp;: une annonce de pièce
						porte son type et le nom de son titulaire, ce qui suffit à la
						rapprocher d&apos;une pièce trouvée et à la vérifier à la remise.
					</p>
					<Link
						to="/carte-identite-perdue"
						className="text-primary-green-text mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold"
					>
						Carte d&apos;identité, passeport, carte bancaire
						<ArrowRight className="h-4 w-4 shrink-0" />
					</Link>
				</section>
			</div>
		</main>
	)
}
