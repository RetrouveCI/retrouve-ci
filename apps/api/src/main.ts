import 'reflect-metadata'
import { config } from 'dotenv'

config()

import { NestFactory } from '@nestjs/core'
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import fastifyMultipart from '@fastify/multipart'
import { DomainExceptionFilter } from '@/shared/filters/domain-exception.filter'
import { MAX_PHOTO_SIZE } from '@/infrastructures/storage/storage.service'
import { AppModule } from './app.module'
import { getAllowedOrigins } from '@/shared/auth/allowed-origins'
import { createRateLimitHook } from '@/shared/rate-limit/rate-limit.hook'
import { createRedisCounter } from '@/shared/rate-limit/rate-limit.store'
import { getTrustProxyHops } from '@/shared/rate-limit/trust-proxy'

const DEFAULT_PORT = 3002
const DEFAULT_HOST = '0.0.0.0'
const SWAGGER_PATH = 'docs'
const logger = new Logger('Bootstrap')
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

/**
 * A Fastify hook, not a Nest guard: `@thallesp/nestjs-better-auth` answers
 * `/api/auth/*` from `httpAdapter.use()` itself, so those routes reach no
 * guard, interceptor or controller — `send-otp`, the one call that spends money
 * per hit, is exactly what a guard-based limiter would miss. Registered before
 * Nest builds anything, since `onRequest` hooks run in registration order and
 * Nest adds middie's during init.
 */
function withRateLimit(adapter: FastifyAdapter): FastifyAdapter {
	const url = process.env.REDIS_URL?.trim()

	if (!url) {
		if (process.env.NODE_ENV === 'production') {
			throw new Error(
				'REDIS_URL must point at the Redis instance in production: the rate limiter keeps its counters there, and without it every OTP and public write would be unlimited.',
			)
		}

		logger.warn('REDIS_URL unset: requests are not rate limited.')
		return adapter
	}

	const hook = createRateLimitHook({
		counter: createRedisCounter(url),
		onStoreError: error =>
			logger.error(`Rate limit store unreachable, allowing through: ${error}`),
	})

	adapter.getInstance().addHook('onRequest', hook)

	return adapter
}

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		withRateLimit(new FastifyAdapter({ trustProxy: getTrustProxyHops() })),
	)

	app.enableCors({
		origin: getAllowedOrigins(),
		credentials: true,
	})

	await app.register(fastifyMultipart, {
		throwFileSizeLimit: false,
		limits: { fileSize: MAX_PHOTO_SIZE, files: 1 },
	})

	app.useGlobalFilters(new DomainExceptionFilter())

	if (shouldExposeSwagger()) {
		setupSwagger(app)
	}

	const port = process.env.PORT ?? DEFAULT_PORT
	await app.listen(port, DEFAULT_HOST)
}

void bootstrap()
