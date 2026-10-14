import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { FindReviewsDto } from './dto/find-reviews.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Post()
  create(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, dto);
  }

  @Get('worker/:workerId')
  findByWorker(@Param('workerId') workerId: string, @Query() pagination: FindReviewsDto) {
    return this.reviewsService.findByWorker(workerId, pagination);
  }
}
