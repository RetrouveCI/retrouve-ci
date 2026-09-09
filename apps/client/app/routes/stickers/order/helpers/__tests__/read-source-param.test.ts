import {
	DEFAULT_STICKER_ORDER_SOURCE,
	STICKER_ORDER_SOURCES,
} from '@app/contracts/sticker-orders'
import { readSourceParam } from '../read-source-param'

describe('readSourceParam', () => {
	it.each(STICKER_ORDER_SOURCES)(
		'keeps %s, which the contract names',
		value => {
			expect(readSourceParam(value)).toBe(value)
		},
	)

	// ⚠️ Anything unnamed reads as a direct arrival, never reaching the column.
	it.each([null, '', 'accueil', 'HOME', 'facebook', '<script>'])(
		'falls back to the default for %p',
		value => {
			expect(readSourceParam(value)).toBe(DEFAULT_STICKER_ORDER_SOURCE)
		},
	)
})
