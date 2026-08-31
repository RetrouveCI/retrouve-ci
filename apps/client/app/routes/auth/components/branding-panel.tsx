import { Link } from 'react-router'
import { BellRing, QrCode, ShieldCheck } from 'lucide-react'

const ARGUMENTS = [
	{
		icon: BellRing,
		title: 'Alertes instantanées',
		detail: 'Soyez notifié dès qu’un objet correspond au vôtre',
	},
	{
		icon: QrCode,
		title: 'Stickers QR',
		detail: 'Collez-les sur vos objets, on vous joint sans voir votre numéro',
	},
	{
		icon: ShieldCheck,
		title: 'Votre numéro reste privé',
		detail: 'Le contact passe par l’application, jamais en clair',
	},
]

/**
 * One panel, three widths. Below `md` it does not show at all — the page's own
 * bar carries the identity there. Between `md` and `lg` it lies down as a strip
 * above the form, which is the whole point: it used to be `hidden lg:flex`, so a
 * 768 px tablet — the commonest one, in portrait — got a 448 px form marooned in
 * an empty page. From `lg` it stands back up as the left column.
 */
export function BrandingPanel() {
	return (
		<div className="from-primary-green to-primary-green-dark relative hidden overflow-hidden bg-linear-to-br text-white md:flex md:items-center md:gap-5 md:px-6 md:py-5 lg:w-1/2 lg:flex-col lg:items-stretch lg:gap-10 lg:p-12 xl:w-[44%] xl:p-16">
			<div className="pointer-events-none absolute inset-0" aria-hidden>
				<div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
				<div className="absolute -right-10 -bottom-16 h-80 w-80 rounded-full bg-white/8 blur-3xl" />
			</div>

			<Link
				to="/"
				className="relative flex shrink-0 items-center gap-3 lg:w-fit"
			>
				<img
					src="/logo.png"
					alt="RetrouveCI"
					width={42}
					height={42}
					className="h-10 w-10 rounded-[13px] lg:h-[42px] lg:w-[42px]"
				/>
				<span className="hidden text-[22px] font-bold tracking-tight lg:inline">
					Retrouve<span className="text-white/65">CI</span>
				</span>
			</Link>

			<div className="relative flex-1 lg:flex lg:flex-col lg:justify-center lg:gap-8">
				<div>
					<p className="text-[19px] leading-tight font-bold tracking-tight text-balance lg:mb-3.5 lg:text-[40px]">
						Retrouvez ce qui compte pour vous
					</p>
					<p className="text-white0 hidden max-w-md text-[17px] leading-relaxed lg:block">
						La plateforme d’objets perdus et retrouvés en Côte d’Ivoire.
					</p>
				</div>

				<ul className="hidden flex-col gap-4 lg:flex">
					{ARGUMENTS.map(({ icon: Icon, title, detail }) => (
						<li key={title} className="flex items-center gap-4">
							<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12">
								<Icon className="h-5 w-5" />
							</span>
							<span>
								<span className="block text-[15px] font-semibold">{title}</span>
								<span className="block text-[13.5px] text-white">{detail}</span>
							</span>
						</li>
					))}
				</ul>
			</div>

			{/* The canvas closes the panel with two live counters, badged CHIFFRES
			    RÉELS. R30 wires them, or leaves the band out: the three that stood
			    here — 2,500+ objets, 15,000+ utilisateurs, 50+ villes — were written
			    by hand before the Abidjan pilot had started, on the very screen that
			    asks for trust. They are not carried over. */}
		</div>
	)
}
