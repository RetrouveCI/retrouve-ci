import { Link } from 'react-router'
import { Button } from '@app/ui/components'
import { LOST_ITEM_TYPES, MODERATION_STATUSES } from '@app/contracts/lost-items'
import { Plus } from 'lucide-react'
import { DensityToggle } from '@/components/density-toggle'
import { ListChips, ListToolbar } from '@/components/list-toolbar'
import type { StatusCounts } from '@/shared/helpers/list-counts'
import type { LostItemType, ModerationStatus } from '../types/posts.types'

/** What a chip reads, in the plural, for the list it filters to. */
const STATUS_LABELS: Record<ModerationStatus, string> = {
	pending: 'En attente',
	published: 'Publiées',
	hidden: 'Masquées',
}

const TYPE_LABELS: Record<LostItemType, string> = {
	lost: 'Perdus',
	found: 'Retrouvés',
}

interface PostsFiltersProps {
	counts: StatusCounts<ModerationStatus> | null
}

export function PostsFilters({ counts }: PostsFiltersProps) {
	return (
		<ListToolbar
			chips={[
				{ value: 'all', label: 'Toutes', count: counts?.all },
				...MODERATION_STATUSES.map(status => ({
					value: status,
					label: STATUS_LABELS[status],
					count: counts?.[status],
				})),
			]}
			searchPlaceholder="Titre, description…"
		>
			{/* Uncounted on purpose: the status probes already cost one call each. */}
			<ListChips
				param="type"
				label="Filtrer par type"
				chips={[
					{ value: 'all', label: 'Tous types' },
					...LOST_ITEM_TYPES.map(type => ({
						value: type,
						label: TYPE_LABELS[type],
					})),
				]}
			/>
			<DensityToggle />
			<Button size="sm" asChild>
				<Link to="/posts/new">
					<Plus className="mr-2 h-4 w-4" /> Publier pour l’équipe
				</Link>
			</Button>
		</ListToolbar>
	)
}
