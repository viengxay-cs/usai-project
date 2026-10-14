import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '../schemas/booking.schema';

export class UpdateBookingStatusDto {
  @IsNotEmpty()
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}