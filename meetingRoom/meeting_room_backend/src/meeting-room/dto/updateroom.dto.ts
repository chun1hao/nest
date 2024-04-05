import { IsNotEmpty } from 'class-validator';
import { meetRoomDto } from './meetRoom.dto';

export class updateroomDto extends meetRoomDto {
  @IsNotEmpty({
    message: 'id 不能为空',
  })
  id: number;
}
