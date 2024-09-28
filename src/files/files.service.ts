import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from 'src/entities/file.entity';
import { FoldersService } from 'src/folders/folders.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FilesService {
  private s3: S3;
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private configService: ConfigService,
    private foldersService: FoldersService,
    private usersService: UsersService,
  ) {
    this.s3 = new S3({
      endpoint: this.configService.get<string>('DO_SPACES_URL'),
      credentials: {
        accessKeyId: this.configService.get<string>('DO_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('DO_SECRET_ACCESS_KEY'),
      },

      region: this.configService.get<string>('DO_REGION'),
    });
  }

  async uploadFile(
    userId: number,
    folderId: number,
    file: Express.Multer.File,
  ): Promise<FileEntity> {
    const folder = await this.foldersService.getFolderTree(folderId, userId);
    if (!folder) throw new NotFoundException('Folder not found');

    await this.s3.putObject({
      Bucket: this.configService.get<string>('DO_SPACES_BUCKET'),
      Key: `${folder.name}/${file.originalname}`,
      Body: file.buffer,
      ACL: 'private',
    });

    const newFile = this.fileRepository.create({
      name: file.originalname,
      url: file.originalname,
      mimeType: file.mimetype,
      folder,
      userId,
    });

    return this.fileRepository.save(newFile);
  }

  async getFile(userId: number, fileId: number): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['folder', 'viewUsers', 'editUsers'],
    });

    if (!file) throw new NotFoundException('File not found');

    const canView =
      file.viewUsers.some((user) => user.id === userId) ||
      file.userId === userId;
    if (!canView)
      throw new ForbiddenException(
        'You do not have permission to view this file',
      );

    return file;
  }

  async deleteFile(userId: number, fileId: number): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['folder'],
    });
    if (!file) throw new NotFoundException('File not found');

    if (file.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this file',
      );
    }

    await this.s3.deleteObject({
      Bucket: this.configService.get<string>('DO_SPACES_BUCKET'),
      Key: `${file.folder.name}/${file.name}`,
    });

    await this.fileRepository.remove(file);
  }

  async updateFile(
    userId: number,
    fileId: number,
    updateData: Partial<FileEntity>,
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['folder'],
    });
    if (!file) throw new NotFoundException('File not found');

    if (file.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to edit this file',
      );
    }

    Object.assign(file, updateData);
    return this.fileRepository.save(file);
  }

  async addEditUser(fileId: number, targetUserId: number): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['editUsers'],
    });
    if (!file) throw new NotFoundException('File not found');

    const user = await this.usersService.getUserById(targetUserId);
    if (!user) throw new NotFoundException('User not found');

    file.editUsers.push(user);
    return this.fileRepository.save(file);
  }

  async removeEditUser(
    fileId: number,
    targetUserId: number,
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['editUsers'],
    });
    if (!file) throw new NotFoundException('File not found');

    file.editUsers = file.editUsers.filter((user) => user.id !== targetUserId);
    return this.fileRepository.save(file);
  }
}
