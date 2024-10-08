import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { S3, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FileEntity } from 'src/entities/file.entity';
import { FoldersService } from 'src/folders/folders.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class FilesService {
  private s3: S3;
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private configService: ConfigService,
    @Inject(forwardRef(() => FoldersService))
    private foldersService: FoldersService,
    private usersService: UsersService,
    private mailService: MailService,
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
  ) {
    try {
      const folder = await this.foldersService.getFolder(folderId, userId);
      if (!folder) throw new NotFoundException('Folder not found');

      const folderPath = await this.foldersService.getFolderPath(folder);

      await this.s3.putObject({
        Bucket: this.configService.get<string>('DO_BUCKET'),
        Key: `${folderPath}/${file.originalname}`,
        Body: file.buffer,
        ACL: 'private',
      });

      const newFile = this.fileRepository.create({
        name: file.originalname,
        url: file.originalname,
        folder,
        userId,
      });

      return this.fileRepository.save(newFile);
    } catch (error) {
      console.error('S3 error:', error);
      throw error;
    }
  }

  async getFile(userId: number, fileId: number) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['folder', 'viewUsers', 'editUsers'],
    });

    if (!file) throw new NotFoundException('File not found');

    await this.checkAccess(file, userId);
    return await this.getFileWithMetadata(file);
  }

  async getFileDB(userId: number, fileId: number) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['folder', 'viewUsers', 'editUsers'],
    });

    if (!file) throw new NotFoundException('File not found');

    await this.checkAccess(file, userId);
    return file;
  }

  async getFileWithMetadata(file: FileEntity) {
    const folder = await this.foldersService.getFolder(
      file.folderId,
      file.userId,
    );
    if (!folder) throw new NotFoundException('Folder not found');
    const folderPath = await this.foldersService.getFolderPath(folder);
    const path = `${folderPath}/${file.url}`;
    const url = await this.getSignedUrl(path);
    const metadata = await this.getFileMetadata(path);

    return { ...file, url, contentType: metadata.ContentType };
  }

  async deleteFile(userId: number, fileId: number) {
    try {
      const file = await this.fileRepository.findOne({
        where: { id: fileId },
        relations: ['folder'],
      });
      if (!file) throw new NotFoundException('File not found');

      await this.checkAccess(file, userId);

      const folderPath = await this.foldersService.getFolderPath(file.folder);

      await this.s3.deleteObject({
        Bucket: this.configService.get<string>('DO_BUCKET'),
        Key: `${folderPath}/${file.name}`,
      });

      await this.fileRepository.remove(file);
    } catch (error) {
      console.error('S3 error:', error);
      throw error;
    }
  }

  async updateFile(
    userId: number,
    fileId: number,
    updateData: Partial<FileEntity>,
  ) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['folder'],
    });
    if (!file) throw new NotFoundException('File not found');

    await this.checkAccess(file, userId);

    Object.assign(file, updateData);
    return this.fileRepository.save(file);
  }

  async addEditUser(fileId: number, userId: number, targetUserId: number) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
      relations: ['editUsers'],
    });
    if (!file) throw new NotFoundException('File not found');

    const user = await this.usersService.getUserById(targetUserId);
    if (!user) throw new NotFoundException('User not found');

    if (file.editUsers?.length) file.editUsers.push(user);
    else file.editUsers = [user];
    const fileWithUrl = await this.getFileWithMetadata(file);
    await this.mailService.sendMail(
      user.email,
      fileWithUrl.name,
      fileWithUrl.url,
    );
    return this.fileRepository.save(file);
  }

  async removeEditUser(fileId: number, userId: number, targetUserId: number) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
      relations: ['editUsers'],
    });
    if (!file) throw new NotFoundException('File not found');

    if (file.editUsers?.length)
      file.editUsers = file.editUsers.filter(
        (user) => user.id !== targetUserId,
      );
    return this.fileRepository.save(file);
  }

  async addViewUser(fileId: number, userId: number, targetUserId: number) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
      relations: ['viewUsers'],
    });

    if (!file) throw new NotFoundException('File not found');

    const user = await this.usersService.getUserById(targetUserId);
    if (!user) throw new NotFoundException('User not found');

    if (file.viewUsers?.length) file.viewUsers.push(user);
    else file.viewUsers = [user];
    const fileWithUrl = await this.getFileWithMetadata(file);
    await this.mailService.sendMail(
      user.email,
      fileWithUrl.name,
      fileWithUrl.url,
    );
    return this.fileRepository.save(file);
  }

  async removeViewUser(fileId: number, userId: number, targetUserId: number) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
      relations: ['viewUsers'],
    });
    if (!file) throw new NotFoundException('File not found');

    if (file.viewUsers?.length)
      file.viewUsers = file.editUsers.filter(
        (user) => user.id !== targetUserId,
      );
    return this.fileRepository.save(file);
  }

  private async checkAccess(file: FileEntity, userId: number, edit = false) {
    const hasAccess =
      file.userId === userId ||
      file.viewUsers.some((user) => user.id === userId);
    const hasEditAccess =
      file.userId === userId ||
      file.editUsers.some((user) => user.id === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this file');
    }

    if (edit && !hasEditAccess) {
      throw new ForbiddenException(
        'You do not have permission to edit this file',
      );
    }
  }

  private async getSignedUrl(key: string) {
    try {
      const params = {
        Bucket: this.configService.get<string>('DO_BUCKET'),
        Key: key,
      };

      const command = new GetObjectCommand(params);
      return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    } catch (error) {
      console.error('S3 error:', error);
      throw error;
    }
  }

  private async getFileMetadata(key: string) {
    try {
      const params = {
        Bucket: this.configService.get<string>('DO_BUCKET'),
        Key: key,
      };

      const command = new HeadObjectCommand(params);
      const metadata = await this.s3.send(command);
      return metadata;
    } catch (error) {
      console.error('S3 error:', error);
      throw error;
    }
  }

  async cloneFile(file: FileEntity, newFolderId: number, userId: number) {
    await this.copyFileInStorage(file, newFolderId, userId);
    const clonedFile = this.fileRepository.create({
      name: `copy_${file.name}`,
      url: `copy_${file.url}`,
      folderId: newFolderId,
      userId,
      viewUsers: file.viewUsers,
      editUsers: file.editUsers,
    });

    return this.fileRepository.save(clonedFile);
  }

  private async copyFileInStorage(
    file: FileEntity,
    newFolderId: number,
    userId: number,
  ) {
    const newFileKey = `copy_${file.url}`;
    const OldFolder = await this.foldersService.getFolder(
      file.folderId,
      file.userId,
    );
    const NewFolder = await this.foldersService.getFolder(newFolderId, userId);
    if (!OldFolder || !NewFolder)
      throw new NotFoundException('Folder not found');

    const oldFolderPath = await this.foldersService.getFolderPath(OldFolder);
    const newFolderPath = await this.foldersService.getFolderPath(NewFolder);
    console.log(`${newFolderPath}/${newFileKey}`);
    await this.s3.copyObject({
      Bucket: this.configService.get<string>('DO_BUCKET'),
      CopySource: `${this.configService.get<string>(
        'DO_BUCKET',
      )}/${oldFolderPath}/${file.url}`,

      Key: `${newFolderPath}/${newFileKey}`,
    });

    return `${this.configService.get<string>('DO_SPACES_URL')}/${newFileKey}`;
  }

  async searchFilesByName(userId: number, fileName: string) {
    return this.fileRepository.find({
      where: {
        userId,
        name: Like(`%${fileName}%`),
      },
      relations: ['folder'],
    });
  }
}
