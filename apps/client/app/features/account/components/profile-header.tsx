import { Button } from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { Smartphone, LogOut, Settings, CalendarDays } from 'lucide-react'
import type { User as UserType } from '@/shared/types/user'
import { getInitials } from '@/shared/lib/get-initials'

interface ProfileHeaderProps {
	user: UserType
	onLogout: () => void
}

export function ProfileHeader({ user, onLogout }: ProfileHeaderProps) {
	return (
		<section className="relative overflow-hidden border-b">
			<div className="pointer-events-none absolute inset-0">
				<div className="bg-primary-green/5 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
				<div className="bg-accent-orange/5 absolute bottom-0 left-1/2 h-64 w-64 rounded-full blur-3xl" />
			</div>
			<div className="relative container mx-auto px-4 py-10">
				<div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
					<div className="flex items-center gap-4">
						<div className="relative">
							<div className="from-primary-green to-primary-green-dark shadow-primary-green/20 flex h-18 w-18 items-center justify-center rounded-2xl bg-linear-to-br text-2xl font-bold text-white shadow-lg">
								{getInitials(user.name)}
							</div>
							<div className="border-background bg-primary-green absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2">
								<div className="h-2 w-2 rounded-full bg-white" />
							</div>
						</div>
						<div>
							<p className="text-muted-foreground mb-0.5 text-sm">Bonjour 👋</p>
							<h1 className="text-2xl font-bold md:text-3xl">{user.name}</h1>
							<div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
								<span className="flex items-center gap-1.5">
									<Smartphone className="h-4 w-4" />
									{user.phone}
								</span>
								<span className="flex items-center gap-1.5">
									<CalendarDays className="h-4 w-4" />
									Membre depuis {user.createdAt}
								</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							asChild
							variant="outline"
							size="sm"
							className="gap-2 rounded-xl"
						>
							<Link to="/account/settings">
								<Settings className="h-4 w-4" />
								Paramètres
							</Link>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={onLogout}
							className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10 gap-2 rounded-xl"
						>
							<LogOut className="h-4 w-4" />
							<span className="hidden sm:inline">Déconnexion</span>
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}
