import 'reflect-metadata'
import { config } from 'dotenv'

config()

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import fastifyMultipart from '@fastify/multipart'
import { DomainExceptionFilter } from '@/shared/filters/domain-exception.filter'
import { MAX_PHOTO_SIZE } from '@/infrastructure/storage/storage.service'
import { AppModule } from './app.module'

const DEFAULT_PORT = 3002
const DEFAULT_HOST = '0.0.0.0'
const SWAGGER_PATH = 'docs'
const DEFAULT_ALLOWED_ORIGINS = [
	'http://localhost:3000',
	'http://localhost:3001',
]

function getAllowedOrigins(): string[] {
	const configuredOrigins = process.env.ALLOWED_ORIGINS?.split(',')
		.map(origin => origin.trim())
		.filter(Boolean)

	if (configuredOrigins?.length) {
		return configuredOrigins
	}

	return process.env.NODE_ENV === 'production' ? [] : DEFAULT_ALLOWED_ORIGINS
}

function shouldExposeSwagger(): boolean {
	return (
		process.env.NODE_ENV !== 'production' ||
		process.env.ENABLE_SWAGGER === 'true'
	)
}

function setupSwagger(app: NestFastifyApplication): void {
	const config = new DocumentBuilder()
		.setTitle('RetrouveCI API')
		.setDescription('API du service de gestion des objets perdus et trouvés')
		.setVersion('1.0')
		.addBearerAuth()
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup(SWAGGER_PATH, app, document)
}

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	)

	app.enableCors({
		origin: getAllowedOrigins(),
		credentials: true,
	})

	await app.register(fastifyMultipart, {
		throwFileSizeLimit: false,
		limits: { fileSize: MAX_PHOTO_SIZE, files: 1 },
	})

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	)

	app.useGlobalFilters(new DomainExceptionFilter())

	if (shouldExposeSwagger()) {
		setupSwagger(app)
	}

	const port = process.env.PORT ?? DEFAULT_PORT
	await app.listen(port, DEFAULT_HOST)
}

void bootstrap()
