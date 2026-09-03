import { useId } from 'react'
import { Form } from 'react-router'
import { Search, X } from 'lucide-react'
import { Button, Input } from '@app/ui/components'
import { cn } from '@app/ui/utils'

type Size = 'xs' | 'sm' | 'md' | 'lg'

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
		input: 'h-9 text-sm',
		icon: 'h-4 w-4',
		button: 'h-8 px-4 text-sm',
		iconButton: 'size-7',
	},
	sm: {
		shell: 'py-1 pl-3.5 pr-1.5',
		input: 'h-10 text-sm',
		icon: 'h-4 w-4',
		button: 'h-8 px-4 text-sm',
		iconButton: 'size-8',
	},
	md: {
		shell: 'py-1.5 pl-4 pr-1.5',
		input: 'h-11 text-sm md:text-base',
		icon: 'h-5 w-5',
		button: 'h-9 px-5',
		iconButton: 'size-9',
	},
	lg: {
		// 56 px on a phone, near the artboard's 54: the field is already at
		// §2.1's 48 px floor, so the padding is all there was left to give back.
		shell: 'py-0.5 pl-4 pr-1 lg:py-1.5 lg:pl-5 lg:pr-1.5',
		// `text-field`, not `text-base`: this ladder puts `base` at 14 px, and
		// under 16 iOS zooms on focus.
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
		return (
			<div className={shell}>
				<Search className={cn('text-muted-foreground shrink-0', size.icon)} />
				<label htmlFor={id} className="sr-only">
					Rechercher un objet
				</label>
				<Input
					id={id}
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
	}

	const submit = props.submit ?? 'label'

	return (
		<Form
			method="get"
			action={props.action ?? '/posts'}
			role="search"
			onSubmit={props.onSubmit}
		>
			<div className={shell}>
				<Search className={cn('text-muted-foreground shrink-0', size.icon)} />
				<label htmlFor={id} className="sr-only">
					Rechercher un objet
				</label>
				<Input
					id={id}
					name="q"
					type="search"
					defaultValue={props.defaultValue}
					autoFocus={props.autoFocus}
					placeholder={props.placeholder ?? 'Quel objet recherchez-vous ?'}
					className={inputClass}
				/>
				{(submit === 'label' || submit === 'responsive') && (
					<Button
						type="submit"
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
