import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingStatus } from '../bookings/schemas/booking.schema';
import { Worker } from '../workers/schemas/worker.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { FindReviewsDto } from './dto/find-reviews.dto';
import { Review } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Worker.name) private readonly workerModel: Model<Worker>,
  ) {}

  async create(customerId: string, dto: CreateReviewDto): Promise<Review> {
    if (!Types.ObjectId.isValid(customerId) || !Types.ObjectId.isValid(dto.bookingId)) {
      throw new BadRequestException('Invalid customer or booking ID');
    }

    const booking = await this.bookingModel.findById(dto.bookingId).exec();
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId.toString() !== customerId) throw new BadRequestException('You can only review your own bookings');
    if (booking.status !== BookingStatus.COMPLETED) throw new BadRequestException('You can only review completed bookings');

    const existingReview = await this.reviewModel.findOne({ bookingId: booking._id }).exec();
    if (existingReview) throw new ConflictException('A review has already been submitted for this booking');

    const review = await this.reviewModel.create({
      bookingId: booking._id,
      customerId: new Types.ObjectId(customerId),
      workerId: booking.workerId,
      rating: dto.rating,
      comment: dto.comment?.trim(),
    });

    await this.refreshWorkerRating(booking.workerId);
    return review;
  }

  async findByWorker(workerId: string, pagination: FindReviewsDto) {
    if (!Types.ObjectId.isValid(workerId)) throw new BadRequestException('Invalid worker ID');
    const page = pagination.page;
    const limit = pagination.limit;
    const filter = { workerId: new Types.ObjectId(workerId) };

    const [items, total] = await Promise.all([
      this.reviewModel.find(filter).populate('customerId', 'fullName avatarUrl')
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.reviewModel.countDocuments(filter),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  private async refreshWorkerRating(workerId: Types.ObjectId) {
    const result = await this.reviewModel.aggregate([
      { $match: { workerId } },
      { $group: { _id: '$workerId', average: { $avg: '$rating' } } },
    ]);
    const average = result[0]?.average ?? 0;
    await this.workerModel.findByIdAndUpdate(workerId, { $set: { ratingAvg: Number(average.toFixed(2)) } }).exec();
  }
}
