import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRateLimitGuard } from '../common/guards/auth-rate-limit.guard';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthRateLimitGuard)
  @Post('register')
  register(@Body() dto: SignupDto) { return this.authService.register(dto); }

  @UseGuards(AuthRateLimitGuard)
  @Post('login')
  login(@Body() dto: SigninDto) { return this.authService.login(dto); }
}
