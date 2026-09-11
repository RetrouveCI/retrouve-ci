import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@app/ui/components'
import type { ContactMessage } from '../../types/contact-messages.types'

export function MessageCard({ message }: { message: ContactMessage }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Message</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm leading-relaxed whitespace-pre-wrap">
					{message.message}
				</p>
				<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t pt-4 text-sm">
					<dt className="text-muted-foreground">Nom</dt>
					<dd>{message.name}</dd>
					{message.email && (
						<>
							<dt className="text-muted-foreground">E-mail</dt>
							<dd>{message.email}</dd>
						</>
					)}
					{message.phone && (
						<>
							<dt className="text-muted-foreground">Téléphone</dt>
							<dd className="font-mono">{message.phone}</dd>
						</>
					)}
					<dt className="text-muted-foreground">Origine</dt>
					<dd>
						{message.qrTokenCode ? (
							<>
								Sticker QR —{' '}
								<Link
									to={`/qr/${message.qrTokenCode}`}
									className="font-mono font-medium hover:underline"
								>
									{message.qrTokenCode}
								</Link>
							</>
						) : (
							'Formulaire de contact'
						)}
					</dd>
				</dl>
			</CardContent>
		</Card>
	)
}
