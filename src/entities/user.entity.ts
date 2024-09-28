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

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  lastName: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => FolderEntity, (folder) => folder.user)
  folders: FolderEntity[];

  @OneToMany(() => FileEntity, (file) => file.user)
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
  editFolders: UserEntity[];

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
  viewFolders: UserEntity[];

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
  editFiles: UserEntity[];

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
  viewFiles: UserEntity[];
}
