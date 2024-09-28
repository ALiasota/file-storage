import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as session from 'express-session';

async function start() {
  const app = await NestFactory.create(AppModule);
  const configEnv = app.get(ConfigService);
  const PORT = configEnv.get<number>('PORT') || 5001;
  const secret = configEnv.get<string>('SESSION_SECRET');
  app.use(helmet());
  app.use(
    session.default({
      secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
      },
    }),
  );
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}

start();
