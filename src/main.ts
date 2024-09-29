import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('File-Storage')
    .setDescription('REST API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}

start();
