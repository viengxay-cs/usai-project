import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) { return this.usersService.findById(req.user.userId); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  getUserById(@Param('id') id: string) { return this.usersService.findById(id); }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Request() req: any, @Body() updateData: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.userId, updateData);
  }
}
