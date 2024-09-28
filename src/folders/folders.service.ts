import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderEntity } from 'src/entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(FolderEntity)
    private readonly folderRepository: Repository<FolderEntity>,
    private usersService: UsersService,
  ) {}

  async createFolder(createFolderDto: CreateFolderDto, userId: number) {
    const newFolder = this.folderRepository.create({
      ...createFolderDto,
      userId,
    });
    return this.folderRepository.save(newFolder);
  }

  async getFolderTree(folderId: number, userId: number): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['children', 'files'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.checkAccess(folder, userId);

    return folder;
  }

  async deleteFolder(folderId: number, userId: number): Promise<void> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['children', 'files'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.checkAccess(folder, userId, true);

    await this._deleteRecursive(folder);
  }

  private async _deleteRecursive(folder: FolderEntity) {
    // await this.fileRepository.delete({ folder });

    for (const childFolder of folder.children) {
      await this._deleteRecursive(childFolder);
    }

    await this.folderRepository.remove(folder);
  }

  async updateFolder(
    folderId: number,
    updateFolderDto: UpdateFolderDto,
    userId: number,
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['editUsers'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.checkAccess(folder, userId, true);

    Object.assign(folder, updateFolderDto);

    return this.folderRepository.save(folder);
  }

  async addViewUser(folderId: number, userId: number, targetUserId: number) {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['viewUsers'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.checkAccess(folder, userId, true);

    const targetUser = await this.usersService.getUserById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    folder.viewUsers.push(targetUser);
    return this.folderRepository.save(folder);
  }

  async addEditUser(
    folderId: number,
    userId: number,
    targetUserId: number,
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['editUsers'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.checkAccess(folder, userId, true);

    const targetUser = await this.usersService.getUserById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    folder.editUsers.push(targetUser);
    return this.folderRepository.save(folder);
  }

  async removeViewUser(
    folderId: number,
    userId: number,
    targetUserId: number,
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['viewUsers'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.checkAccess(folder, userId, true);

    folder.viewUsers = folder.viewUsers.filter(
      (user) => user.id !== targetUserId,
    );
    return this.folderRepository.save(folder);
  }

  async removeEditUser(
    folderId: number,
    userId: number,
    targetUserId: number,
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['editUsers'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.checkAccess(folder, userId, true);

    folder.editUsers = folder.editUsers.filter(
      (user) => user.id !== targetUserId,
    );
    return this.folderRepository.save(folder);
  }

  private async checkAccess(
    folder: FolderEntity,
    userId: number,
    edit = false,
  ) {
    const hasAccess =
      folder.userId === userId ||
      folder.viewUsers.some((user) => user.id === userId);
    const hasEditAccess =
      folder.userId === userId ||
      folder.editUsers.some((user) => user.id === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this folder');
    }

    if (edit && !hasEditAccess) {
      throw new ForbiddenException(
        'You do not have permission to edit this folder',
      );
    }
  }
}
