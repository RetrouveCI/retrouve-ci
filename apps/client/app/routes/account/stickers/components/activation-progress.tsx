import {
	buildActivationLabel,
	buildRemainingLabel,
	type StickerSummary,
} from '../helpers/sticker-summary'

/**
 * The first thing the screen answers: how many of the stickers already bought
 * are doing their job. The bar carries `progressbar` semantics rather than a
 * bare div, so the ratio is readable without the drawing.
 */
export function ActivationProgress({ summary }: { summary: StickerSummary }) {
	const activated = summary.counts.activated
	const remaining = buildRemainingLabel(summary)

	return (
		<div>
			<div className="mb-2 flex items-baseline justify-between gap-3">
				<span className="text-lg font-semibold">
					{buildActivationLabel(summary)}
				</span>
				{remaining && (
					<span className="text-muted-foreground text-xs">{remaining}</span>
				)}
			</div>
			<div
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={summary.total}
				aria-valuenow={activated}
				aria-label="Stickers activés"
				className="bg-muted h-2 overflow-hidden rounded-full"
			>
				<div
					className="bg-primary-green h-full rounded-full transition-[width] duration-500"
					style={{ width: `${Math.round(summary.ratio * 100)}%` }}
				/>
			</div>
		</div>
	)
}
