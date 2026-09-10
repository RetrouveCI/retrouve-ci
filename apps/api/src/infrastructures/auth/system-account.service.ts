import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import { resolveSystemAccountEmail } from './system-account.email'

/**
 * The account every team listing belongs to.
 *
 * A listing needs an owner — `LostItem.userId` is not nullable — and the owner
 * cannot be the administrator who filed it: the relation cascades, so their
 * departure would erase every listing the team ever published. `SeederService`
 * creates this account at boot; this service is the one place that resolves it.
 *
 * The id is cached after the first lookup. The row is created once and never
 * replaced, so re-reading it on every publication would be a query for nothing.
 */
@Injectable()
export class SystemAccountService {
	private readonly logger = new Logger(SystemAccountService.name)
	private cachedId: string | null = null

	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
	) {}

	get email(): string {
		return resolveSystemAccountEmail(
			this.config.get<string>('SYSTEM_ACCOUNT_EMAIL'),
		)
	}

	/**
	 * Throws rather than falling back on the caller: publishing as the team when
	 * the team account is missing would file the listing under an administrator,
	 * which is the one thing this account exists to prevent.
	 */
	async requireId(): Promise<string> {
		if (this.cachedId) return this.cachedId

		const account = await this.prisma.user.findUnique({
			where: { email: this.email },
			select: { id: true },
		})

		if (!account) {
			this.logger.error(
				`Compte système ${this.email} introuvable : la publication au nom de l'équipe est impossible.`,
			)
			throw new SystemAccountMissingError()
		}

		this.cachedId = account.id

		return account.id
	}
}

export class SystemAccountMissingError extends Error {
	constructor() {
		super(
			"Le compte de l'équipe RetrouveCI est introuvable. Contactez un administrateur.",
		)
		this.name = 'SystemAccountMissingError'
	}
}
