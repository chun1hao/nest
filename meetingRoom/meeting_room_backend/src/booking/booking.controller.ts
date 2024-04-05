import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { UserInfo } from 'src/custom.decorator';
import { BookingDto } from './dto/booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('list')
  getList(
    @Query('pageNo', new DefaultValuePipe(1)) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @Query('username') username: string,
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('meetingRoomPosition') meetingRoomPosition: string,
    @Query('bookingTimeRangeStart') bookingTimeRangeStart: number,
    @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: number,
  ) {
    return this.bookingService.getList(
      pageNo,
      pageSize,
      username,
      meetingRoomName,
      meetingRoomPosition,
      bookingTimeRangeStart,
      bookingTimeRangeEnd,
    );
  }

  @Post('add')
  async addBooking(
    @UserInfo('userId') userId: number,
    @Body() bookingInfo: BookingDto,
  ) {
    await this.bookingService.add(userId, bookingInfo);
    return 'success';
  }

  @Get('changeStatus')
  async changeStatus(@Query('id') id: number, @Query('status') status: string) {
    await this.bookingService.changeStatus(id, status);
    return 'success';
  }

  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }
}
