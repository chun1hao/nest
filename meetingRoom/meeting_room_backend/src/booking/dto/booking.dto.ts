import { IsNotEmpty, IsNumber } from 'class-validator';

export class BookingDto {
  @IsNotEmpty({ message: '会议室名称不能为空' })
  @IsNumber()
  meetingRoomId: number;

  @IsNotEmpty({ message: '开始时间不能为空' })
  startTime: number | string;

  @IsNotEmpty({ message: '结束时间不能为空' })
  endTime: number | string;

  note: string;
}
