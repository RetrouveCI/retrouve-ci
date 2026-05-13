'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { Button, Input, Label } from '@retrouve-ci/ui/components'
import { PasswordInput } from '../components/PasswordInput'

export default function LoginPage() {
	const router = useRouter()
	const { login, isAuthenticated } = useAuth()

	const [phoneNumber, setPhoneNumber] = useState('')
	const [password, setPassword] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (isAuthenticated) router.push('/account')
	}, [isAuthenticated, router])

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (password.length < 4) {
			setPasswordError('Mot de passe trop court.')
			return
		}
		setPasswordError('')
		setIsSubmitting(true)
		const result = await login(phoneNumber, password)
		if (!result.success) {
			setPasswordError(result.error ?? 'Mot de passe incorrect.')
			setIsSubmitting(false)
			return
		}
		router.push('/account')
	}

	return (
		<>
			<div className="mb-6">
				<Link
					href="/"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour
				</Link>
			</div>

			<div className="mb-8">
				<h2 className="mb-2 text-2xl font-bold lg:text-3xl">Bon retour !</h2>
				<p className="text-muted-foreground">
					Connectez-vous pour accéder à votre compte.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5">
				<div className="space-y-2">
					<Label htmlFor="phone" className="text-sm font-medium">
						Numéro de téléphone
					</Label>
					<div className="flex gap-2">
						<div className="bg-muted/50 text-muted-foreground flex h-12 shrink-0 items-center rounded-xl border-2 px-4 text-sm font-medium">
							<Image
								src="/logo.png"
								alt=""
								width={18}
								height={18}
								className="mr-2 rounded-sm"
							/>
							+225
						</div>
						<Input
							id="phone"
							type="tel"
							placeholder="07 XX XX XX XX"
							value={phoneNumber}
							onChange={e => setPhoneNumber(e.target.value)}
							className="border-border bg-background focus:border-primary-green focus:ring-primary-green/20 h-12 flex-1 rounded-xl border-2 transition-all focus:ring-2"
							autoComplete="tel"
							autoFocus
						/>
					</div>
				</div>

				<div className="space-y-1">
					<PasswordInput
						id="password"
						label="Mot de passe"
						value={password}
						onChange={v => {
							setPassword(v)
							setPasswordError('')
						}}
						placeholder="••••••••"
						disabled={isSubmitting}
					/>
					{passwordError && (
						<p className="text-destructive text-xs">{passwordError}</p>
					)}
					<div className="flex justify-end pt-1">
						<Link
							href="/auth/password-forgotten"
							className="text-muted-foreground hover:text-foreground text-xs transition-colors"
						>
							Mot de passe oublié ?
						</Link>
					</div>
				</div>

				<Button
					type="submit"
					className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" /> Connexion...
						</>
					) : (
						'Se connecter'
					)}
				</Button>

				<p className="text-muted-foreground text-center text-sm">
					Pas encore de compte ?{' '}
					<Link
						href="/auth/register"
						className="text-primary-green font-semibold hover:underline"
					>
						Créer un compte
					</Link>
				</p>
			</form>
		</>
	)
}
