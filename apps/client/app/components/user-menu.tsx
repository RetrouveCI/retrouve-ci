import { Link } from 'react-router'
import { User, Settings, LogOut, ChevronDown, QrCode } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@app/ui/components'
import { getInitials } from '@/shared/utils/initials'

interface UserMenuProps {
	name: string
	phone?: string
	onLogout: () => void
	/** The tab bar carries it below `lg`; above, it rides on the avatar. */
	pendingStickers?: number
}

export function UserMenu({
	name,
	phone,
	onLogout,
	pendingStickers = 0,
}: UserMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="group hover:bg-muted focus-visible:ring-primary-green/40 flex items-center gap-2 rounded-full p-1 pr-2 transition-colors outline-none focus-visible:ring-2">
				<span className="relative">
					<span className="from-primary-green to-primary-green-dark flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white">
						{getInitials(name)}
					</span>
					{pendingStickers > 0 && (
						<span
							aria-hidden
							className="bg-accent-orange ring-background absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2"
						/>
					)}
				</span>
				<span className="hidden max-w-24 truncate text-sm font-medium sm:block">
					{name}
				</span>
				<ChevronDown className="text-muted-foreground h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="flex flex-col gap-0.5">
					<span className="truncate font-semibold">{name}</span>
					{phone && (
						<span className="text-muted-foreground text-xs font-normal">
							{phone}
						</span>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to="/account">
						<User className="h-4 w-4" />
						Mon compte
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to={pendingStickers > 0 ? '/scan' : '/account/stickers'}>
						<QrCode className="h-4 w-4" />
						Mes stickers
						{pendingStickers > 0 && (
							<span className="bg-accent-orange text-accent-orange-foreground ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold">
								{pendingStickers}
							</span>
						)}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/account/settings">
						<Settings className="h-4 w-4" />
						Paramètres
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={onLogout}
					className="text-destructive focus:text-destructive"
				>
					<LogOut className="h-4 w-4" />
					Déconnexion
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
