import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DomainExceptionFilter } from '@/shared/filters/domain-exception.filter'
import { AppModule } from './app.module'

const DEFAULT_PORT = 3002
const DEFAULT_HOST = '0.0.0.0'

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	)

	app.enableCors()
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	)

	app.useGlobalFilters(new DomainExceptionFilter())

	const port = process.env.PORT ?? DEFAULT_PORT
	await app.listen(port, DEFAULT_HOST)
}

void bootstrap()
