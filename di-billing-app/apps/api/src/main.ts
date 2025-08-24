// [SOURCE: apps/api/src/main.ts]
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This is the missing line that fixes the 404 errors.
  app.setGlobalPrefix('api');

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(4000);
}
bootstrap();