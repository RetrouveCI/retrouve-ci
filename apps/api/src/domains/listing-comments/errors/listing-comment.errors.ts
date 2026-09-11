import { ForbiddenError } from '@/shared/errors/domain.error'

export class ListingThreadForbiddenError extends ForbiddenError {
	constructor() {
		super('Only an administrator reads listing threads from the backoffice')
	}
}
