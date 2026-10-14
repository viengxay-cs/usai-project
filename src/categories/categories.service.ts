import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const name = dto.name.trim();
    const existing = await this.categoryModel.findOne({ name }).select('_id').exec();
    if (existing) throw new ConflictException('Category already exists');
    try {
      return await this.categoryModel.create({ ...dto, name });
    } catch (error: any) {
      if (error?.code === 11000) throw new ConflictException('Category already exists');
      throw error;
    }
  }

  async findAll(): Promise<Category[]> { return this.categoryModel.find({ isActive: true }).sort({ name: 1 }).exec(); }

  async findById(id: string): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid category ID');
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}
