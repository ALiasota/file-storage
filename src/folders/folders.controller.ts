import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Body,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { GoogleGuard } from 'src/guards/google.guard';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Controller('folder')
export class FoldersController {
  constructor(private foldersService: FoldersService) {}

  @UseGuards(GoogleGuard)
  @Post()
  async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @Body('userId') userId: number,
  ) {
    return this.foldersService.createFolder(createFolderDto, userId);
  }

  @UseGuards(GoogleGuard)
  @Get(':id')
  async getFolderTree(
    @Param('id') folderId: number,
    @Query('userId') userId: number,
  ) {
    return this.foldersService.getFolderTree(folderId, userId);
  }

  @UseGuards(GoogleGuard)
  @Delete(':id')
  async deleteFolder(
    @Param('id') folderId: number,
    @Query('userId') userId: number,
  ) {
    return this.foldersService.deleteFolder(folderId, userId);
  }

  @UseGuards(GoogleGuard)
  @Put(':id')
  async updateFolder(
    @Param('id') folderId: number,
    @Body() updateFolderDto: UpdateFolderDto,
    @Query('userId') userId: number,
  ) {
    return this.foldersService.updateFolder(folderId, updateFolderDto, userId);
  }

  @UseGuards(GoogleGuard)
  @Post(':id/view-user')
  async addViewUser(
    @Param('id') folderId: number,
    @Query('userId') userId: number,
    @Body('targetUserId') targetUserId: number,
  ) {
    return this.foldersService.addViewUser(folderId, userId, targetUserId);
  }

  @UseGuards(GoogleGuard)
  @Post(':id/edit-user')
  async addEditUser(
    @Param('id') folderId: number,
    @Query('userId') userId: number,
    @Body('targetUserId') targetUserId: number,
  ) {
    return this.foldersService.addEditUser(folderId, userId, targetUserId);
  }

  @Delete(':id/view-user')
  @UseGuards(GoogleGuard)
  async removeViewUser(
    @Param('id') folderId: number,
    @Query('userId') userId: number,
    @Body('targetUserId') targetUserId: number,
  ) {
    return this.foldersService.removeViewUser(folderId, userId, targetUserId);
  }

  @Delete(':id/edit-user')
  @UseGuards(GoogleGuard)
  async removeEditUser(
    @Param('id') folderId: number,
    @Query('userId') userId: number,
    @Body('targetUserId') targetUserId: number,
  ) {
    return this.foldersService.removeEditUser(folderId, userId, targetUserId);
  }

  @Post(':folderId/clone')
  @UseGuards(GoogleGuard)
  async cloneFolderController(
    @Param('folderId') folderId: number,
    @Query('userId') userId: number,
  ) {
    return this.foldersService.cloneFolder(folderId, userId);
  }

  @Get('search')
  @UseGuards(GoogleGuard)
  async searchFolders(
    @Param('userId') userId: number,
    @Query('name') name: string,
  ) {
    return this.foldersService.searchFoldersByName(userId, name);
  }
}
