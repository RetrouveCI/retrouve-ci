import { Clock } from 'lucide-react'

export function AvailabilityCard() {
	return (
		<div className="bg-primary-green rounded-2xl border p-6 text-white">
			<div className="mb-3 flex items-center gap-3">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
					<Clock className="h-4 w-4" />
				</div>
				<h3 className="font-semibold">Disponibilité</h3>
			</div>
			<div className="space-y-1.5 text-sm text-white/90">
				<div className="flex justify-between">
					<span>Lundi – Vendredi</span>
					<span className="font-medium">8h – 18h</span>
				</div>
				<div className="flex justify-between">
					<span>Samedi</span>
					<span className="font-medium">9h – 13h</span>
				</div>
				<div className="flex justify-between">
					<span>Dimanche</span>
					<span className="font-medium text-white/60">Fermé</span>
				</div>
			</div>
			<div className="mt-4 flex items-center gap-2 border-t border-white/20 pt-4 text-xs text-white/70">
				<span className="animate-pulse-soft h-2 w-2 rounded-full bg-emerald-300" />
				Temps de réponse moyen : 2h
			</div>
		</div>
	)
}
