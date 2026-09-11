export type StatusCounts<TStatus extends string> = Partial<
	Record<TStatus | 'all', number>
>

/**
 * Counts from the API's own totals, over every row — not over the page the
 * loader holds, which is how the stats grids used to disagree with the total.
 * A counter that cannot be read comes back `null`, never as a zero nobody
 * measured.
 */
export async function countByStatus<TStatus extends string>(
	statuses: readonly TStatus[],
	count: (status?: TStatus) => Promise<number>,
): Promise<StatusCounts<TStatus> | null> {
	try {
		const [all, ...each] = await Promise.all([
			count(),
			...statuses.map(status => count(status)),
		])
		const counts: StatusCounts<TStatus> = {}

		counts.all = all
		statuses.forEach((status, index) => {
			counts[status] = each[index]
		})

		return counts
	} catch {
		return null
	}
}
