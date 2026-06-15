import { Button } from '@retrouve-ci/ui/components'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@retrouve-ci/ui/utils'

interface PublishFormActionsProps {
	isSubmitting: boolean
	submitClassName: string
}

export function PublishFormActions({
	isSubmitting,
	submitClassName,
}: PublishFormActionsProps) {
	const navigate = useNavigate()

	return (
		<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
			<Button
				type="button"
				variant="outline"
				onClick={() => navigate(-1)}
			>
				Annuler
			</Button>
			<Button
				type="submit"
				className={cn('h-12 text-white sm:flex-1', submitClassName)}
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Publication...
					</>
				) : (
					"Publier l'annonce"
				)}
			</Button>
		</div>
	)
}
