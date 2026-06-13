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

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
	globalForPrisma.prisma ?? new PrismaClient(createPrismaClientOptions())

if (process.env['NODE_ENV'] !== 'production') {
	globalForPrisma.prisma = prisma
}
