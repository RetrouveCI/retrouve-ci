import type {
	GenerateQrTokensData,
	ListQrTokensFilterData,
	QrTokenDetailsData,
	QrTokenStatus,
} from '@app/contracts/qr-codes'

export type { GenerateQrTokensData, QrTokenDetailsData, QrTokenStatus }

/** The admin list is unscoped; `listMine` narrows it to the session's user. */
export type ListQrTokensFilter = ListQrTokensFilterData & {
	userId?: string
}
