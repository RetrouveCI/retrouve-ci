'use client'

import { Button, Input, Label } from '@retrouve-ci/ui/components'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { PasswordInput } from './PasswordInput'

type Mode = 'login' | 'register' | 'forgot'

interface PhoneStepProps {
	mode: Mode
	phoneNumber: string
	setPhoneNumber: (v: string) => void
	password: string
	setPassword: (v: string) => void
	passwordError: string
	setPasswordError: (v: string) => void
	isSubmitting: boolean
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
	onSwitchMode: (m: Mode) => void
}

export function PhoneStep({
	mode,
	phoneNumber,
	setPhoneNumber,
	password,
	setPassword,
	passwordError,
	setPasswordError,
	isSubmitting,
	onSubmit,
	onSwitchMode,
}: PhoneStepProps) {
	return (
		<form onSubmit={onSubmit} className="space-y-5">
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
				<p className="text-muted-foreground text-xs">
					{mode === 'login'
						? 'Entrez le numéro associé à votre compte.'
						: 'Un code de vérification vous sera envoyé.'}
				</p>
			</div>

			{mode === 'login' && (
				<>
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
						<p className="text-destructive -mt-3 text-xs">{passwordError}</p>
					)}
					<div className="-mt-2 flex justify-end">
						<button
							type="button"
							onClick={() => onSwitchMode('forgot')}
							className="text-muted-foreground hover:text-foreground text-xs transition-colors"
						>
							Mot de passe oublié ?
						</button>
					</div>
				</>
			)}

			<Button
				type="submit"
				className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />{' '}
						{mode === 'login' ? 'Connexion...' : 'Envoi en cours...'}
					</>
				) : mode === 'login' ? (
					'Se connecter'
				) : (
					'Continuer'
				)}
			</Button>

			<div className="space-y-3 pt-2 text-center text-sm">
				{mode === 'login' && (
					<p className="text-muted-foreground">
						Pas encore de compte ?{' '}
						<button
							type="button"
							onClick={() => onSwitchMode('register')}
							className="text-primary-green font-semibold hover:underline"
						>
							Créer un compte
						</button>
					</p>
				)}
				{mode === 'register' && (
					<p className="text-muted-foreground">
						Déjà un compte ?{' '}
						<button
							type="button"
							onClick={() => onSwitchMode('login')}
							className="text-primary-green font-semibold hover:underline"
						>
							Se connecter
						</button>
					</p>
				)}
				{mode === 'forgot' && (
					<p className="text-muted-foreground">
						Retour à{' '}
						<button
							type="button"
							onClick={() => onSwitchMode('login')}
							className="text-primary-green font-semibold hover:underline"
						>
							la connexion
						</button>
					</p>
				)}
			</div>
		</form>
	)
}
