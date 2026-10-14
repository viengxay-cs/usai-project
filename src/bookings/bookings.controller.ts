import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FindBookingsDto } from './dto/find-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Roles('CUSTOMER')
  @Post()
  create(@Request() req: any, @Body() dto: CreateBookingDto) { return this.bookingsService.create(req.user.userId, dto); }

  @Roles('CUSTOMER', 'WORKER')
  @Get('my-bookings')
  findMyBookings(@Request() req: any, @Query() query: FindBookingsDto) {
    return this.bookingsService.findUserBookings(req.user.userId, req.user.role, query);
  }

  @Roles('CUSTOMER', 'WORKER')
  @Get(':id')
  findById(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.findById(id, req.user.userId, req.user.role);
  }

  @Roles('CUSTOMER', 'WORKER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, req.user.userId, req.user.role, dto);
  }
}
