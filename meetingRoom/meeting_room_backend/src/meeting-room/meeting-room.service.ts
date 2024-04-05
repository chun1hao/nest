import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Like, Repository } from 'typeorm';
import { meetRoomDto } from './dto/meetRoom.dto';
import { updateroomDto } from './dto/updateroom.dto';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private meetRoomRepository: Repository<MeetingRoom>;

  async create(meetingRoom: meetRoomDto) {
    const findRoom = await this.meetRoomRepository.findOneBy({
      name: meetingRoom.name,
    });
    if (findRoom) {
      throw new HttpException('会议室已存在', HttpStatus.BAD_REQUEST);
    }
    await this.meetRoomRepository.insert(meetingRoom);
    return 'success';
  }

  async update(meetingRoom: updateroomDto) {
    const findRoom = await this.meetRoomRepository.findOneBy({
      id: meetingRoom.id,
    });
    if (!findRoom)
      throw new HttpException('会议室不存在', HttpStatus.BAD_REQUEST);

    findRoom.capacity = meetingRoom.capacity;
    findRoom.location = meetingRoom.location;
    findRoom.name = meetingRoom.name;

    if (meetingRoom.description) {
      findRoom.description = meetingRoom.description;
    }
    if (meetingRoom.equipment) {
      findRoom.equipment = meetingRoom.equipment;
    }
    await this.meetRoomRepository.update({ id: findRoom.id }, findRoom);
    return 'success';
  }

  async findById(id: number) {
    const findRoom = await this.meetRoomRepository.findOneBy({ id });
    if (!findRoom)
      throw new HttpException('不存在这个会议室', HttpStatus.BAD_REQUEST);

    return findRoom;
  }

  async getList(
    pageNo: number,
    pageSize: number,
    name: string,
    capacity: number,
    equipment: string,
  ) {
    if (pageNo < 1) pageNo = 1;
    const offset = (pageNo - 1) * pageSize;
    const condition: Record<string, any> = {};
    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (capacity) {
      condition.capacity = capacity;
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }
    const [roomList, roomCount] = await this.meetRoomRepository.findAndCount({
      take: pageSize,
      skip: offset,
      where: condition,
      order: {
        createTime: 'DESC',
        updateTime: 'DESC',
      },
    });
    return {
      roomList,
      roomCount,
    };
  }

  async delRoom(id: number) {
    await this.meetRoomRepository.delete({ id });
    return 'success';
  }
}
