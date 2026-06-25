import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructure/auth/auth.config'
import { PrismaService } from '@/infrastructure/database/prisma.service'

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
		await this.seedMockUser()
	}

	private async seedSuperAdmin(): Promise<void> {
		const email = this.config.get<string>(
			'SUPER_ADMIN_EMAIL',
			'admin@retrouveci.ci',
		)

		const password = this.config.get<string>(
			'SUPER_ADMIN_PASSWORD',
			'admin1234',
		)

		const name = this.config.get<string>('SUPER_ADMIN_NAME', 'Super Admin')

		const existing = await this.prisma.user.findUnique({ where: { email } })
		if (existing) return

		try {
			const result = await this.authService.api.signUpEmail({
				body: { email, password, name },
			})

			await this.prisma.user.update({
				where: { id: result.user.id },
				data: { role: 'admin', emailVerified: true },
			})

			this.logger.log(`Super admin créé : ${email}`)
		} catch (error) {
			this.logger.error(
				`Échec de la création du super admin : ${String(error)}`,
			)
		}
	}

	private async seedMockUser(): Promise<void> {
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
}
