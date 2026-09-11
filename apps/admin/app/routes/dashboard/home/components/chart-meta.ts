/**
 * Titles, legends and plot heights, held apart from the charts themselves so
 * the placeholder that stands in while `recharts` loads can wear the same
 * heading and reserve the same space. Importing this pulls no charting code —
 * which is the whole point: a fallback that imported the chart would defeat the
 * lazy boundary it exists to cover.
 */
export interface ChartLegendEntry {
	color: string
	label: string
}

export interface ChartMeta {
	title: string
	legend: ChartLegendEntry[]
	/** The `ResponsiveContainer` height, so the placeholder reserves it exactly. */
	height: number
}

export const SCANS_COLOR = '#1E7F43'
export const ACTIVATIONS_COLOR = '#F57C00'
export const LOST_COLOR = '#EF4444'
export const FOUND_COLOR = '#1E7F43'

export const ACTIVITY_CHART: ChartMeta = {
	title: 'Activité des 30 derniers jours',
	legend: [
		{ color: SCANS_COLOR, label: 'Scans' },
		{ color: ACTIVATIONS_COLOR, label: 'Activations' },
	],
	height: 300,
}

export const CATEGORY_CHART: ChartMeta = {
	title: 'Annonces par catégorie',
	legend: [
		{ color: LOST_COLOR, label: 'Perdus' },
		{ color: FOUND_COLOR, label: 'Retrouvés' },
	],
	height: 260,
}
