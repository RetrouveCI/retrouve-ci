import { DEFAULT_TABLE_DENSITY, readTableDensity } from '../table-density'

describe('readTableDensity', () => {
	it.each(['compacte', 'normale', 'confortable'] as const)(
		'reads %s from the cookie',
		density => {
			expect(
				readTableDensity(`theme=dark; table_density=${density}; other=1`),
			).toBe(density)
		},
	)

	it.each([null, '', 'table_density=dense', 'my_table_density=compacte'])(
		'falls back to the default for %j',
		cookie => {
			expect(readTableDensity(cookie)).toBe(DEFAULT_TABLE_DENSITY)
		},
	)
})
