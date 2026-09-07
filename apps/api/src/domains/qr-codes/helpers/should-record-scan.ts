// `/q/:code` is read by a loader, so every reload calls the scan endpoint
// again: without a window « scanné il y a 2 h » would read « il y a quelques
// secondes » for as long as a finder keeps the page open.
export const SCAN_WINDOW_MINUTES = 5

/** Pure, because a Prisma `where` cannot be exercised without a database. */
export function shouldRecordScan(
	lastScannedAt: Date | null,
	now: Date,
): boolean {
	if (!lastScannedAt) return true

	const elapsed = now.getTime() - lastScannedAt.getTime()

	return elapsed >= SCAN_WINDOW_MINUTES * 60 * 1000
}
