import { Mail, MessageSquare, MapPin } from 'lucide-react'

const channels = [
	{
		icon: Mail,
		title: 'Email',
		value: 'support@retrouveci.com',
		detail: 'Réponse sous 24h ouvrées',
		color: 'text-primary-green',
		bg: 'bg-primary-green/10',
		href: 'mailto:support@retrouveci.com',
	},
	{
		icon: MessageSquare,
		title: 'WhatsApp',
		value: '225 07 58 99 14 27',
		detail: 'Lun–Ven, 8h–18h',
		color: 'text-accent-orange',
		bg: 'bg-accent-orange/10',
		href: 'https://wa.me/2250758991427',
	},
	{
		icon: MapPin,
		title: 'Adresse',
		value: 'Cocody, Abidjan',
		detail: "Côte d'Ivoire",
		color: 'text-foreground',
		bg: 'bg-muted',
		href: null,
	},
]

export function ContactChannels() {
	return (
		<>
			{channels.map(ch => {
				const Icon = ch.icon
				const content = (
					<div className="bg-background group flex items-center gap-4 rounded-2xl border p-5 transition-transform duration-200 hover:-translate-y-0.5">
						<div
							className={`h-11 w-11 rounded-xl ${ch.bg} flex shrink-0 items-center justify-center`}
						>
							<Icon className={`h-5 w-5 ${ch.color}`} />
						</div>
						<div className="min-w-0">
							<p className="text-muted-foreground text-xs">{ch.title}</p>
							<p className="truncate text-sm font-semibold">{ch.value}</p>
							<p className="text-muted-foreground text-xs">{ch.detail}</p>
						</div>
					</div>
				)
				return ch.href ? (
					<a
						key={ch.title}
						href={ch.href}
						target="_blank"
						rel="noopener noreferrer"
					>
						{content}
					</a>
				) : (
					<div key={ch.title}>{content}</div>
				)
			})}
		</>
	)
}
