import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createPrismaClientOptions, PrismaClient } from '@retrouve-ci/database'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor() {
		super(createPrismaClientOptions())
	}

	async onModuleInit() {
		await this.$connect()
	}

	async onModuleDestroy() {
		await this.$disconnect()
	}
}
