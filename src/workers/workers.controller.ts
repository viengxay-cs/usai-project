import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { FindNearbyDto } from './dto/find-nearby.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { WorkersService } from './workers.service';

@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER', 'WORKER')
  @Post('profile')
  createProfile(@Request() req: any, @Body() dto: CreateWorkerDto) {
    return this.workersService.createProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.workersService.findByUserId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('WORKER')
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateWorkerDto) {
    return this.workersService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/verify')
  verify(@Param('id') id: string) {
    return this.workersService.verifyProfile(id);
  }

  @Get('nearby')
  findNearby(@Query() query: FindNearbyDto) {
    return this.workersService.findNearby(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.workersService.findById(id);
  }
}
