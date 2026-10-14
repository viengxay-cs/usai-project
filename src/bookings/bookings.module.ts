import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { Worker, WorkerSchema } from '../workers/schemas/worker.schema';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingSchema } from './schemas/booking.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Booking.name, schema: BookingSchema },
    { name: Worker.name, schema: WorkerSchema },
    { name: Category.name, schema: CategorySchema },
  ])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
