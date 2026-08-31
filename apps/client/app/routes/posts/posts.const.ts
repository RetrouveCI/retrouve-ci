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

export interface CategoryFilter {
	id: LostItemCategory | 'all'
	label: string
	icon: React.ElementType
}

// The contract owns the categories; this page owns their label and icon. Keying
// the table by category is what turns a category added to the contract into a
// type error rather than a chip that silently never appears.
const CATEGORY_CHIPS: Record<
	LostItemCategory,
	{ label: string; icon: React.ElementType }
> = {
	phone: { label: 'Téléphones', icon: Smartphone },
	keys: { label: 'Clés', icon: Key },
	wallet: { label: 'Portefeuilles', icon: Wallet },
	bag: { label: 'Sacs', icon: Briefcase },
	electronics: { label: 'Électronique', icon: Laptop },
	clothing: { label: 'Vêtements', icon: Shirt },
	jewelry: { label: 'Bijoux', icon: Gem },
	documents: { label: 'Documents', icon: FileText },
	other: { label: 'Autres', icon: Package },
}

export const CATEGORY_FILTERS: CategoryFilter[] = [
	{ id: 'all', label: 'Tous', icon: Package },
	...LOST_ITEM_CATEGORIES.map(id => ({ id, ...CATEGORY_CHIPS[id] })),
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
