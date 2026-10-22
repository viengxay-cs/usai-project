import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findById(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid user ID');
    const user = await this.userModel.findById(id).select('-passwordHash').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userModel.findOne({ phone: phone.trim() }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-passwordHash').exec();
  }

  async updateProfile(id: string, updateData: UpdateUserDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid user ID');
    const data = { ...updateData };
    if (data.fullName !== undefined) data.fullName = data.fullName.trim();
    if (data.phone !== undefined) {
      data.phone = data.phone.trim();
      const duplicate = await this.userModel.findOne({ phone: data.phone, _id: { $ne: id } }).select('_id').exec();
      if (duplicate) throw new ConflictException('Phone number is already registered');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id, { $set: data }, { returnDocument: 'after', runValidators: true },
    ).select('-passwordHash').exec();
    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }
}
