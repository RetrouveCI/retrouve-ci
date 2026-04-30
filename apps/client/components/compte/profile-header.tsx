import { User, Smartphone, LogOut } from 'lucide-react'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import type { User as UserType } from '@/domain/entities/user'

interface ProfileHeaderProps {
	user: UserType
	onLogout: () => void
}

export function ProfileHeader({ user, onLogout }: ProfileHeaderProps) {
	return (
		<section className="relative overflow-hidden border-b">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-20 right-0 h-96 w-96 rounded-full bg-(--primary-green)/5 blur-3xl" />
				<div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-(--accent-orange)/5 blur-3xl" />
			</div>
			<div className="relative container mx-auto px-4 py-10">
				<div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
					<div className="flex items-center gap-4">
						<div className="relative">
							<div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-linear-to-br from-(--primary-green) to-(--primary-green-dark) shadow-(--primary-green)/20 shadow-lg">
								<User className="h-9 w-9 text-white" />
							</div>
							<div className="border-background absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-(--primary-green)">
								<div className="h-2 w-2 rounded-full bg-white" />
							</div>
						</div>
						<div>
							<p className="text-muted-foreground mb-0.5 text-sm">Bienvenue</p>
							<h1 className="text-2xl font-bold md:text-3xl">{user.name}</h1>
							<p className="text-muted-foreground mt-1 flex items-center gap-1.5">
								<Smartphone className="h-4 w-4" />
								+225 {user.phone}
							</p>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={onLogout}
						className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10 gap-2 rounded-xl"
					>
						<LogOut className="h-4 w-4" />
						Déconnexion
					</Button>
				</div>
			</div>
		</section>
	)
}
