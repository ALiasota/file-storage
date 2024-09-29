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
  ForbiddenException,
  NotFoundException,
  Req,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileEntity } from 'src/entities/file.entity';
import { GoogleAuthGuard } from 'src/guards/jwt.guard';

@ApiTags('Files')
@Controller('file')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Upload a file to a folder' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'folderId', type: 'integer', description: 'Folder ID' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileEntity,
  })
  @Post('upload/:folderId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('folderId') folderId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req.user['id'];
    if (!file) throw new ForbiddenException('File is missing');
    return this.filesService.uploadFile(userId, folderId, file);
  }

  @ApiOperation({ summary: 'Get a file by ID' })
  @ApiParam({ name: 'id', type: 'integer', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File details', type: FileEntity })
  @Get('get/:id')
  @UseGuards(GoogleAuthGuard)
  async getFile(@Param('id') id: number, @Req() req: Request) {
    const userId = req.user['id'];
    return this.filesService.getFile(userId, id);
  }

  @ApiOperation({ summary: 'Delete a file by ID' })
  @ApiParam({ name: 'id', type: 'integer', description: 'File ID' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @Delete(':id')
  @UseGuards(GoogleAuthGuard)
  async deleteFile(@Param('id') id: number, @Req() req: Request) {
    const userId = req.user['id'];
    return this.filesService.deleteFile(userId, id);
  }

  @ApiOperation({ summary: 'Add a user to edit permissions for a file' })
  @ApiParam({ name: 'id', type: 'integer', description: 'File ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { targetUserId: { type: 'integer' } },
    },
  })
  @ApiResponse({ status: 200, description: 'User added to edit permissions' })
  @Post(':id/edit-user')
  @UseGuards(GoogleAuthGuard)
  async addEditUser(
    @Param('id') fileId: number,
    @Req() req: Request,
    @Body('targetUserId') targetUserId: number,
  ) {
    const userId = req.user['id'];
    return this.filesService.addEditUser(fileId, userId, targetUserId);
  }

  @ApiOperation({ summary: 'Remove a user from edit permissions for a file' })
  @ApiParam({ name: 'id', type: 'integer', description: 'File ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { targetUserId: { type: 'integer' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User removed from edit permissions',
  })
  @Delete(':id/edit-user')
  @UseGuards(GoogleAuthGuard)
  async removeEditUser(
    @Param('id') fileId: number,
    @Req() req: Request,
    @Body('targetUserId') targetUserId: number,
  ) {
    const userId = req.user['id'];
    return this.filesService.removeEditUser(fileId, userId, targetUserId);
  }

  @ApiOperation({ summary: 'Add a user to view permissions for a file' })
  @ApiParam({ name: 'id', type: 'integer', description: 'File ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { targetUserId: { type: 'integer' } },
    },
  })
  @ApiResponse({ status: 200, description: 'User added to view permissions' })
  @Post(':id/view-user')
  @UseGuards(GoogleAuthGuard)
  async addViewUser(
    @Param('id') fileId: number,
    @Req() req: Request,
    @Body('targetUserId') targetUserId: number,
  ) {
    const userId = req.user['id'];
    return this.filesService.addViewUser(fileId, userId, targetUserId);
  }

  @ApiOperation({ summary: 'Remove a user from view permissions for a file' })
  @ApiParam({ name: 'id', type: 'integer', description: 'File ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { targetUserId: { type: 'integer' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User removed from view permissions',
  })
  @Delete(':id/view-user')
  @UseGuards(GoogleAuthGuard)
  async removeViewUser(
    @Param('id') fileId: number,
    @Req() req: Request,
    @Body('targetUserId') targetUserId: number,
  ) {
    const userId = req.user['id'];
    return this.filesService.removeViewUser(fileId, userId, targetUserId);
  }

  @ApiOperation({ summary: 'Clone a file' })
  @ApiParam({ name: 'fileId', type: 'integer', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File cloned successfully' })
  @Post(':fileId/clone')
  @UseGuards(GoogleAuthGuard)
  async cloneFileController(
    @Param('fileId') fileId: number,
    @Req() req: Request,
  ) {
    const userId = req.user['id'];
    const file = await this.filesService.getFileDB(userId, fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return this.filesService.cloneFile(file, file.folderId, userId);
  }

  @ApiOperation({ summary: 'Search files by name' })
  @ApiQuery({ name: 'name', type: 'string', description: 'File name' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [FileEntity],
  })
  @Get('search')
  @UseGuards(GoogleAuthGuard)
  async searchFiles(@Req() req: Request, @Query('name') name: string) {
    const userId = req.user['id'];
    return this.filesService.searchFilesByName(userId, name);
  }
}
