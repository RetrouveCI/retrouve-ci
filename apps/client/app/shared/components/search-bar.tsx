import { useId } from 'react'
import { Form } from 'react-router'
import { Search, X } from 'lucide-react'
import { Button, Input } from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'

type Size = 'sm' | 'md' | 'lg'

const SIZE: Record<
	Size,
	{ shell: string; input: string; icon: string; button: string }
> = {
	sm: {
		shell: 'py-1 pl-3.5 pr-1.5',
		input: 'h-10 text-sm',
		icon: 'h-4 w-4',
		button: 'h-8 px-4 text-sm',
	},
	md: {
		shell: 'py-1.5 pl-4 pr-1.5',
		input: 'h-11 text-sm md:text-base',
		icon: 'h-5 w-5',
		button: 'h-9 px-5',
	},
	lg: {
		shell: 'py-1.5 pl-5 pr-1.5',
		input: 'h-12 text-base',
		icon: 'h-5 w-5',
		button: 'h-12 px-6',
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
				showSubmit?: boolean
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

	const showSubmit = props.showSubmit ?? true

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
				{showSubmit && (
					<Button
						type="submit"
						className={cn(
							'bg-primary-green hover:bg-primary-green-dark shrink-0 rounded-full text-white',
							size.button,
						)}
					>
						Rechercher
					</Button>
				)}
			</div>
		</Form>
	)
}
