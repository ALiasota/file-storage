import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { FileEntity } from './file.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('folders')
export class FolderEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique identifier of the folder' })
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.folders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({
    description: 'The user who owns the folder',
    type: () => UserEntity,
  })
  user: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ example: 'Documents', description: 'Name of the folder' })
  name: string;

  @Column({ type: 'integer', nullable: false, name: 'userId' })
  @ApiProperty({
    example: 1,
    description: 'ID of the user who owns the folder',
  })
  userId: number;

  @ManyToOne(() => FolderEntity, (folder) => folder.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentFolderId' })
  @ApiProperty({
    description: 'The parent folder if this folder is a subfolder',
    type: () => FolderEntity,
    nullable: true,
  })
  parentFolder: FolderEntity;

  @Column({ type: 'integer', nullable: true, name: 'parentFolderId' })
  @ApiProperty({
    example: 2,
    description: 'ID of the parent folder',
    nullable: true,
  })
  parentFolderId: number;

  @OneToMany(() => FolderEntity, (folder) => folder.parentFolder)
  @ApiProperty({
    description: 'Child folders of this folder',
    type: () => [FolderEntity],
  })
  children: FolderEntity[];

  @ManyToMany(() => UserEntity, (user) => user.viewFolders, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @ApiProperty({
    description: 'Users who have view access to this folder',
    type: () => [UserEntity],
  })
  viewUsers: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.editFolders, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @ApiProperty({
    description: 'Users who have edit access to this folder',
    type: () => [UserEntity],
  })
  editUsers: UserEntity[];

  @OneToMany(() => FileEntity, (file) => file.folder)
  @ApiProperty({
    description: 'Files inside the folder',
    type: () => [FileEntity],
  })
  files: FileEntity[];

  @CreateDateColumn()
  @ApiProperty({
    example: '2024-09-28T12:00:00.000Z',
    description: 'The date the folder was created',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    example: '2024-09-28T12:00:00.000Z',
    description: 'The date the folder was last updated',
  })
  updatedAt: Date;
}
