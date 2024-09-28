import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { GoogleGuard } from 'src/guards/google.guard';

@Controller('file')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @UseGuards(GoogleGuard)
  @Post('upload/:folderId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('folderId') folderId: number,
    @Body('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new ForbiddenException('File is missing');
    return this.filesService.uploadFile(userId, folderId, file);
  }

  @Get(':id')
  @UseGuards(GoogleGuard)
  async getFile(@Param('id') id: number, @Query('userId') userId: number) {
    return this.filesService.getFile(userId, id);
  }

  @Delete(':id')
  @UseGuards(GoogleGuard)
  async deleteFile(@Param('id') id: number, @Query('userId') userId: number) {
    return this.filesService.deleteFile(userId, id);
  }

  @Post(':id/edit-user')
  @UseGuards(GoogleGuard)
  async addEditUser(
    @Param('id') fileId: number,
    @Body('targetUserId') targetUserId: number,
  ) {
    return this.filesService.addEditUser(fileId, targetUserId);
  }

  @Delete(':id/edit-user')
  @UseGuards(GoogleGuard)
  async removeEditUser(
    @Param('id') fileId: number,
    @Body('targetUserId') targetUserId: number,
  ) {
    return this.filesService.removeEditUser(fileId, targetUserId);
  }
}
