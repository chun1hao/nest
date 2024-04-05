import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    comment: '用户名',
    unique: true,
  })
  username: string;

  @Column({
    length: 50,
    comment: '密码',
  })
  password: string;

  @Column({
    name: 'nick_name',
    length: 50,
    comment: '昵称',
  })
  nickName: string;

  @Column({
    length: 50,
    comment: '邮箱',
  })
  email: string;

  @Column({
    comment: '头像',
    length: 100,
    nullable: true,
    name: 'head_pic',
  })
  headPic: string;

  @Column({
    length: 20,
    comment: '手机号',
    nullable: true,
    name: 'phone_number',
  })
  phoneNumber: string;

  @Column({
    comment: '是否冻结',
    default: false,
    name: 'is_frozen',
  })
  isFrozen: boolean;

  @Column({
    comment: '是否管理员',
    default: false,
    name: 'is_admin',
  })
  isAdmin: boolean;

  @CreateDateColumn({
    comment: '创建时间',
    name: 'create_time',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
    name: 'update_time',
  })
  updateTime: Date;

  @JoinTable()
  @ManyToMany(() => Role)
  roles: Role[];
}
