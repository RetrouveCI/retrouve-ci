import { Module } from '@nestjs/common'
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { createAuth } from './auth.config'

@Module({
	imports: [
		BetterAuthModule.forRootAsync({
			isGlobal: true,
			inject: [PrismaService],
			useFactory: (prisma: PrismaService) => ({
				auth: createAuth(prisma),
			}),
		}),
	],
})
export class AuthModule {}
