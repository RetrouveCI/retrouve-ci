'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export interface PublishFormData {
	objectType: string
	description: string
	ville: string
	commune: string
	date: string
	name: string
	whatsapp: string
}

export function usePublishForm(successMessage: string) {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [formData, setFormData] = useState<PublishFormData>({
		objectType: '',
		description: '',
		ville: '',
		commune: '',
		date: '',
		name: '',
		whatsapp: '',
	})

	const update = (key: keyof PublishFormData) => (value: string) =>
		setFormData(prev => ({ ...prev, [key]: value }))

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onloadend = () => setImagePreview(reader.result as string)
		reader.readAsDataURL(file)
	}

	const completedFieldCount = [
		formData.objectType,
		formData.description.length >= 20,
		formData.ville,
		formData.name,
		formData.whatsapp,
	].filter(Boolean).length

	const progress = Math.round((completedFieldCount / 5) * 100)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.objectType || !formData.description || !formData.ville) {
			toast.error('Veuillez remplir tous les champs obligatoires')
			return
		}

		if (formData.description.length < 20) {
			toast.error('La description doit contenir au moins 20 caractères')
			return
		}
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1500))
		toast.success('Annonce publiée !', { description: successMessage })
		router.push('/annonces')
	}

	return {
		formData,
		update,
		imagePreview,
		setImagePreview,
		handleImageChange,
		progress,
		isSubmitting,
		handleSubmit,
	}
}
