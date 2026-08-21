import type {
	AdminListLostItemsFilterData,
	CreateLostItemData as CreateLostItemContract,
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
	UpdateLostItemData as UpdateLostItemContract,
} from '@app/contracts/lost-items'

export type {
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
}

/** The wire carries the date as a string; the domain works on a `Date`. */
export type CreateLostItemData = Omit<CreateLostItemContract, 'eventDate'> & {
	eventDate: Date
	userId: string
}

export type UpdateLostItemData = Omit<UpdateLostItemContract, 'eventDate'> & {
	eventDate?: Date
}

/**
 * The repository also narrows by owner and by resolution status. Neither is a
 * query parameter: both come from the use-case.
 */
export type ListLostItemsFilter = Omit<
	AdminListLostItemsFilterData,
	'dateFrom' | 'dateTo'
> & {
	dateFrom?: Date
	dateTo?: Date
	resolutionStatus?: ResolutionStatus
	userId?: string
}
