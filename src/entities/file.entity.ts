import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { FolderEntity } from './folder.entity';
import { UserEntity } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique identifier of the file' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ example: 'document.pdf', description: 'The name of the file' })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({
    example: 'https://example.com/file/document.pdf',
    description: 'URL where the file is stored',
  })
  url: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({
    example: 'application/pdf',
    description: 'MIME type of the file (e.g., image/jpeg, application/pdf)',
  })
  mimeType: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'folderId' })
  @ApiProperty({
    description: 'The folder containing this file',
    type: () => FolderEntity,
  })
  folder: FolderEntity;

  @Column({ type: 'integer', nullable: false, name: 'folderId' })
  @ApiProperty({
    example: 2,
    description: 'ID of the folder containing this file',
  })
  folderId: number;

  @ManyToOne(() => UserEntity, (user) => user.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({
    description: 'The user who uploaded the file',
    type: () => UserEntity,
  })
  user: UserEntity;

  @Column({ type: 'integer', nullable: false, name: 'userId' })
  @ApiProperty({
    example: 1,
    description: 'ID of the user who uploaded the file',
  })
  userId: number;

  @ManyToMany(() => UserEntity, (user) => user.viewFiles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @ApiProperty({
    description: 'Users who have view access to this file',
    type: () => [UserEntity],
  })
  viewUsers: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.editFiles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @ApiProperty({
    description: 'Users who have edit access to this file',
    type: () => [UserEntity],
  })
  editUsers: UserEntity[];

  @CreateDateColumn()
  @ApiProperty({
    example: '2024-09-28T12:00:00.000Z',
    description: 'The date the file was uploaded',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    example: '2024-09-28T12:00:00.000Z',
    description: 'The date the file was last updated',
  })
  updatedAt: Date;
}
