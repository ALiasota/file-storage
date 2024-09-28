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

@Entity('folders')
export class FolderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.folders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer', nullable: false, name: 'userId' })
  userId: number;

  @ManyToOne(() => FolderEntity, (folder) => folder.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentFolderId' })
  parentFolder: FolderEntity;

  @Column({ type: 'integer', nullable: true, name: 'parentFolderId' })
  parentFolderId: number;

  @OneToMany(() => FolderEntity, (folder) => folder.parentFolder)
  children: FolderEntity[];

  @ManyToMany(() => UserEntity, (user) => user.viewFolders, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  viewUsers: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.editFolders, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  editUsers: UserEntity[];

  @OneToMany(() => FileEntity, (file) => file.folder)
  files: FileEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
