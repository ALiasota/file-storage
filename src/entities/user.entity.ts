import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { FolderEntity } from './folder.entity';
import { FileEntity } from './file.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique identifier of the user' })
  id: number;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  lastName: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @CreateDateColumn()
  @ApiProperty({
    example: '2023-09-01T10:00:00.000Z',
    description: 'The date when the user was created',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    example: '2023-09-10T12:00:00.000Z',
    description: 'The date when the user was last updated',
  })
  updatedAt: Date;

  @OneToMany(() => FolderEntity, (folder) => folder.user)
  @ApiProperty({
    description: 'List of folders created by the user',
    type: () => [FolderEntity],
  })
  folders: FolderEntity[];

  @OneToMany(() => FileEntity, (file) => file.user)
  @ApiProperty({
    description: 'List of files uploaded by the user',
    type: () => [FileEntity],
  })
  files: FileEntity[];

  @ManyToMany(() => FolderEntity, (folder) => folder.editUsers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'editFolders',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'folderId',
      referencedColumnName: 'id',
    },
  })
  @ApiProperty({
    description: 'Folders the user has permission to edit',
    type: () => [FolderEntity],
  })
  editFolders: FolderEntity[];

  @ManyToMany(() => FolderEntity, (folder) => folder.viewUsers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'viewFolders',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'folderId',
      referencedColumnName: 'id',
    },
  })
  @ApiProperty({
    description: 'Folders the user has permission to view',
    type: () => [FolderEntity],
  })
  viewFolders: FolderEntity[];

  @ManyToMany(() => FileEntity, (file) => file.editUsers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'editFiles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'fileId',
      referencedColumnName: 'id',
    },
  })
  @ApiProperty({
    description: 'Files the user has permission to edit',
    type: () => [FileEntity],
  })
  editFiles: FileEntity[];

  @ManyToMany(() => FileEntity, (file) => file.viewUsers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'viewFiles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'fileId',
      referencedColumnName: 'id',
    },
  })
  @ApiProperty({
    description: 'Files the user has permission to view',
    type: () => [FileEntity],
  })
  viewFiles: FileEntity[];

  @Column({ nullable: true })
  @ApiProperty({
    example: 'ya29.a0AcM612xFI0...',
    description: 'Google access token for the user',
  })
  googleAccessToken: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: '1//0gN4...',
    description: 'Google refresh token for the user',
  })
  googleRefreshToken: string;
}
