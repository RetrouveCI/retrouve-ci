import type { LostItemApiDto } from '@/shared/types/lost-items.types'
import { toLostItem, toLostItemDetail } from '../lost-item.mapper'

const DTO: LostItemApiDto = {
	id: 'post-1',
	type: 'found',
	category: 'documents',
	title: 'CNI trouvée à Yopougon',
	description: '',
	ville: 'Abidjan',
	commune: 'Yopougon',
	eventDate: '2026-09-01T10:00:00.000Z',
	contactName: 'Awa',
	contactWhatsapp: '+2250700000000',
	photos: [],
	documentType: 'national_id',
	documentHolderName: 'KOUASSI Jean',
	documentIssuer: null,
	moderationStatus: 'published',
	resolutionStatus: 'active',
	views: 0,
	contactsCount: 0,
	createdAt: '2026-09-01T09:00:00.000Z',
}

describe('the lost item mapper', () => {
	it('carries the piece a listing declared', () => {
		expect(toLostItem(DTO).document).toEqual({
			type: 'national_id',
			holderName: 'KOUASSI Jean',
			issuer: undefined,
		})
	})

	// The block is drawn from the type alone, so a row that names no type must
	// not produce an empty card on the detail page.
	it('carries nothing when no piece was declared', () => {
		expect(toLostItem({ ...DTO, documentType: null }).document).toBeUndefined()
	})

	it('reads a missing holder as absent rather than as null', () => {
		expect(
			toLostItem({ ...DTO, documentHolderName: null }).document,
		).toMatchObject({ holderName: undefined })
	})

	// `LostItemApiDto` declares no `documentNumber` at all — it lives on
	// `MyLostItemApiDto`, which only the session-gated reads produce.
	it('never surfaces a number, even when the payload holds one', () => {
		const withNumber = { ...DTO, documentNumber: 'CI0012345678' }

		expect(JSON.stringify(toLostItemDetail(withNumber))).not.toContain(
			'CI0012345678',
		)
	})
})
