import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Body,
  Param,
  Put,
  Req,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { GoogleAuthGuard } from 'src/guards/jwt.guard';

@ApiTags('Folders')
@Controller('folder')
export class FoldersController {
  constructor(private foldersService: FoldersService) {}

  @UseGuards(GoogleAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({ status: 201, description: 'Folder created successfully' })
  async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @Req() req: Request,
  ) {
    const userId = req.user['id'];
    return this.foldersService.createFolder(createFolderDto, userId);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('get/:id')
  @ApiOperation({ summary: 'Get folder tree by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 200, description: 'Returns the folder tree' })
  async getFolderTree(@Param('id') folderId: number, @Req() req: Request) {
    const userId = req.user['id'];
    return this.foldersService.getFolderTree(folderId, userId);
  }

  @UseGuards(GoogleAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 200, description: 'Folder deleted successfully' })
  async deleteFolder(@Param('id') folderId: number, @Req() req: Request) {
    const userId = req.user['id'];
    return this.foldersService.deleteFolder(folderId, userId);
  }

  @UseGuards(GoogleAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 200, description: 'Folder updated successfully' })
  async updateFolder(
    @Param('id') folderId: number,
    @Body() updateFolderDto: UpdateFolderDto,
    @Req() req: Request,
  ) {
    const userId = req.user['id'];
    return this.foldersService.updateFolder(folderId, updateFolderDto, userId);
  }

  @UseGuards(GoogleAuthGuard)
  @Post(':id/view-user')
  @ApiOperation({ summary: 'Add user to view permissions for a folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 200, description: 'User added to view permissions' })
  async addViewUser(
    @Param('id') folderId: number,
    @Req() req: Request,
    @Body('targetUserId') targetUserId: number,
  ) {
    const userId = req.user['id'];
    return this.foldersService.addViewUser(folderId, userId, targetUserId);
  }

  @UseGuards(GoogleAuthGuard)
  @Post(':id/edit-user')
  @ApiOperation({ summary: 'Add user to edit permissions for a folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 200, description: 'User added to edit permissions' })
  async addEditUser(
    @Param('id') folderId: number,
    @Req() req: Request,
    @Body('targetUserId') targetUserId: number,
  ) {
    const userId = req.user['id'];
    return this.foldersService.addEditUser(folderId, userId, targetUserId);
  }

  @Delete(':id/view-user')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Remove user from view permissions for a folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'User removed from view permissions',
  })
  async removeViewUser(
    @Param('id') folderId: number,
    @Req() req: Request,
    @Body('targetUserId') targetUserId: number,
  ) {
    const userId = req.user['id'];
    return this.foldersService.removeViewUser(folderId, userId, targetUserId);
  }

  @Delete(':id/edit-user')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Remove user from edit permissions for a folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'User removed from edit permissions',
  })
  async removeEditUser(
    @Param('id') folderId: number,
    @Req() req: Request,
    @Body('targetUserId') targetUserId: number,
  ) {
    const userId = req.user['id'];
    return this.foldersService.removeEditUser(folderId, userId, targetUserId);
  }

  @Post(':folderId/clone')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Clone a folder' })
  @ApiParam({ name: 'folderId', description: 'Folder ID to be cloned' })
  @ApiResponse({ status: 200, description: 'Folder cloned successfully' })
  async cloneFolderController(
    @Param('folderId') folderId: number,
    @Req() req: Request,
  ) {
    const userId = req.user['id'];
    return this.foldersService.cloneFolder(folderId, userId, userId);
  }

  @Get('search')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Search folders by name' })
  @ApiQuery({ name: 'name', description: 'Folder name', required: true })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchFolders(@Req() req: Request, @Query('name') name: string) {
    const userId = req.user['id'];
    return this.foldersService.searchFoldersByName(userId, name);
  }
}
