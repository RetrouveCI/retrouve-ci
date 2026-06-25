import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

type PrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0]

export function createPrismaClientOptions(): PrismaClientOptions {
	return {
		adapter: new PrismaPg({
			connectionString:
				process.env['PGBOUNCER_URL'] ?? process.env['DATABASE_URL'],
		}),
		log: ['error'],
	}
}
