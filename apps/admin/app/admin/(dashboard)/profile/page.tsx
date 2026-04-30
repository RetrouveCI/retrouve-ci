'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { TopBar } from '@/components/admin/topbar'
import { BentoCard } from '@/components/admin/bento-card'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import { Input } from '@retrouve-ci/ui/components/ui/input'
import { Label } from '@retrouve-ci/ui/components/ui/label'
import { Avatar, AvatarFallback } from '@retrouve-ci/ui/components/ui/avatar'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@retrouve-ci/ui/components/ui/tabs'
import { Badge } from '@retrouve-ci/ui/components/ui/badge'
import { Separator } from '@retrouve-ci/ui/components/ui/separator'
import {
	User,
	Mail,
	Phone,
	Shield,
	Calendar,
	Lock,
	Eye,
	EyeOff,
	Check,
	AlertCircle,
	ShieldCheck,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function ProfilePage() {
	const { user } = useAuth()
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	})
	const [passwordErrors, setPasswordErrors] = useState<string[]>([])

	const profileData = {
		phone: '+225 07 00 00 00 00',
		role: 'super_admin' as const,
		createdAt: '2023-06-01T00:00:00Z',
		lastLogin: '2024-04-07T08:30:00Z',
	}

	const getRoleLabel = (role: string) => {
		switch (role) {
			case 'super_admin':
				return 'Super Administrateur'
			case 'admin':
				return 'Administrateur'
			case 'moderator':
				return 'Modérateur'
			default:
				return role
		}
	}

	const validatePassword = (password: string): string[] => {
		const errors: string[] = []
		if (password.length < 8) errors.push('Au moins 8 caractères')
		if (!/[A-Z]/.test(password)) errors.push('Au moins une majuscule')
		if (!/[a-z]/.test(password)) errors.push('Au moins une minuscule')
		if (!/[0-9]/.test(password)) errors.push('Au moins un chiffre')
		return errors
	}

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault()
		setPasswordErrors([])
		if (passwordForm.currentPassword !== 'admin123') {
			setPasswordErrors(['Le mot de passe actuel est incorrect'])
			return
		}
		const newPasswordErrors = validatePassword(passwordForm.newPassword)
		if (newPasswordErrors.length > 0) {
			setPasswordErrors(newPasswordErrors)
			return
		}
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setPasswordErrors(['Les mots de passe ne correspondent pas'])
			return
		}
		setIsUpdatingPassword(true)
		await new Promise(r => setTimeout(r, 1000))
		setIsUpdatingPassword(false)
		setPasswordForm({
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		})
		toast.success('Mot de passe mis à jour avec succès')
	}

	const permissions = [
		{ label: 'Gérer les utilisateurs', allowed: true },
		{ label: 'Gérer les QR codes', allowed: true },
		{ label: 'Modérer les posts', allowed: true },
		{ label: 'Consulter les événements', allowed: true },
		{
			label: 'Gérer les administrateurs',
			allowed: profileData.role === 'super_admin',
		},
		{
			label: 'Accès aux paramètres système',
			allowed: profileData.role === 'super_admin',
		},
	]

	return (
		<>
			<TopBar title="Mon profil" />
			<div className="pt-16">
				<div className="p-4 lg:p-6">
					<Tabs defaultValue="info">
						<TabsList className="mb-6">
							<TabsTrigger value="info">Informations</TabsTrigger>
							<TabsTrigger value="security">Sécurité</TabsTrigger>
						</TabsList>

						{/* ─── Informations tab ─── */}
						<TabsContent value="info">
							<div className="grid gap-4 lg:grid-cols-3">
								{/* Identity card — spans 1 col on lg */}
								<BentoCard variant="content" className="lg:col-span-1">
									<div className="flex flex-col items-center gap-4 p-6 text-center">
										<Avatar className="h-20 w-20">
											<AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
												{user?.name?.charAt(0) || 'A'}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="text-xl font-bold">
												{user?.name || 'Admin User'}
											</h3>
											<p className="text-muted-foreground mb-2 text-sm">
												{user?.email || 'admin@retrouveci.com'}
											</p>
											<Badge className="gap-1">
												<ShieldCheck className="h-3.5 w-3.5" />
												{getRoleLabel(profileData.role)}
											</Badge>
										</div>
										<Separator className="w-full" />
										<div className="w-full space-y-3 text-left text-sm">
											<div className="flex items-center gap-3">
												<Phone className="text-muted-foreground h-4 w-4 shrink-0" />
												<span>{profileData.phone}</span>
											</div>
											<div className="flex items-center gap-3">
												<Mail className="text-muted-foreground h-4 w-4 shrink-0" />
												<span className="truncate">
													{user?.email || 'admin@retrouveci.com'}
												</span>
											</div>
											<div className="flex items-center gap-3">
												<Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
												<span>
													Depuis{' '}
													{format(
														new Date(profileData.createdAt),
														'MMMM yyyy',
														{ locale: fr },
													)}
												</span>
											</div>
											<div className="flex items-center gap-3">
												<User className="text-muted-foreground h-4 w-4 shrink-0" />
												<span className="text-muted-foreground text-xs">
													Dernière connexion :{' '}
													{format(
														new Date(profileData.lastLogin),
														"d MMM yyyy 'à' HH:mm",
														{ locale: fr },
													)}
												</span>
											</div>
										</div>
									</div>
								</BentoCard>

								{/* Permissions — spans 2 cols on lg */}
								<BentoCard variant="content" className="lg:col-span-2">
									<div className="p-6">
										<div className="mb-4 flex items-center gap-2">
											<Shield className="text-primary h-5 w-5" />
											<h4 className="text-lg font-semibold">Permissions</h4>
										</div>
										<p className="text-muted-foreground mb-5 text-sm">
											Les actions que vous pouvez effectuer sur la plateforme.
										</p>
										<div className="grid gap-3 sm:grid-cols-2">
											{permissions.map(permission => (
												<div
													key={permission.label}
													className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${
														permission.allowed
															? 'bg-primary/5 border-primary/20'
															: 'bg-muted/30'
													}`}
												>
													{permission.allowed ? (
														<div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
															<Check className="text-primary h-3.5 w-3.5" />
														</div>
													) : (
														<div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
															<AlertCircle className="text-muted-foreground h-3.5 w-3.5" />
														</div>
													)}
													<span
														className={`text-sm ${permission.allowed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
													>
														{permission.label}
													</span>
												</div>
											))}
										</div>
									</div>
								</BentoCard>
							</div>
						</TabsContent>

						{/* ─── Security tab ─── */}
						<TabsContent value="security">
							<div className="grid gap-4 lg:grid-cols-3">
								{/* Password form */}
								<BentoCard variant="content" className="lg:col-span-2">
									<div className="p-6">
										<div className="mb-4 flex items-center gap-2">
											<Lock className="text-primary h-5 w-5" />
											<h4 className="text-lg font-semibold">
												Changer le mot de passe
											</h4>
										</div>
										<p className="text-muted-foreground mb-5 text-sm">
											Mettez à jour votre mot de passe pour sécuriser votre
											compte.
										</p>
										<form
											onSubmit={handlePasswordChange}
											className="max-w-md space-y-4"
										>
											<div className="space-y-2">
												<Label htmlFor="currentPassword">
													Mot de passe actuel
												</Label>
												<div className="relative">
													<Input
														id="currentPassword"
														type={showCurrentPassword ? 'text' : 'password'}
														value={passwordForm.currentPassword}
														onChange={e =>
															setPasswordForm(p => ({
																...p,
																currentPassword: e.target.value,
															}))
														}
														required
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
														onClick={() =>
															setShowCurrentPassword(!showCurrentPassword)
														}
													>
														{showCurrentPassword ? (
															<EyeOff className="text-muted-foreground h-4 w-4" />
														) : (
															<Eye className="text-muted-foreground h-4 w-4" />
														)}
													</Button>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="newPassword">
													Nouveau mot de passe
												</Label>
												<div className="relative">
													<Input
														id="newPassword"
														type={showNewPassword ? 'text' : 'password'}
														value={passwordForm.newPassword}
														onChange={e =>
															setPasswordForm(p => ({
																...p,
																newPassword: e.target.value,
															}))
														}
														required
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
														onClick={() => setShowNewPassword(!showNewPassword)}
													>
														{showNewPassword ? (
															<EyeOff className="text-muted-foreground h-4 w-4" />
														) : (
															<Eye className="text-muted-foreground h-4 w-4" />
														)}
													</Button>
												</div>
												<p className="text-muted-foreground text-xs">
													Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
												</p>
											</div>
											<div className="space-y-2">
												<Label htmlFor="confirmPassword">
													Confirmer le mot de passe
												</Label>
												<div className="relative">
													<Input
														id="confirmPassword"
														type={showConfirmPassword ? 'text' : 'password'}
														value={passwordForm.confirmPassword}
														onChange={e =>
															setPasswordForm(p => ({
																...p,
																confirmPassword: e.target.value,
															}))
														}
														required
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
														onClick={() =>
															setShowConfirmPassword(!showConfirmPassword)
														}
													>
														{showConfirmPassword ? (
															<EyeOff className="text-muted-foreground h-4 w-4" />
														) : (
															<Eye className="text-muted-foreground h-4 w-4" />
														)}
													</Button>
												</div>
											</div>
											{passwordErrors.length > 0 && (
												<div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">
													<ul className="list-inside list-disc space-y-1">
														{passwordErrors.map((e, i) => (
															<li key={i}>{e}</li>
														))}
													</ul>
												</div>
											)}
											<Button type="submit" disabled={isUpdatingPassword}>
												{isUpdatingPassword
													? 'Mise à jour...'
													: 'Mettre à jour le mot de passe'}
											</Button>
										</form>
									</div>
								</BentoCard>

								{/* Active sessions */}
								<BentoCard variant="content" className="lg:col-span-1">
									<div className="p-6">
										<div className="mb-4 flex items-center gap-2">
											<User className="text-primary h-5 w-5" />
											<h4 className="text-lg font-semibold">
												Sessions actives
											</h4>
										</div>
										<div className="bg-primary/5 border-primary/20 rounded-xl border p-4">
											<div className="mb-3 flex items-center gap-3">
												<div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
													<User className="text-primary h-4 w-4" />
												</div>
												<div>
													<p className="text-sm font-medium">
														Session actuelle
													</p>
													<p className="text-muted-foreground text-xs">
														Navigateur web
													</p>
												</div>
											</div>
											<p className="text-muted-foreground text-xs">
												Abidjan, Côte d&apos;Ivoire
											</p>
											<Badge
												variant="outline"
												className="bg-primary/10 text-primary border-primary/20 mt-3 text-xs"
											>
												Active
											</Badge>
										</div>
									</div>
								</BentoCard>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	)
}
