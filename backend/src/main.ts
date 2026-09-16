import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);
  app.use(cookieParser());
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: config.get('corsOrigins', { infer: true }),
    credentials: true,
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ULCRS API')
    .setDescription(
      'University of Lagos Course Registration System API. Auth via email/password (httpOnly cookies).',
    )
    .setVersion('0.1.0')
    .addCookieAuth(config.get('cookieNames', { infer: true }).access)
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  const port = config.get('port', { infer: true });
  await app.listen(port);
  console.log(`ulcrs-api listening on :${port} (docs at /docs)`);
}
void bootstrap();
