export function toE164(localNumber: string): string {
	return `+225${localNumber.replace(/\s/g, '')}`
}
