import { Button } from '@retrouve-ci/ui/components'
import { Loader2, Send } from 'lucide-react'
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
				className="h-12 rounded-xl"
				onClick={() => navigate(-1)}
			>
				Annuler
			</Button>
			<Button
				type="submit"
				className={cn(
					'h-12 gap-2 rounded-xl text-white transition-all hover:shadow-lg sm:flex-1',
					submitClassName,
				)}
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						Publication...
					</>
				) : (
					<>
						<Send className="h-4 w-4" />
						Publier l&apos;annonce
					</>
				)}
			</Button>
		</div>
	)
}
