import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@retrouve-ci/ui/components'
import { SearchBar } from '@/shared/components/search-bar'

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
				<SearchBar
					mode="navigate"
					action="/posts"
					size="md"
					autoFocus
					onSubmit={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	)
}
