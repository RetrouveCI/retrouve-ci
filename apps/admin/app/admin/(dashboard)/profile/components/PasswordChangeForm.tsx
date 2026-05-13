import { Button, Input, Label } from '@retrouve-ci/ui/components'
import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { BentoCard } from '@/components/admin/bento-card'
import { toast } from 'sonner'

const validatePassword = (password: string): string[] => {
	const errors: string[] = []
	if (password.length < 8) errors.push('Au moins 8 caractères')
	if (!/[A-Z]/.test(password)) errors.push('Au moins une majuscule')
	if (!/[a-z]/.test(password)) errors.push('Au moins une minuscule')
	if (!/[0-9]/.test(password)) errors.push('Au moins un chiffre')
	return errors
}

export function PasswordChangeForm() {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [form, setForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	})
	const [errors, setErrors] = useState<string[]>([])

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setErrors([])
		if (form.currentPassword !== 'admin123') {
			setErrors(['Le mot de passe actuel est incorrect'])
			return
		}
		const newPasswordErrors = validatePassword(form.newPassword)
		if (newPasswordErrors.length > 0) {
			setErrors(newPasswordErrors)
			return
		}
		if (form.newPassword !== form.confirmPassword) {
			setErrors(['Les mots de passe ne correspondent pas'])
			return
		}
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1000))
		setIsSubmitting(false)
		setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
		toast.success('Mot de passe mis à jour avec succès')
	}

	return (
		<BentoCard variant="content" className="lg:col-span-2">
			<div className="p-6">
				<div className="mb-4 flex items-center gap-2">
					<Lock className="text-primary h-5 w-5" />
					<h4 className="text-lg font-semibold">Changer le mot de passe</h4>
				</div>
				<p className="text-muted-foreground mb-5 text-sm">
					Mettez à jour votre mot de passe pour sécuriser votre compte.
				</p>
				<form onSubmit={handleSubmit} className="max-w-md space-y-4">
					{[
						{
							id: 'currentPassword',
							label: 'Mot de passe actuel',
							show: showCurrentPassword,
							toggle: () => setShowCurrentPassword(p => !p),
							field: 'currentPassword' as const,
						},
						{
							id: 'newPassword',
							label: 'Nouveau mot de passe',
							show: showNewPassword,
							toggle: () => setShowNewPassword(p => !p),
							field: 'newPassword' as const,
							hint: 'Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre',
						},
						{
							id: 'confirmPassword',
							label: 'Confirmer le mot de passe',
							show: showConfirmPassword,
							toggle: () => setShowConfirmPassword(p => !p),
							field: 'confirmPassword' as const,
						},
					].map(({ id, label, show, toggle, field, hint }) => (
						<div key={id} className="space-y-2">
							<Label htmlFor={id}>{label}</Label>
							<div className="relative">
								<Input
									id={id}
									type={show ? 'text' : 'password'}
									value={form[field]}
									onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
									required
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
									onClick={toggle}
								>
									{show ? (
										<EyeOff className="text-muted-foreground h-4 w-4" />
									) : (
										<Eye className="text-muted-foreground h-4 w-4" />
									)}
								</Button>
							</div>
							{hint && <p className="text-muted-foreground text-xs">{hint}</p>}
						</div>
					))}
					{errors.length > 0 && (
						<div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">
							<ul className="list-inside list-disc space-y-1">
								{errors.map((e, i) => (
									<li key={i}>{e}</li>
								))}
							</ul>
						</div>
					)}
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
					</Button>
				</form>
			</div>
		</BentoCard>
	)
}
