import { Link } from 'react-router'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Button,
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

const ACTIVITY_BG: Record<ActivityType, string> = {
	scan: 'bg-green-100',
	user: 'bg-blue-100',
	post: 'bg-orange-100',
	contact: 'bg-purple-100',
}

const ACTIVITY_ICON_COLOR: Record<ActivityType, string> = {
	scan: 'text-green-600',
	user: 'text-blue-600',
	post: 'text-orange-600',
	contact: 'text-purple-600',
}

function ActivityIcon({ type }: { type: string }) {
	const Icon = ACTIVITY_ICONS[type as ActivityType] ?? CheckCircle
	const color = ACTIVITY_ICON_COLOR[type as ActivityType] ?? 'text-gray-600'
	return <Icon className={cn('h-4 w-4', color)} />
}

interface RecentActivityProps {
	activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
	return (
		<Card className="overflow-hidden md:col-span-2 lg:col-span-2">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-lg font-semibold">
					Activité Récente
				</CardTitle>
				<Button variant="ghost" size="sm" asChild>
					<Link to="/events" className="text-primary hover:text-primary/80 gap-1">
						Voir tout <ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{activities.map(activity => (
						<div
							key={activity.id}
							className="hover:bg-muted/50 flex items-start gap-3 rounded-xl p-3 transition-colors"
						>
							<div
								className={cn(
									'rounded-full p-2.5',
									ACTIVITY_BG[activity.type as ActivityType] ?? 'bg-gray-100',
								)}
							>
								<ActivityIcon type={activity.type} />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium">{activity.text}</p>
								<p className="text-muted-foreground text-xs">
									{activity.timestamp}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
