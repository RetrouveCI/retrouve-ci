import { describe, expect, it } from 'vitest'
import { SCAN_WINDOW_MINUTES, shouldRecordScan } from '../should-record-scan'

const now = new Date('2026-09-07T12:00:00.000Z')
const minutesBefore = (minutes: number) =>
	new Date(now.getTime() - minutes * 60 * 1000)

describe('shouldRecordScan', () => {
	it('records the first scan a sticker ever gets', () => {
		expect(shouldRecordScan(null, now)).toBe(true)
	})

	it.each([
		[0, false],
		[SCAN_WINDOW_MINUTES - 1, false],
		[SCAN_WINDOW_MINUTES, true],
		[120, true],
	])('reads a scan %o minutes ago as recordable=%o', (minutes, expected) => {
		expect(shouldRecordScan(minutesBefore(minutes), now)).toBe(expected)
	})

	// Clocks are not promises: a row stamped ahead of this server must not read
	// as « scanned long ago » and reset the trace on every reload.
	it('leaves a trace stamped in the future alone', () => {
		expect(shouldRecordScan(new Date(now.getTime() + 60_000), now)).toBe(false)
	})
})
