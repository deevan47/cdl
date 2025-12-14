// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    logger.log('Starting CDL Project Management Backend...');

    const app = await NestFactory.create(AppModule);
    logger.log('NestFactory application created successfully');

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`CDL Project Management Backend is running on port ${port}`);
  } catch (err) {
    logger.error('Failed to start application', err);
  }
}

bootstrap();