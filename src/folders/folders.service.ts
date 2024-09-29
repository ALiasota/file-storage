import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FolderEntity } from 'src/entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UsersService } from 'src/users/users.service';
import { FilesService } from 'src/files/files.service';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(FolderEntity)
    private readonly folderRepository: Repository<FolderEntity>,
    private usersService: UsersService,
    private filesService: FilesService,
  ) {}

  async createFolder(createFolderDto: CreateFolderDto, userId: number) {
    const newFolder = this.folderRepository.create({
      ...createFolderDto,
      userId,
    });
    return this.folderRepository.save(newFolder);
  }

  async getFolder(folderId: number, userId: number) {
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

  async getFolderTree(folderId: number, userId: number) {
    const folder = await this.getFolder(folderId, userId);

    const filesPromise = folder.files.map(
      async (file) => await this.filesService.getFileWithMetadata(file),
    );

    const files = await Promise.all(filesPromise);

    return { ...folder, files };
  }

  async deleteFolder(folderId: number, userId: number) {
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
    folder.files.forEach(async (file) => {
      await this.filesService.deleteFile(file.userId, file.id);
    });

    for (const childFolder of folder.children) {
      await this._deleteRecursive(childFolder);
    }

    await this.folderRepository.remove(folder);
  }

  async updateFolder(
    folderId: number,
    updateFolderDto: UpdateFolderDto,
    userId: number,
  ) {
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
      where: { id: folderId, userId },
      relations: ['viewUsers'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const targetUser = await this.usersService.getUserById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    return await this.addViewUserRecursive(folder, targetUser);
  }

  async addEditUser(folderId: number, userId: number, targetUserId: number) {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId, userId },
      relations: ['editUsers'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const targetUser = await this.usersService.getUserById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    return await this.addEditUserRecursive(folder, targetUser);
  }

  async removeViewUser(folderId: number, userId: number, targetUserId: number) {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId, userId },
      relations: ['viewUsers'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return await this.removeViewUserRecursive(folder, targetUserId);
  }

  async removeEditUser(folderId: number, userId: number, targetUserId: number) {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId, userId },
      relations: ['editUsers'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return await this.removeEditUserRecursive(folder, targetUserId);
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

  async getFolderPath(folder: FolderEntity) {
    let path = folder.name;
    while (folder.parentFolderId) {
      folder = await this.folderRepository.findOne({
        where: { id: folder.parentFolderId },
        relations: ['parentFolder'],
      });
      path = `${folder.name}/${path}`;
    }
    return path;
  }

  async addViewUserRecursive(folder: FolderEntity, targetUser: UserEntity) {
    folder.viewUsers.push(targetUser);

    for (const childFolder of folder.children) {
      await this.addViewUserRecursive(childFolder, targetUser);
    }

    for (const file of folder.files) {
      await this.filesService.addViewUser(file.id, file.userId, targetUser.id);
    }
    return await this.folderRepository.save(folder);
  }

  async addEditUserRecursive(folder: FolderEntity, targetUser: UserEntity) {
    folder.editUsers.push(targetUser);

    for (const childFolder of folder.children) {
      await this.addEditUserRecursive(childFolder, targetUser);
    }

    for (const file of folder.files) {
      await this.filesService.addEditUser(file.id, file.userId, targetUser.id);
    }

    return await this.folderRepository.save(folder);
  }

  async removeViewUserRecursive(folder: FolderEntity, targetUserId: number) {
    folder.viewUsers = folder.viewUsers.filter(
      (user) => user.id !== targetUserId,
    );

    for (const childFolder of folder.children) {
      await this.removeViewUserRecursive(childFolder, targetUserId);
    }

    for (const file of folder.files) {
      await this.filesService.removeViewUser(
        file.id,
        file.userId,
        targetUserId,
      );
    }

    return await this.folderRepository.save(folder);
  }

  async removeEditUserRecursive(folder: FolderEntity, targetUserId: number) {
    folder.editUsers = folder.editUsers.filter(
      (user) => user.id !== targetUserId,
    );

    for (const childFolder of folder.children) {
      await this.removeEditUserRecursive(childFolder, targetUserId);
    }

    for (const file of folder.files) {
      await this.filesService.removeEditUser(
        file.id,
        file.userId,
        targetUserId,
      );
    }

    return await this.folderRepository.save(folder);
  }

  async cloneFolder(
    folderId: number,
    userId: number,
    newParentFolderId?: number,
  ) {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId, userId },
      relations: ['files', 'children'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const clonedFolder = this.folderRepository.create({
      name: `${folder.name}_copy`,
      userId,
      parentFolderId: newParentFolderId ?? folder.parentFolderId,
      viewUsers: folder.viewUsers,
      editUsers: folder.editUsers,
    });
    const savedClonedFolder = await this.folderRepository.save(clonedFolder);

    for (const file of folder.files) {
      await this.filesService.cloneFile(file, savedClonedFolder.id, userId);
    }

    for (const childFolder of folder.children) {
      await this.cloneFolder(childFolder.id, userId, savedClonedFolder.id);
    }

    return savedClonedFolder;
  }

  async searchFoldersByName(userId: number, folderName: string) {
    const folders = await this.folderRepository.find({
      where: {
        userId,
        name: Like(`%${folderName}%`),
      },
      relations: ['files', 'children'],
    });

    const foldersPromise = folders.map(async (folder) => {
      const filesPromise = folder.files.map(
        async (file) => await this.filesService.getFileWithMetadata(file),
      );

      const files = await Promise.all(filesPromise);

      return { ...folder, files };
    });

    return await Promise.all(foldersPromise);
  }
}
