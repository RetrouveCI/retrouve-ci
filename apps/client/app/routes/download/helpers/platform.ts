/**
 * Safari never fires `beforeinstallprompt`, so the iPhone column is the only
 * route to an installed app there — worth opening on by default for the very
 * visitors who get no button. iPadOS 13 and later claim to be a Mac, and a
 * touch count is what still tells them apart.
 */
export function isApplePlatform(
	userAgent: string,
	maxTouchPoints: number,
): boolean {
	if (/iphone|ipad|ipod/i.test(userAgent)) return true

	return /macintosh/i.test(userAgent) && maxTouchPoints > 1
}
