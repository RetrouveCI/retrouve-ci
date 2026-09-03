import { requireServerSession } from '@/shared/helpers/session.server'
import { toContactName } from '@/shared/utils/display-name'

export async function publishLoader({ request }: { request: Request }) {
	const session = await requireServerSession(request)

	// What the finder reads on the listing. An account that never named itself
	// carries its own phone number, which is not a name to offer back.
	return { contactName: toContactName(session.user.name) }
}
