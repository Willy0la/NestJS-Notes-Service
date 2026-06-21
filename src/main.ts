import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const connection = app.get<Connection>(getConnectionToken());
  connection.once('connected', () => {
 
  });
  const port = config.get<number>('PORT', 2398);
  await app.listen(port);
 
 
}
void bootstrap();
