import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const APP = 'app'
const BULLET = '•'

function sources(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory())
			return entry.name === '__tests__' ? [] : sources(path)
		return entry.name.endsWith('.tsx') ? [path] : []
	})
}

/** Eight bullets read as a filled field, so its submit button looked broken. */
describe('a password placeholder', () => {
	it('never imitates a masked value', () => {
		const offenders = sources(APP).filter(file =>
			new RegExp(`placeholder[^\\n]*${BULLET}`).test(
				readFileSync(file, 'utf8'),
			),
		)

		expect(offenders).toEqual([])
	})

	it('is left to the caller, so a field with nothing to hint shows none', () => {
		const source = readFileSync(
			join(process.cwd(), 'app/routes/auth/components/password-input.tsx'),
			'utf8',
		)

		expect(source).toContain('placeholder={placeholder}')
	})
})
