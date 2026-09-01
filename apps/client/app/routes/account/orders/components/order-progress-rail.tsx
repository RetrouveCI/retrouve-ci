import { Check } from 'lucide-react'
import { cn } from '@app/ui/utils'
import type { OrderStep } from '../helpers/order-progress'

/**
 * Four steps and three connectors. The current step is drawn as a ring rather
 * than a filled dot, so « where it is now » and « where it has been » stay two
 * different marks and not two shades of the same one.
 */
export function OrderProgressRail({ steps }: { steps: OrderStep[] }) {
	return (
		<ol className="flex items-start">
			{steps.map((step, index) => (
				<li key={step.id} className="contents">
					{index > 0 && (
						<span
							aria-hidden
							className={cn(
								'mx-1 mt-3 h-0.5 flex-1 rounded-full',
								steps[index - 1]?.done ? 'bg-primary-green' : 'bg-border',
							)}
						/>
					)}
					<span className="flex shrink-0 flex-col items-center gap-1.5">
						<span
							className={cn(
								'flex h-6.5 w-6.5 items-center justify-center rounded-full',
								step.done && 'bg-primary-green',
								step.current && 'border-primary-green border-[2.5px]',
								!step.done && !step.current && 'bg-muted',
							)}
						>
							{step.done && <Check className="h-3.5 w-3.5 text-white" />}
						</span>
						<span
							className={cn(
								'text-[10.5px]',
								step.done && 'text-primary-green-text font-semibold',
								step.current && 'text-foreground font-semibold',
								!step.done && !step.current && 'text-muted-foreground',
							)}
						>
							{step.label}
						</span>
					</span>
				</li>
			))}
		</ol>
	)
}
