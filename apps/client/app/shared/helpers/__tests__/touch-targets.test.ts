import { buttonVariants } from '@app/ui/components'

/**
 * §2.1 asks for a 44 px floor below `lg`, with no exception. Enforcing it in the
 * package is what spares the call sites.
 *
 * It rides on the base classes as a **minimum**, never as a height. A fixed
 * `lg:h-9` looked equivalent and was not: `tailwind-merge` sees a different
 * variant from a call site's own `h-13`, keeps both, and the field silently
 * shrank on desktop. A `min-h` loses to any larger height, which is what a floor
 * should do.
 */
const SIZES = ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'] as const

describe('buttonVariants, the 44 px floor', () => {
	it.each(SIZES)('size %s carries the floor on a phone', size => {
		const classes = buttonVariants({ size })

		expect(classes).toContain('min-h-11')
		expect(classes).toContain('min-w-11')
	})

	// Above `lg` there is a pointer, and the floor buys nothing but bulk.
	it.each(SIZES)('size %s drops the floor on a pointer', size => {
		const classes = buttonVariants({ size })

		expect(classes).toContain('lg:min-h-0')
		expect(classes).toContain('lg:min-w-0')
	})

	// The floor must never be expressed as a height: that is what overrode a
	// caller's own size above `lg`.
	it.each(SIZES)('size %s pins no responsive height', size => {
		expect(buttonVariants({ size })).not.toMatch(/\blg:(h|w|size)-\d/)
	})
})
