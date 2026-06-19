import { Link } from 'react-router'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import {
	Scan,
	Users,
	AlertTriangle,
	Phone,
	CheckCircle,
	ArrowRight,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

type ActivityType = 'scan' | 'user' | 'post' | 'contact'

interface Activity {
	id: number
	type: string
	text: string
	timestamp: string
}

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
	scan: Scan,
	user: Users,
	post: AlertTriangle,
	contact: Phone,
}

// Opacity-based tints read correctly on both light and dark surfaces.
const ACTIVITY_STYLE: Record<ActivityType, string> = {
	scan: 'bg-primary/10 text-primary',
	user: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
	post: 'bg-accent/10 text-accent',
	contact: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
}

function ActivityIcon({ type }: { type: string }) {
	const Icon = ACTIVITY_ICONS[type as ActivityType] ?? CheckCircle
	return <Icon className="h-4 w-4" />
}

interface RecentActivityProps {
	activities: Activity[]
	className?: string
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
	return (
		<Card className={cn('overflow-hidden', className)}>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-base font-semibold">
					Activité récente
				</CardTitle>
				<Link
					to="/events"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
				>
					Voir tout
					<ArrowRight className="h-3.5 w-3.5" />
				</Link>
			</CardHeader>
			<CardContent>
				{activities.length === 0 ? (
					<p className="text-muted-foreground py-8 text-center text-sm">
						Aucune activité récente
					</p>
				) : (
					<div className="space-y-1">
						{activities.map(activity => (
							<div
								key={activity.id}
								className="hover:bg-muted/50 flex items-start gap-3 rounded-lg p-2.5 transition-colors"
							>
								<div
									className={cn(
										'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
										ACTIVITY_STYLE[activity.type as ActivityType] ??
											'bg-muted text-muted-foreground',
									)}
								>
									<ActivityIcon type={activity.type} />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm leading-snug font-medium">
										{activity.text}
									</p>
									<p className="text-muted-foreground mt-0.5 text-xs">
										{activity.timestamp}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
