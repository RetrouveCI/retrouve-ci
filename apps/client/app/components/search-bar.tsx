import { useId } from 'react'
import { Form, useNavigation } from 'react-router'
import { Loader2, Search, X } from 'lucide-react'
import { Button, Input } from '@app/ui/components'
import { cn } from '@app/ui/utils'
import { looksLikePhrase } from '@/routes/search/helpers/phrase'

/** Where a sentence goes to become filters. */
const ASSISTANT_ACTION = '/search'

type Size = 'xs' | 'sm' | 'md' | 'lg'

/** Only the shell changes with the size: §2.1 puts every field at 16 px. */
const SIZE: Record<
	Size,
	{
		shell: string
		input: string
		icon: string
		button: string
		/** Round submit, kept a touch smaller than the shell it sits inside. */
		iconButton: string
	}
> = {
	xs: {
		shell: 'py-0.5 pl-3.5 pr-1.5',
		input: 'h-9 text-field',
		icon: 'h-4 w-4',
		button: 'h-8 px-4 text-sm',
		iconButton: 'size-7',
	},
	sm: {
		shell: 'py-1 pl-3.5 pr-1.5',
		input: 'h-10 text-field',
		icon: 'h-4 w-4',
		button: 'h-8 px-4 text-sm',
		iconButton: 'size-8',
	},
	md: {
		shell: 'py-1.5 pl-4 pr-1.5',
		input: 'h-11 text-field',
		icon: 'h-5 w-5',
		button: 'h-9 px-5',
		iconButton: 'size-9',
	},
	lg: {
		// 56 px on a phone, near the artboard's 54: the field is already at
		// §2.1's 48 px floor, so the padding is all there was left to give back.
		shell: 'py-0.5 pl-4 pr-1 lg:py-1.5 lg:pl-5 lg:pr-1.5',
		input: 'h-control text-field',
		icon: 'h-5 w-5',
		button: 'h-12 px-6',
		iconButton: 'size-11',
	},
}

interface BaseProps {
	placeholder?: string
	size?: Size
	className?: string
	/**
	 * Lets a sentence go to the assistant instead of straight to the list. Only
	 * the two heroes carry it: the header is narrow, sits on every page, and is
	 * where « carte » gets typed in passing — spending five phrases a quarter of
	 * an hour there would take them from whoever writes a real one.
	 */
	assistant?: boolean
}

type SearchBarProps = BaseProps &
	(
		| {
				/** Navigates to `action` with `?q=` on submit (header, home). */
				mode: 'navigate'
				action?: string
				defaultValue?: string
				autoFocus?: boolean
				/**
				 * `icon` is the header's: at 1024 px the search takes the free space
				 * the layout used to waste, and a worded button would eat the width it
				 * just gained. `responsive` is the hero's — the artboards word the
				 * button only on desktop, because at 390 px « Rechercher » left the
				 * field 167 px and truncated its own placeholder.
				 */
				submit?: 'label' | 'icon' | 'none' | 'responsive'
				onSubmit?: () => void
		  }
		| {
				/** Controlled live filter (e.g. the /posts list). */
				mode: 'filter'
				value: string
				onChange: (value: string) => void
		  }
	)

