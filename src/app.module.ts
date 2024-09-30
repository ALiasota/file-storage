import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { FoldersModule } from './folders/folders.module';
import { FilesModule } from './files/files.module';
import { MailModule } from './mail/mail.module';
// import { DocumentsModule } from './documents/documents.module';

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `${process.env.NODE_ENV}.env`,
          isGlobal: true,
        }),
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('TYPEORM_HOST'),
          port: configService.get<number>('TYPEORM_PORT'),
          username: configService.get<string>('TYPEORM_USERNAME'),
          password: configService.get<string>('TYPEORM_PASSWORD'),
          database: configService.get<string>('TYPEORM_DATABASE'),
          synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE', false),
          logging: configService.get<boolean>('TYPEORM_LOGGING', true),
          entities: [configService.get<string>('TYPEORM_ENTITIES')],
          migrations: [configService.get<string>('TYPEORM_MIGRATIONS')],
          migrationsDir: configService.get<string>('TYPEORM_MIGRATIONS_DIR'),
          migrationsRun: configService.get<boolean>(
            'TYPEORM_MIGRATIONS_RUN',
            false,
          ),
          migrationsTableName: configService.get<string>(
            'TYPEORM_MIGRATIONS_TABLE_NAME',
          ),
          extra: {
            max: 10,
            idleTimeoutMillis: 30000,
          },
        };
      },
    }),

    UsersModule,
    AuthModule,
    FoldersModule,
    FilesModule,
    MailModule,
  ],
})
export class AppModule {}
