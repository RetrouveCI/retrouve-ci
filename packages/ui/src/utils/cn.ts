import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge resolves a conflict only between classes it can name, and it
 * names sizes by their Tailwind spelling — so a token like `text-field` lands
 * in the colour group, survives next to `text-sm`, and the winner falls to
 * whatever order Tailwind emitted. Registering the theme's own names is what
 * makes the last class written win. A test asserts this list keeps up.
 */
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': ['text-field'],
			h: ['h-control', 'h-chip'],
			size: ['size-chip'],
		},
	},
})

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
