import { FilterPill } from '@/components/filter-pill'
import { OBJECT_TYPES } from '../publish.const'

interface CategoryPillsProps {
	value: string
	onChange: (value: string) => void
	onBlur: () => void
}

/**
 * The nine categories the contract owns, drawn in §2.1's one pill shape — the
 * same `FilterPill` the listings use, so the tunnel invents no second capsule.
 * A select hid the whole vocabulary behind a tap; laid flat it is readable at a
 * glance, which is what the first screen of the form is for.
 */
export function CategoryPills({ value, onChange, onBlur }: CategoryPillsProps) {
	return (
		<div
			role="group"
			aria-label="Type d'objet"
			className="flex flex-wrap gap-2"
			onBlur={onBlur}
		>
			{OBJECT_TYPES.map(type => (
				<FilterPill
					key={type.value}
					active={value === type.value}
					onClick={() => onChange(type.value)}
				>
					{type.label}
				</FilterPill>
			))}
		</div>
	)
}
