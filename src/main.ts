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
    console.log('MongoDB connection established successfully');
  });
  const port = config.get<number>('PORT', 2398);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);

  console.log('process.env.DB:', process.env.DB);
  console.log('process.env.NODE_ENV:', process.env.NODE_ENV);

  app.setGlobalPrefix('note-app');
}
void bootstrap();
