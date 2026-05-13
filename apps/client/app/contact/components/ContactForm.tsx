'use client'

import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

export function ContactForm() {
	const [form, setForm] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	})
	const [submitted, setSubmitted] = useState(false)

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setSubmitted(true)
	}

	if (submitted) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
				<div className="bg-primary-green/10 flex h-16 w-16 items-center justify-center rounded-full">
					<CheckCircle2 className="text-primary-green h-8 w-8" />
				</div>
				<div>
					<p className="mb-1 text-lg font-semibold">Message envoyé !</p>
					<p className="text-muted-foreground text-sm">
						Nous vous répondrons dans les 24 heures.
					</p>
				</div>
				<button
					onClick={() => {
						setSubmitted(false)
						setForm({ name: '', email: '', subject: '', message: '' })
					}}
					className="text-primary-green text-sm hover:underline"
				>
					Envoyer un autre message
				</button>
			</div>
		)
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<label className="text-sm font-medium">Nom complet</label>
					<input
						type="text"
						required
						placeholder="Konan Yao"
						value={form.name}
						onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
						className="bg-muted/30 focus:border-primary-green/50 focus:ring-primary-green/30 h-11 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:ring-2"
					/>
				</div>
				<div className="space-y-1.5">
					<label className="text-sm font-medium">Email</label>
					<input
						type="email"
						required
						placeholder="vous@exemple.ci"
						value={form.email}
						onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
						className="bg-muted/30 focus:border-primary-green/50 focus:ring-primary-green/30 h-11 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:ring-2"
					/>
				</div>
			</div>
			<div className="space-y-1.5">
				<label className="text-sm font-medium">Sujet</label>
				<input
					type="text"
					required
					placeholder="Comment pouvons-nous vous aider ?"
					value={form.subject}
					onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
					className="bg-muted/30 focus:border-primary-green/50 focus:ring-primary-green/30 h-11 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:ring-2"
				/>
			</div>
			<div className="space-y-1.5">
				<label className="text-sm font-medium">Message</label>
				<textarea
					required
					rows={5}
					placeholder="Décrivez votre demande..."
					value={form.message}
					onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
					className="bg-muted/30 focus:border-primary-green/50 focus:ring-primary-green/30 w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2"
				/>
			</div>
			<button
				type="submit"
				className="bg-primary-green hover:bg-primary-green-dark flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-colors"
			>
				<Send className="h-4 w-4" />
				Envoyer le message
			</button>
		</form>
	)
}
