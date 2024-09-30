import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from 'src/entities/file.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FoldersModule } from 'src/folders/folders.module';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    forwardRef(() => FoldersModule),
    UsersModule,
    MailModule,
  ],
  exports: [FilesService],
})
export class FilesModule {}
