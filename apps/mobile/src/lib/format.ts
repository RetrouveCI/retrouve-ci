/** Format an amount as `1 500 FCFA` using the French locale grouping. */
export function formatPrice(n: number): string {
  return `${n.toLocaleString('fr-FR')} FCFA`;
}

/** Relative French time label (e.g. "il y a 2 h", "il y a 3 j"). */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}
