import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'start_time',
    comment: '会议开始时间',
  })
  startTime: Date;

  @Column({
    name: 'end_time',
    comment: '会议结束时间',
  })
  endTime: Date;

  @Column({
    comment: '状态（1申请中、2审批通过、3审批驳回、4已解除）',
    default: '1',
    length: 20,
  })
  status: string;

  @Column({
    comment: '备注',
    length: 100,
    default: '',
  })
  note: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom;

  @CreateDateColumn({
    comment: '创建时间',
    name: 'create_time',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '创建时间',
    name: 'update_time',
  })
  updateTime: Date;
}
