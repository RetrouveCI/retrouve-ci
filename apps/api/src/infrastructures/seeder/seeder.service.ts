import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import { resolveSystemAccountEmail } from '@/infrastructures/auth/system-account.email'

const DEV_SUPER_ADMIN_EMAIL = 'admin@retrouveci.ci'
const DEV_SUPER_ADMIN_PASSWORD = 'admin1234'

const DEV_SYSTEM_ACCOUNT_PASSWORD = 'equipe1234'
const DEV_SYSTEM_ACCOUNT_PHONE = '+2250758412209'

@Injectable()
export class SeederService implements OnApplicationBootstrap {
	private readonly logger = new Logger(SeederService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
		private readonly authService: AuthService<Auth>,
	) {}

	async onApplicationBootstrap(): Promise<void> {
		await this.seedSuperAdmin()
		await this.seedSystemAccount()
		await this.seedMockUser()
	}

	private get isProduction(): boolean {
		return this.config.get<string>('NODE_ENV') === 'production'
	}

	/**
	 * A development convenience must not become a production credential: unset,
	 * these fall back to values that are public in this repository.
	 */
	private requiredInProduction(key: string, devFallback: string): string {
		const value = this.config.get<string>(key)?.trim()

		if (value) return value

		if (this.isProduction) {
			throw new Error(
				`${key} is required in production: the super admin would otherwise be created with the well-known default from the repository.`,
			)
		}

		return devFallback
	}

	private async seedSuperAdmin(): Promise<void> {
		const email = this.requiredInProduction(
			'SUPER_ADMIN_EMAIL',
			DEV_SUPER_ADMIN_EMAIL,
		)

		const existing = await this.prisma.user.findUnique({ where: { email } })

		if (existing) {
			this.logger.log(`Compte super administrateur ${email} déjà créé.`)
			return
		}

		const password = this.requiredInProduction(
			'SUPER_ADMIN_PASSWORD',
			DEV_SUPER_ADMIN_PASSWORD,
		)

		const name = this.config.get<string>('SUPER_ADMIN_NAME', 'Super Admin')

		const result = await this.authService.api.signUpEmail({
			body: { email, password, name },
		})

		await this.prisma.user.update({
			where: { id: result.user.id },
			data: { role: 'admin', emailVerified: true },
		})

		this.logger.log(`Super admin créé : ${email}`)
	}

	private async seedMockUser(): Promise<void> {
		if (this.isProduction) return

		const email = this.config.get<string>(
			'SEED_MOCK_USER_EMAIL',
			'test@retrouveci.ci',
		)

		const password = this.config.get<string>(
			'SEED_MOCK_USER_PASSWORD',
			'test1234',
		)

		const name = this.config.get<string>(
			'SEED_MOCK_USER_NAME',
			'Utilisateur Test',
		)

		const phone = this.config.get<string>(
			'SEED_MOCK_USER_PHONE',
			'+2250700000001',
		)

		const existing = await this.prisma.user.findUnique({ where: { email } })
		if (existing) return

		try {
			const result = await this.authService.api.signUpEmail({
				body: { email, password, name },
			})

			await this.prisma.user.update({
				where: { id: result.user.id },
				data: {
					phoneNumber: phone,
					phoneNumberVerified: true,
					emailVerified: true,
				},
			})

			this.logger.log(`Utilisateur mock créé : ${email} / tél. ${phone}`)
		} catch (error) {
			this.logger.error(
				`Échec de la création de l'utilisateur mock : ${String(error)}`,
			)
		}
	}

	/**
	 * The account every team listing belongs to. Unlike the mock user this one
	 * is seeded **in production too**: a listing needs an owner, and it cannot be
	 * the administrator who filed it — the relation cascades, so their departure
	 * would erase everything the team ever published.
	 *
	 * It signs in like any account, but nobody is meant to: the password is
	 * required in production for the same reason the super admin's is, and the
	 * phone number is the team's public line, the one team listings display.
	 */
	private async seedSystemAccount(): Promise<void> {
		const email = resolveSystemAccountEmail(
			this.config.get<string>('SYSTEM_ACCOUNT_EMAIL'),
		)

		const existing = await this.prisma.user.findUnique({ where: { email } })

		if (existing) {
			this.logger.log(`Compte système ${email} déjà créé.`)
			return
		}

		const password = this.requiredInProduction(
			'SYSTEM_ACCOUNT_PASSWORD',
			DEV_SYSTEM_ACCOUNT_PASSWORD,
		)

		const name = this.config.get<string>(
			'SYSTEM_ACCOUNT_NAME',
			'Équipe RetrouveCI',
		)

		const phone = this.requiredInProduction(
			'SYSTEM_ACCOUNT_PHONE',
			DEV_SYSTEM_ACCOUNT_PHONE,
		)

		try {
			const result = await this.authService.api.signUpEmail({
				body: { email, password, name },
			})

			await this.prisma.user.update({
				where: { id: result.user.id },
				data: {
					phoneNumber: phone,
					phoneNumberVerified: true,
					emailVerified: true,
				},
			})

			this.logger.log(`Compte système créé : ${email} / tél. ${phone}`)
		} catch (error) {
			// Loud, and not fatal: the API still serves every other route, and a
			// failure here only refuses the backoffice's own publication.
			this.logger.error(
				`Échec de la création du compte système : ${String(error)}`,
			)
		}
	}
}
