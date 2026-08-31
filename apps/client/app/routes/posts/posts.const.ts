import {
	LOST_ITEM_CATEGORIES,
	type LostItemCategory,
	type LostItemType,
} from '@app/contracts/lost-items'
import {
	Smartphone,
	Key,
	Wallet,
	Briefcase,
	Laptop,
	Shirt,
	Gem,
	FileText,
	Package,
} from 'lucide-react'

// The contract owns the categories; this page owns their labels and icon. Keying
// the table by category is what turns a category added to the contract into a
// type error rather than a chip that silently never appears.
//
// `label` names one object and `plural` names a filter over many, so the detail
// page reads « Téléphone » where the filter rail reads « Téléphones ».
const CATEGORIES: Record<
	LostItemCategory,
	{ label: string; plural: string; icon: React.ElementType }
> = {
	phone: { label: 'Téléphone', plural: 'Téléphones', icon: Smartphone },
	keys: { label: 'Clés', plural: 'Clés', icon: Key },
	wallet: { label: 'Portefeuille', plural: 'Portefeuilles', icon: Wallet },
	bag: { label: 'Sac', plural: 'Sacs', icon: Briefcase },
	electronics: { label: 'Électronique', plural: 'Électronique', icon: Laptop },
	clothing: { label: 'Vêtement', plural: 'Vêtements', icon: Shirt },
	jewelry: { label: 'Bijoux', plural: 'Bijoux', icon: Gem },
	documents: { label: 'Documents', plural: 'Documents', icon: FileText },
	other: { label: 'Autre', plural: 'Autres', icon: Package },
}

/**
 * `LostItem.category` is typed `LostItemCategory | string`, so a lookup needs a
 * fallback the table itself cannot provide. The table stays exhaustive, which is
 * where the guarantee lives; these two only decide what an unknown value shows.
 */
export function categoryLabel(category: string): string {
	return CATEGORIES[category as LostItemCategory]?.label ?? 'Autre'
}

export function categoryIcon(category: string): React.ElementType {
	return CATEGORIES[category as LostItemCategory]?.icon ?? Package
}

export interface CategoryFilter {
	id: LostItemCategory | 'all'
	label: string
	icon: React.ElementType
}

export const CATEGORY_FILTERS: CategoryFilter[] = [
	{ id: 'all', label: 'Tous', icon: Package },
	...LOST_ITEM_CATEGORIES.map(id => ({
		id,
		label: CATEGORIES[id].plural,
		icon: CATEGORIES[id].icon,
	})),
]

export interface TypeFilter {
	id: LostItemType | 'all'
	label: string
	/** The dot that carries the state; `null` for « Tous », which has no state. */
	dotClassName: string | null
}

export const TYPE_FILTERS: TypeFilter[] = [
	{ id: 'all', label: 'Tous', dotClassName: null },
	{ id: 'lost', label: 'Perdus', dotClassName: 'bg-red-500' },
	{ id: 'found', label: 'Retrouvés', dotClassName: 'bg-primary-green' },
]
