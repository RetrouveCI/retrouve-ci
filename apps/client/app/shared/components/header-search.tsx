import { useEffect, useState } from 'react'
import { Form } from 'react-router'
import { Search } from 'lucide-react'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
	Input,
} from '@retrouve-ci/ui/components'

export function HeaderSearch() {
	const [open, setOpen] = useState(false)

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault()
				setOpen(o => !o)
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-9 w-9 rounded-full"
					aria-label="Rechercher"
				>
					<Search className="h-5 w-5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="top-28 max-w-xl translate-y-0 gap-4 p-5">
				<DialogTitle>Rechercher un objet</DialogTitle>
				<DialogDescription className="sr-only">
					Recherchez parmi les annonces d&apos;objets perdus et retrouvés.
				</DialogDescription>
				<Form
					method="get"
					action="/posts"
					role="search"
					onSubmit={() => setOpen(false)}
				>
					<div className="bg-background focus-within:border-primary-green/50 flex items-center gap-2 rounded-full border-2 py-1.5 pr-1.5 pl-4 transition-all">
						<Search className="text-muted-foreground h-5 w-5 shrink-0" />
						<label htmlFor="header-search" className="sr-only">
							Rechercher un objet
						</label>
						<Input
							id="header-search"
							name="q"
							type="search"
							autoFocus
							placeholder="Quel objet recherchez-vous ?"
							className="h-10 border-0 bg-transparent px-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
						/>
						<Button
							type="submit"
							className="bg-primary-green hover:bg-primary-green-dark h-10 shrink-0 rounded-full px-5 text-white"
						>
							Rechercher
						</Button>
					</div>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
