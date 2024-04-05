import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { meetRoomDto } from './dto/meetRoom.dto';
import { generateParseIntPipe } from 'src/utils';
import { updateroomDto } from './dto/updateroom.dto';

@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Post('create')
  async create(@Body() meetingRoom: meetRoomDto) {
    return await this.meetingRoomService.create(meetingRoom);
  }

  @Get('list')
  async getList(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('equipment') equipment: string,
  ) {
    return await this.meetingRoomService.getList(
      pageNo,
      pageSize,
      name,
      capacity,
      equipment,
    );
  }

  @Get('delete/:id')
  async delRoom(@Param('id') id: number) {
    this.meetingRoomService.delRoom(id);
  }

  @Post('update')
  async updateRoom(@Body() meetingRoom: updateroomDto) {
    return await this.meetingRoomService.update(meetingRoom);
  }

  @Get(':id')
  async find(@Param('id') id: number) {
    return await this.meetingRoomService.findById(id);
  }
}
