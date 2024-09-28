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

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 50 })
  mimeType: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'folderId' })
  folder: FolderEntity;

  @Column({ type: 'integer', nullable: false, name: 'folderId' })
  folderId: number;

  @ManyToOne(() => UserEntity, (user) => user.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'integer', nullable: false, name: 'userId' })
  userId: number;

  @ManyToMany(() => UserEntity, (user) => user.viewFiles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  viewUsers: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.editFiles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  editUsers: UserEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
