export const TABLE_DENSITIES = ['compacte', 'normale', 'confortable'] as const

export type TableDensity = (typeof TABLE_DENSITIES)[number]

export const DEFAULT_TABLE_DENSITY: TableDensity = 'normale'

export const TABLE_DENSITY_COOKIE = 'table_density'

const DENSITY_IN_COOKIE = /(?:^|;\s*)table_density=([a-z]+)/

/** Read at render on the server, like the sidebar's collapse: no flash. */
export function readTableDensity(cookie: string | null): TableDensity {
	const value = cookie?.match(DENSITY_IN_COOKIE)?.[1]

	return (
		TABLE_DENSITIES.find(density => density === value) ?? DEFAULT_TABLE_DENSITY
	)
}

// The F7 artefact's three steps: a row of 32, 40 or 52 pixels.
export const DENSITY_CELL_CLASSES: Record<TableDensity, string> = {
	compacte: 'py-1.5 text-[13px]',
	normale: 'py-2.5 text-[13.5px]',
	confortable: 'py-3.5 text-sm',
}
