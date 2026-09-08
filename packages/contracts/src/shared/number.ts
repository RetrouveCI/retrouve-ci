// « 1 234 » — French grouping. One home: a price, a listing count and a
// returned-object count all read the same way.
export function formatNumber(value: number): string {
	return new Intl.NumberFormat('fr-FR').format(value)
}
