// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    logger.log('Starting CDL Project Management Backend...');

    logger.debug('Creating NestFactory application...');
    const app = await NestFactory.create(AppModule);
    logger.log('NestFactory application created successfully');

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    logger.debug('Global validation pipes configured');

    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    logger.debug(`CORS enabled for origin: ${process.env.FRONTEND_URL || '*'}`);


    app.use((req: any, res: any, next: any) => {
      // ... your request logger ...
      logger.debug(`[${req.method}] ${req.url} incoming - body=${JSON.stringify(req.body) || '{}'}`);
      next();
    });

    await app.listen(3000, '0.0.0.0');
    logger.log(`CDL Project Management Backend is running on: ${process.env.BACKEND_URL || 'http://localhost:3000'}`);
  } catch (err) {
  }
}

bootstrap();