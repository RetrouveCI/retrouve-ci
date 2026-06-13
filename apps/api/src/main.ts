import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DomainExceptionFilter } from './shared/filters/domain-exception.filter'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.enableCors()
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	)
	app.useGlobalFilters(new DomainExceptionFilter())

	const port = process.env.PORT ?? 3002
	await app.listen(port)
}

void bootstrap()
