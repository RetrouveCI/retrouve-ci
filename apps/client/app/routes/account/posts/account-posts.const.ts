import type { LifecycleFilter } from './hooks/use-account-posts-filters'

interface LifecycleFilterDefinition {
	id: LifecycleFilter
	label: string
	/** The selected pill's colours: a fixed surface, so fixed ink. */
	activeClassName?: string
}

/**
 * The lifecycle axis, and only it (§2.3 rule 1). « Archivées » had no pill at
 * all, so an expired listing was reachable from « Toutes » and nowhere else.
 */
export const LIFECYCLE_FILTERS: LifecycleFilterDefinition[] = [
	{ id: 'all', label: 'Toutes' },
	{
		id: 'active',
		label: 'En ligne',
		activeClassName: 'bg-primary-green border-primary-green text-white',
	},
	{
		id: 'resolved',
		label: 'Retrouvées',
		activeClassName: 'bg-blue-600 border-blue-600 text-white',
	},
	{
		id: 'expired',
		label: 'Archivées',
		activeClassName: 'bg-neutral-600 border-neutral-600 text-white',
	},
]
