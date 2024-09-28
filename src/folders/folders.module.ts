import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FolderEntity } from 'src/entities/folder.entity';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService],
  imports: [TypeOrmModule.forFeature([FolderEntity]), UsersModule],
  exports: [FoldersService],
})
export class FoldersModule {}
