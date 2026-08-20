import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { SessionGuard } from '@/shared/auth/guards/session.guard'
import { createAdminAuth, createClientAuth } from './auth.config'
import { ADMIN_AUTH, CLIENT_AUTH } from './auth.tokens'

/**
 * Both instances are built here so each is created once, and so the two
 * `BetterAuthModule` registrations below can be handed an existing instance
 * rather than building their own.
 */
@Global()
@Module({
	providers: [
		{
			provide: CLIENT_AUTH,
			inject: [PrismaService],
			useFactory: (prisma: PrismaService) => createClientAuth(prisma),
		},
		{
			provide: ADMIN_AUTH,
			inject: [PrismaService],
			useFactory: (prisma: PrismaService) => createAdminAuth(prisma),
		},
	],
	exports: [CLIENT_AUTH, ADMIN_AUTH],
})
export class AuthInstancesModule {}

@Module({
	imports: [
		AuthInstancesModule,
		// The public app's instance, on the default `/api/auth`. Global, so
		// `AuthService` and the hooks resolve app-wide.
		BetterAuthModule.forRootAsync({
			isGlobal: true,
			disableGlobalAuthGuard: true,
			imports: [AuthInstancesModule],
			inject: [CLIENT_AUTH],
			useFactory: (auth: ReturnType<typeof createClientAuth>) => ({ auth }),
		}),
		// The backoffice's instance, on its own base path. Scoped, because the
		// package binds its options to a single injection token and a second global
		// registration would take over `AuthService`.
		BetterAuthModule.forRootAsync({
			isGlobal: false,
			disableGlobalAuthGuard: true,
			imports: [AuthInstancesModule],
			inject: [ADMIN_AUTH],
			useFactory: (auth: ReturnType<typeof createAdminAuth>) => ({ auth }),
		}),
	],
	providers: [{ provide: APP_GUARD, useClass: SessionGuard }],
})
export class AuthModule {}
