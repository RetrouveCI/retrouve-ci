import { isApplePlatform } from '../platform'

const IPHONE =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const IPAD_OS =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
const ANDROID =
	'Mozilla/5.0 (Linux; Android 14; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'

describe('which column opens first', () => {
	it('opens on iPhone for an iPhone', () => {
		expect(isApplePlatform(IPHONE, 5)).toBe(true)
	})

	it('opens on iPhone for an iPad, which claims to be a Mac', () => {
		expect(isApplePlatform(IPAD_OS, 5)).toBe(true)
	})

	it('leaves a real Mac on the Android column, where the button lives', () => {
		expect(isApplePlatform(IPAD_OS, 0)).toBe(false)
	})

	it('leaves an Android phone alone', () => {
		expect(isApplePlatform(ANDROID, 5)).toBe(false)
	})

	it('reads a user agent whatever its casing', () => {
		expect(isApplePlatform('IPHONE', 0)).toBe(true)
	})
})
