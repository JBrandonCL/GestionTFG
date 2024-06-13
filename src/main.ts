import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import * as process from 'process'
import { readFileSync } from 'fs'
import * as path from 'path'

dotenv.config()
async function bootstrap() {
  const httpsOptions = {
    key: readFileSync(path.resolve(process.env.SSL_KEY)),
    cert: readFileSync(path.resolve(process.env.SSL_CERT)),
  }
  const app = await NestFactory.create(AppModule,{httpsOptions});
  app.setGlobalPrefix(process.env.API_VERSION || 'v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
