import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateWorkerDto } from './dto/create-worker.dto';
import { FindNearbyDto } from './dto/find-nearby.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Worker } from './schemas/worker.schema';

import { User, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class WorkersService {
  constructor(
    @InjectModel(Worker.name)
    private readonly workerModel: Model<Worker>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  // =========================================================
  // 1. CREATE WORKER PROFILE
  // =========================================================

  async createProfile(
    userId: string,
    dto: CreateWorkerDto,
  ): Promise<Worker> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check that the User exists
    const user = await this.userModel
      .findById(userId)
      .select('_id role')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check whether this user already has a Worker profile
    const existingWorker = await this.workerModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (existingWorker) {
      throw new ConflictException(
        'Worker profile already exists for this user',
      );
    }

    // Convert category IDs from string → ObjectId
    const categoryObjectIds = dto.categories.map(
      (id) => new Types.ObjectId(id),
    );

    const worker = await this.workerModel.create({
      userId: new Types.ObjectId(userId),

      categories: categoryObjectIds,

      bio: dto.bio.trim(),

      skills: dto.skills,

      experienceYears: dto.experienceYears,

      gender: dto.gender,

      birth: dto.birth,

      achievements: dto.achievements ?? [],

      province: dto.province?.trim(),

      district: dto.district?.trim(),

      village: dto.village?.trim(),

      certificate: dto.certificate?.trim(),

      documentType: dto.documentType?.trim(),

      documentId: dto.documentId?.trim(),

      issueDate: dto.issueDate,

      expiryDate: dto.expiryDate,

      documentImages: dto.documentImages ?? [],

      location: {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      },

      // New Worker must wait for Admin verification
      isVerified: false,

      // Worker cannot receive bookings before verification
      isAvailable: false,
    });

    return worker;
  }

  // =========================================================
  // 2. VERIFY WORKER PROFILE
  // =========================================================

  async verifyProfile(workerId: string): Promise<Worker> {
    if (!Types.ObjectId.isValid(workerId)) {
      throw new BadRequestException('Invalid worker ID');
    }

    const worker = await this.workerModel
      .findById(workerId)
      .exec();

    if (!worker) {
      throw new NotFoundException('Worker profile not found');
    }

    // Verify Worker
    worker.isVerified = true;

    // Make Worker available after verification
    worker.isAvailable = true;

    await worker.save();

    // Change User role from CUSTOMER → WORKER
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        worker.userId,
        {
          $set: {
            role: UserRole.WORKER,
          },
        },
        {
          new: true,
        },
      )
      .exec();

    // Make sure the User actually exists
    if (!updatedUser) {
      throw new NotFoundException(
        'User associated with this worker was not found',
      );
    }

    return this.findById(workerId);
  }

  // =========================================================
  // 3. GET WORKER PROFILE BY USER ID
  // =========================================================

  async findByUserId(userId: string): Promise<Worker> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const worker = await this.workerModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .populate('userId', 'fullName avatarUrl')
      .populate('categories', 'name iconUrl')
      .exec();

    if (!worker) {
      throw new NotFoundException(
        'Worker profile not found for this user',
      );
    }

    return worker;
  }

  // =========================================================
  // 4. GET WORKER BY WORKER ID
  // Public information only
  // =========================================================

  async findById(id: string): Promise<Worker> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid worker ID');
    }

    const worker = await this.workerModel
      .findById(id)

      // Hide sensitive verification documents
      .select(
        '-certificate -documentType -documentId -issueDate -expiryDate -documentImages',
      )

      .populate('userId', 'fullName avatarUrl')
      .populate('categories', 'name iconUrl')
      .exec();

    if (!worker) {
      throw new NotFoundException('Worker profile not found');
    }

    return worker;
  }

  // =========================================================
  // 5. UPDATE WORKER PROFILE
  // =========================================================

  async updateProfile(
    userId: string,
    dto: UpdateWorkerDto,
  ): Promise<Worker> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const updateData: Record<string, unknown> = {
      ...dto,
    };

    // Convert category IDs
    if (dto.categories) {
      updateData.categories = dto.categories.map(
        (id) => new Types.ObjectId(id),
      );
    }

    // Update location
    if (
      dto.longitude !== undefined ||
      dto.latitude !== undefined
    ) {
      if (
        dto.longitude === undefined ||
        dto.latitude === undefined
      ) {
        throw new BadRequestException(
          'longitude and latitude must be provided together',
        );
      }

      updateData.location = {
        type: 'Point',
        coordinates: [
          dto.longitude,
          dto.latitude,
        ],
      };

      delete updateData.longitude;
      delete updateData.latitude;
    }

    const updatedWorker = await this.workerModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
        },
        {
          $set: updateData,
        },
        {
          returnDocument: 'after',
          runValidators: true,
        },
      )
      .populate('userId', 'fullName avatarUrl')
      .populate('categories', 'name iconUrl')
      .exec();

    if (!updatedWorker) {
      throw new NotFoundException(
        'Worker profile not found for this user',
      );
    }

    return updatedWorker;
  }

  // =========================================================
  // 6. FIND NEARBY WORKERS
  // =========================================================

  async findNearby(
    query: FindNearbyDto,
  ): Promise<Worker[]> {
    return this.workerModel
      .find({
        // Only active Workers
        isActive: true,

        // Only verified Workers
        isVerified: true,

        // Only available Workers
        isAvailable: true,

        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [
                query.longitude,
                query.latitude,
              ],
            },

            $maxDistance: query.radiusInMeters,
          },
        },
      })

      // Hide sensitive Worker documents
      .select(
        '-certificate -documentType -documentId -issueDate -expiryDate -documentImages',
      )

      .populate('userId', 'fullName avatarUrl')
      .populate('categories', 'name iconUrl')

      .limit(100)

      .exec();
  }
}