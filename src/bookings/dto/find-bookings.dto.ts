import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BookingStatus } from '../schemas/booking.schema';

export class FindBookingsDto extends PaginationDto {
  @IsOptional()
  @Type(() => String)
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
