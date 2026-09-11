/** better-auth stores a user's roles as one comma-separated string. */
export function hasRole(
	role: string | null | undefined,
	required: readonly string[],
): boolean {
	const held = (role ?? '').split(',').map(value => value.trim())

	return required.some(name => held.includes(name))
}
