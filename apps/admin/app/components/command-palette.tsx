import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
	Box,
	FileText,
	Mail,
	Plus,
	QrCode,
	Search,
	SunMoon,
	User,
	type LucideIcon,
} from 'lucide-react'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@app/ui/components'
import { useTheme } from '@/context/theme'
import { NAV_ITEMS, PALETTE_ACTIONS } from '@/shared/constants/navigation'
import { matchesQuery } from '@/shared/helpers/palette-match'
import { usePaletteSearch } from '@/routes/dashboard/palette/hooks/use-palette-search'
import type { PaletteHitKind } from '@/routes/dashboard/palette/types/palette.types'

const HIT_ICONS: Record<PaletteHitKind, LucideIcon> = {
	listing: FileText,
	order: Box,
	sticker: QrCode,
	message: Mail,
	user: User,
}

const THEME_KEYWORDS = 'Basculer le thème sombre clair'

/**
 * The F7 artefact's palette. cmdk's own filter is off: it would hide an API
 * hit whose label does not hold the query — a message found by its e-mail.
 */
export function CommandPalette() {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const navigate = useNavigate()
	const { toggleTheme } = useTheme()
	const { hits, searching } = usePaletteSearch(query)

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault()
				setOpen(current => !current)
			}
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [])

	const close = () => {
		setOpen(false)
		setQuery('')
	}

	const go = (to: string) => {
		close()
		void navigate(to)
	}

	const pages = NAV_ITEMS.filter(item =>
		matchesQuery(`${item.label} ${item.keywords}`, query),
	)
	const actions = PALETTE_ACTIONS.filter(action =>
		matchesQuery(`${action.label} ${action.keywords}`, query),
	)
	const offersTheme = matchesQuery(THEME_KEYWORDS, query)

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Rechercher ou aller à…"
				className="bg-muted/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs transition-colors"
			>
				<Search className="h-3.5 w-3.5" />
				<span className="hidden md:inline">Rechercher ou aller à…</span>
				<kbd className="bg-card hidden rounded border border-b-2 px-1.5 font-mono text-[10px] md:inline">
					⌘K
				</kbd>
			</button>

			<Dialog
				open={open}
				onOpenChange={next => (next ? setOpen(true) : close())}
			>
				<DialogContent
					className="overflow-hidden p-0 sm:max-w-lg"
					showCloseButton={false}
				>
					<DialogTitle className="sr-only">Palette de commandes</DialogTitle>
					<DialogDescription className="sr-only">
						Aller à une page, retrouver un sticker, une commande, un message ou
						une personne.
					</DialogDescription>
					<Command
						shouldFilter={false}
						className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:uppercase"
					>
						<CommandInput
							value={query}
							onValueChange={setQuery}
							placeholder="Sticker, commande, personne, page, action…"
							aria-label="Rechercher"
						/>
						<CommandList className="max-h-96">
							<CommandEmpty>
								{searching ? 'Recherche…' : `Rien pour « ${query.trim()} »`}
							</CommandEmpty>

							{pages.length > 0 && (
								<CommandGroup heading="Aller à">
									{pages.map(item => {
										const Icon = item.icon

										return (
											<CommandItem
												key={item.to}
												value={`page ${item.to}`}
												onSelect={() => go(item.to)}
											>
												<Icon />
												{item.label}
											</CommandItem>
										)
									})}
								</CommandGroup>
							)}

							{hits.length > 0 && (
								<CommandGroup heading="Résultats">
									{hits.map(hit => {
										const Icon = HIT_ICONS[hit.kind]

										return (
											<CommandItem
												key={`${hit.kind}-${hit.id}`}
												value={`${hit.kind} ${hit.id}`}
												onSelect={() => go(hit.to)}
											>
												<Icon />
												<span className="truncate">{hit.label}</span>
												<CommandShortcut className="font-mono tracking-normal">
													{hit.detail}
												</CommandShortcut>
											</CommandItem>
										)
									})}
								</CommandGroup>
							)}

							{(actions.length > 0 || offersTheme) && (
								<CommandGroup heading="Actions">
									{actions.map(action => (
										<CommandItem
											key={action.to}
											value={`action ${action.to}`}
											onSelect={() => go(action.to)}
										>
											<Plus />
											{action.label}
										</CommandItem>
									))}
									{offersTheme && (
										<CommandItem
											value="action theme"
											onSelect={() => {
												close()
												toggleTheme()
											}}
										>
											<SunMoon />
											Basculer le thème
										</CommandItem>
									)}
								</CommandGroup>
							)}
						</CommandList>
					</Command>
					<p className="text-muted-foreground flex gap-4 border-t px-3 py-2 text-[11px]">
						<span>↑ ↓ parcourir</span>
						<span>↵ ouvrir</span>
						<span>échap fermer</span>
					</p>
				</DialogContent>
			</Dialog>
		</>
	)
}
