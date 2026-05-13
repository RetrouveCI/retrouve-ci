'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PhoneStep } from '../components/PhoneStep'

export default function PasswordForgottenPage() {
	const router = useRouter()
	const [phoneNumber, setPhoneNumber] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const cleaned = phoneNumber.replace(/\s/g, '')
		if (!cleaned || cleaned.length < 8) {
			toast.error('Veuillez entrer un numéro valide')
			return
		}
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1000))
		setIsSubmitting(false)
		toast.success('Code envoyé !', { description: 'Vérifiez vos SMS ou WhatsApp.' })
		router.push(`/auth/reset-password?phone=${encodeURIComponent(phoneNumber)}`)
	}

	return (
		<>
			<div className="mb-6">
				<Link
					href="/auth/login"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour
				</Link>
			</div>

			<div className="mb-8">
				<h2 className="mb-2 text-2xl font-bold lg:text-3xl">Mot de passe oublié</h2>
				<p className="text-muted-foreground">Réinitialisez votre mot de passe.</p>
			</div>

			<PhoneStep
				phoneNumber={phoneNumber}
				setPhoneNumber={setPhoneNumber}
				isSubmitting={isSubmitting}
				onSubmit={handleSubmit}
				hint="Entrez votre numéro pour recevoir un code de vérification."
				submitLabel="Envoyer le code"
			/>

			<p className="text-muted-foreground mt-6 text-center text-sm">
				Retour à{' '}
				<Link
					href="/auth/login"
					className="text-primary-green font-semibold hover:underline"
				>
					la connexion
				</Link>
			</p>
		</>
	)
}
