import { FormProgress } from './form-progress'
import { MatchingSuggestions } from './matching-suggestions'
import { TipsPanel } from './tips-panel'

interface ProgressItem {
	label: string
	done: boolean
}

interface PublishSidebarProps {
	progress: number
	items: ProgressItem[]
	accentColor: string
	objectType: string
	ville: string
	commune: string
	formType: 'perdu' | 'retrouve'
	tips: string[]
	hint: string
}

export function PublishSidebar({
	progress,
	items,
	accentColor,
	objectType,
	ville,
	commune,
	formType,
	tips,
	hint,
}: PublishSidebarProps) {
	return (
		<div className="space-y-4 self-start lg:sticky lg:top-24">
			<FormProgress progress={progress} items={items} accentColor={accentColor} />

			{objectType && ville ? (
				<MatchingSuggestions
					objectType={objectType}
					ville={ville}
					commune={commune}
					formType={formType}
				/>
			) : (
				<TipsPanel tips={tips} accentColor={accentColor} hint={hint} />
			)}
		</div>
	)
}
