import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from '../categories/schemas/category.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FindBookingsDto } from './dto/find-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking, BookingStatus } from './schemas/booking.schema';
import { Worker } from '../workers/schemas/worker.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Worker.name) private readonly workerModel: Model<Worker>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async create(customerId: string, dto: CreateBookingDto): Promise<Booking> {
    if (!Types.ObjectId.isValid(customerId)) throw new BadRequestException('Invalid customer ID');
    const scheduledDate = new Date(dto.scheduledDate);
    if (scheduledDate.getTime() <= Date.now()) throw new BadRequestException('scheduledDate must be in the future');

    const [worker, category] = await Promise.all([
      this.workerModel.findById(dto.workerId).select('_id isVerified isAvailable').exec(),
      this.categoryModel.findOne({ _id: dto.categoryId, isActive: true }).select('_id').exec(),
    ]);
    if (!worker) throw new NotFoundException('Worker not found');
    if (!category) throw new NotFoundException('Category not found or inactive');
    if (!worker.isVerified) throw new ForbiddenException('This worker is not verified');
    if (!worker.isAvailable) throw new BadRequestException('This worker is not available');

    return this.bookingModel.create({
      customerId: new Types.ObjectId(customerId), workerId: worker._id, categoryId: category._id,
      description: dto.description.trim(), scheduledDate, priceEstimate: dto.priceEstimate,
      location: { type: 'Point', coordinates: [dto.longitude, dto.latitude] },
    });
  }

  async findUserBookings(userId: string, role: string, queryDto: FindBookingsDto) {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user ID');
    const query: Record<string, unknown> = {};
    if (role === 'WORKER') {
      const worker = await this.workerModel.findOne({ userId: new Types.ObjectId(userId) }).select('_id').exec();
      if (!worker) throw new NotFoundException('Worker profile not found');
      query.workerId = worker._id;
    } else if (role === 'CUSTOMER') {
      query.customerId = new Types.ObjectId(userId);
    } else throw new ForbiddenException('This endpoint is not available for your role');

    if (queryDto.status) query.status = queryDto.status;
    const skip = (queryDto.page - 1) * queryDto.limit;
    const [items, total] = await Promise.all([
      this.bookingModel.find(query).populate('customerId', 'fullName avatarUrl')
        .populate({ path: 'workerId', populate: { path: 'userId', select: 'fullName avatarUrl' } })
        .populate('categoryId', 'name iconUrl').sort({ createdAt: -1 }).skip(skip).limit(queryDto.limit).exec(),
      this.bookingModel.countDocuments(query),
    ]);
    return { items, page: queryDto.page, limit: queryDto.limit, total, totalPages: Math.ceil(total / queryDto.limit) };
  }

  async findById(bookingId: string, userId: string, role: string): Promise<Booking> {
    if (!Types.ObjectId.isValid(bookingId) || !Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid booking or user ID');
    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) throw new NotFoundException('Booking not found');

    const isCustomer = role === 'CUSTOMER' && booking.customerId.toString() === userId;
    let isWorker = false;
    if (role === 'WORKER') {
      const worker = await this.workerModel.findOne({ userId: new Types.ObjectId(userId) }).select('_id').exec();
      isWorker = !!worker && booking.workerId.toString() === worker._id.toString();
    }
    if (!isCustomer && !isWorker) throw new ForbiddenException('You are not authorized to view this booking');

    await booking.populate('customerId', 'fullName avatarUrl');
    await booking.populate({ path: 'workerId', populate: { path: 'userId', select: 'fullName avatarUrl' } });
    await booking.populate('categoryId', 'name iconUrl');
    return booking;
  }

  async updateStatus(bookingId: string, userId: string, role: string, dto: UpdateBookingStatusDto): Promise<Booking> {
    if (!Types.ObjectId.isValid(bookingId) || !Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid booking or user ID');
    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) throw new NotFoundException('Booking not found');
    const nextStatus = dto.status;

    if (role === 'CUSTOMER') {
      if (booking.customerId.toString() !== userId) throw new ForbiddenException('You are not authorized to update this booking');
      if (nextStatus !== BookingStatus.CANCELLED) throw new ForbiddenException('Customer can only cancel a booking');
      if (![BookingStatus.PENDING, BookingStatus.ACCEPTED].includes(booking.status)) throw new BadRequestException('This booking cannot be cancelled now');
    } else if (role === 'WORKER') {
      const worker = await this.workerModel.findOne({ userId: new Types.ObjectId(userId) }).select('_id').exec();
      if (!worker || booking.workerId.toString() !== worker._id.toString()) throw new ForbiddenException('You are not authorized to update this booking');
      const allowed: Record<BookingStatus, BookingStatus[]> = {
        PENDING: [BookingStatus.ACCEPTED, BookingStatus.REJECTED],
        ACCEPTED: [BookingStatus.IN_PROGRESS],
        IN_PROGRESS: [BookingStatus.COMPLETED],
        REJECTED: [], COMPLETED: [], CANCELLED: [],
      };
      if (!allowed[booking.status].includes(nextStatus)) throw new BadRequestException(`Invalid status transition: ${booking.status} -> ${nextStatus}`);
    } else throw new ForbiddenException('You do not have permission to update bookings');

    booking.status = nextStatus;
    return booking.save();
  }
}
