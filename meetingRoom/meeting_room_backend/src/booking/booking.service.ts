import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import {
  Between,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BookingDto } from './dto/booking.dto';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class BookingService {
  @InjectRepository(Booking)
  private bookingRepository: Repository<Booking>;

  @InjectRepository(MeetingRoom)
  private roomRepository: Repository<MeetingRoom>;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  async getList(
    pageNo: number,
    pageSize: number,
    username: string,
    meetingRoomName: string,
    meetingRoomPosition: string,
    bookingTimeRangeStart: number,
    bookingTimeRangeEnd: number,
  ) {
    if (pageNo < 1) return 1;
    const offset = (pageNo - 1) * pageSize;
    const condition: Record<string, any> = {};

    if (username) {
      condition.user = {
        username: Like(`%${username}%`),
      };
    }

    if (meetingRoomName) {
      condition.room = {
        name: Like(`%${meetingRoomName}%`),
      };
    }

    if (meetingRoomPosition) {
      if (!condition.room) {
        condition.room = {};
      }
      condition.room.location = Like(`%${meetingRoomPosition}%`);
    }

    if (bookingTimeRangeStart) {
      if (!bookingTimeRangeEnd) {
        bookingTimeRangeEnd = bookingTimeRangeStart + 60 * 60 * 1000;
      }
      condition.startTime = Between(
        new Date(bookingTimeRangeStart),
        new Date(bookingTimeRangeEnd),
      );
    }
    const [bookingList, totalCount] = await this.bookingRepository.findAndCount(
      {
        take: pageSize,
        skip: offset,
        where: condition,
        order: {
          createTime: 'DESC',
        },
        relations: {
          user: true,
          room: true,
        },
      },
    );

    return {
      bookingList: bookingList.map((item) => {
        delete item.user.password;
        return item;
      }),
      totalCount,
    };
  }

  async add(userId: number, bookingInfo: BookingDto) {
    const findRoom = await this.roomRepository.findOneBy({
      id: bookingInfo.meetingRoomId,
    });

    if (!findRoom)
      throw new HttpException('会议室不存在', HttpStatus.BAD_REQUEST);

    const user = await this.userRepository.findOneBy({ id: userId });

    const newBooking = {
      user,
      room: findRoom,
      startTime: new Date(bookingInfo.startTime),
      endTime: new Date(bookingInfo.endTime),
      note: bookingInfo.note,
    };

    const res = await this.bookingRepository.findOneBy({
      room: {
        id: findRoom.id,
      },
      startTime: LessThanOrEqual(newBooking.startTime),
      endTime: MoreThanOrEqual(newBooking.endTime),
    });
    if (res) {
      throw new BadRequestException('该时间段已被预定');
    }

    return this.bookingRepository.insert(newBooking);
  }

  async changeStatus(id: number, status: string) {
    if (status === '1') {
      throw new BadRequestException('状态不正确');
    }
    const room = await this.bookingRepository.findOneBy({
      id,
    });
    if (!room) {
      throw new BadRequestException('会议室不存在');
    }
    room.status = status;

    await this.bookingRepository.update({ id }, room);
  }

  async urge(id: number) {
    const flag = await this.redisService.get('urge_' + id);
    if (flag) return '半小时内只能催办一次，请耐心等待';
    let email = await this.redisService.get('admin_email');
    if (!email) {
      const admin = await this.userRepository.findOne({
        where: {
          isAdmin: true,
        },
      });

      email = admin.email;

      this.redisService.set('admin_email', admin.email);
    }

    this.emailService.sendEmail({
      to: email,
      subject: '预定申请催办提醒',
      html: `id 为 ${id} 的预定申请正在等待审批`,
    });

    this.redisService.set('urge_' + id, 1, 60 * 30);
  }
}