export function SearchBar(props: SearchBarProps) {
	const id = useId()
	const size = SIZE[props.size ?? 'md']
	const navigation = useNavigation()
	// The submission ends in a redirect, so it is a navigation and not a fetcher
	// — `formAction` is what tells this bar's round-trip from any other.
	const pending =
		!!props.assistant && navigation.formAction === ASSISTANT_ACTION

	const shell = cn(
		'bg-background focus-within:border-primary-green/50 flex items-center gap-2 rounded-full border-2 transition-all',
		size.shell,
		props.className,
	)

	const inputClass = cn(
		'border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0',
		size.input,
	)

	if (props.mode === 'filter') {
		const field = (
			<div className={shell}>
				<LeadingIcon pending={pending} className={size.icon} />
				<label htmlFor={id} className="sr-only">
					Rechercher un objet
				</label>
				<Input
					id={id}
					name="phrase"
					type="search"
					value={props.value}
					onChange={e => props.onChange(e.target.value)}
					placeholder={props.placeholder ?? 'Rechercher par objet, lieu...'}
					className={inputClass}
				/>
				{props.value && (
					<button
						type="button"
						onClick={() => props.onChange('')}
						aria-label="Effacer"
						className="hover:bg-muted rounded-full p-1.5 transition-colors"
					>
						<X className="text-muted-foreground h-4 w-4" />
					</button>
				)}
			</div>
		)

		if (!props.assistant) return field

		// No submit button: with a single field, Enter submits on its own — and
		// Enter is what did nothing at all here before.
		return (
			<Form method="post" action={ASSISTANT_ACTION} role="search">
				{field}
				<AssistantHint phrase={props.value} pending={pending} />
			</Form>
		)
	}

	const submit = props.submit ?? 'label'

	// The assistant's route sorts a sentence from a keyword itself and redirects
	// either way, so the form posts to it whatever was typed — no JavaScript
	// decides, and nothing is spent on « carte ».
	return (
		<Form
			method={props.assistant ? 'post' : 'get'}
			action={props.assistant ? ASSISTANT_ACTION : (props.action ?? '/posts')}
			role="search"
			onSubmit={props.onSubmit}
		>
			<div className={shell}>
				<LeadingIcon pending={pending} className={size.icon} />
				<label htmlFor={id} className="sr-only">
					Rechercher un objet
				</label>
				<Input
					id={id}
					name={props.assistant ? 'phrase' : 'q'}
					type="search"
					defaultValue={props.defaultValue}
					autoFocus={props.autoFocus}
					placeholder={props.placeholder ?? 'Quel objet recherchez-vous ?'}
					className={inputClass}
				/>
				{/* Under `prefers-reduced-motion` the spinner does not turn, so the
				    wait cannot be told by movement alone: the button dims and the
				    live region says it out loud. Neither moves the layout. */}
				{pending && (
					<p aria-live="polite" className="sr-only">
						Analyse de votre phrase…
					</p>
				)}
				{(submit === 'label' || submit === 'responsive') && (
					<Button
						type="submit"
						disabled={pending}
						className={cn(
							'bg-primary-green hover:bg-primary-green-dark shrink-0 rounded-full text-white',
							size.button,
							submit === 'responsive' && 'hidden lg:inline-flex',
						)}
					>
						Rechercher
					</Button>
				)}
				{(submit === 'icon' || submit === 'responsive') && (
					<Button
						type="submit"
						size="icon"
						disabled={pending}
						aria-label="Rechercher"
						className={cn(
							'bg-primary-green hover:bg-primary-green-dark shrink-0 rounded-full text-white',
							size.iconButton,
							submit === 'responsive' && 'lg:hidden',
						)}
					>
						<Search className={size.icon} />
					</Button>
				)}
			</div>
		</Form>
	)
}

/** Says the bar is thinking where it already says what it is for. */
function LeadingIcon({
	pending,
	className,
}: {
	pending: boolean
	className: string
}) {
	const Icon = pending ? Loader2 : Search

	return (
		<Icon
			aria-hidden
			className={cn(
				'text-muted-foreground shrink-0',
				pending && 'animate-spin',
				className,
			)}
		/>
	)
}

/**
 * Two of the four states §2.3 asks for, on the one bar where Enter used to do
 * nothing: what the key now does, and that it is doing it.
 */
function AssistantHint({
	phrase,
	pending,
}: {
	phrase: string
	pending: boolean
}) {
	const message = pending
		? 'Analyse de votre phrase…'
		: looksLikePhrase(phrase)
			? 'Appuyez sur Entrée pour chercher à partir de votre phrase.'
			: undefined

	return (
		<p
			aria-live="polite"
			className="text-muted-foreground mt-2 h-4 text-xs transition-opacity"
		>
			{message}
		</p>
	)
}
