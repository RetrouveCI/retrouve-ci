import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// A guard reading a property, not a spelling: `notify-matches` holds its
// dependency under another field name, so grepping `createNotification.execute`
// misses it.

const DOMAINS = resolve(__dirname, '../..')

const PRODUCES = 'CreateNotificationUseCase'
const SWALLOWS = /\bnotify(Desk|User)\b/

// The one that must not swallow: its failure has to retry the BullMQ job.
const RETHROWS = ['matching/use-cases/notify-matches.use-case.ts']

function useCases(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory())
			return entry.name === '__tests__' ? [] : useCases(path)
		return entry.name.endsWith('.use-case.ts') ? [path] : []
	})
}

function producers(): string[] {
	return useCases(DOMAINS)
		.filter(file => readFileSync(file, 'utf8').includes(PRODUCES))
		.map(file => relative(DOMAINS, file))
		.filter(file => !file.endsWith('create-notification.use-case.ts'))
}

describe('raising a notification never risks the write', () => {
	it('finds the producers it is meant to be reading', () => {
		const found = producers()

		expect(found.length).toBeGreaterThanOrEqual(8)
		expect(found).toEqual(expect.arrayContaining(RETHROWS))
	})

	it('leaves every producer but the queued one swallowing', () => {
		const offenders = producers().filter(
			file =>
				!RETHROWS.includes(file) &&
				!SWALLOWS.test(readFileSync(join(DOMAINS, file), 'utf8')),
		)

		expect(offenders).toEqual([])
	})
})
